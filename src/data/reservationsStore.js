import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const STORAGE_KEY = '@restaurant_reservations';

// Tabla de capacidad máxima por franja horaria
export const MAX_CAPACITY_PER_SLOT = 20;

// Horarios disponibles
export const AVAILABLE_TIMES = [
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
  '21:30',
  '22:00',
];

/**
 * Cargar reservaciones
 */
export async function loadReservations() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);

    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    Alert.alert(
      'Error',
      'No se pudieron cargar las reservaciones.'
    );

    console.error(
      'Error loading reservations:',
      e
    );

    return [];
  }
}

/**
 * Guardar reservaciones
 */
async function saveReservations(reservations) {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(reservations)
    );
  } catch (e) {
    Alert.alert(
      'Error',
      'No se pudieron guardar las reservaciones.'
    );

    console.error(
      'Error saving reservations:',
      e
    );
  }
}

/**
 * Agregar reservación
 */
export async function addReservation(data) {
  const all = await loadReservations();

  const occupied = getOccupiedGuests(
    all,
    data.date,
    data.time,
    null
  );

  if (
    occupied + data.guests >
    MAX_CAPACITY_PER_SLOT
  ) {
    const remaining =
      MAX_CAPACITY_PER_SLOT - occupied;

    Alert.alert(
      'Horario lleno',
      remaining <= 0
        ? 'Este horario ya está completamente ocupado.'
        : `Solo quedan ${remaining} lugares disponibles.`
    );

    return {
      success: false,
      error: 'Horario lleno',
    };
  }

  const newReservation = {
    id: `RES-${Date.now()}`,
    ...data,
    status: 'activa',
    createdAt: new Date().toISOString(),
  };

  const updated = [newReservation, ...all];

  await saveReservations(updated);

  Alert.alert(
    'Reservación confirmada',
    'Tu reservación fue creada correctamente.'
  );

  return {
    success: true,
    reservation: newReservation,
  };
}

/**
 * Actualizar reservación
 */
export async function updateReservation(
  id,
  data
) {
  const all = await loadReservations();

  const occupied = getOccupiedGuests(
    all,
    data.date,
    data.time,
    id
  );

  if (
    occupied + data.guests >
    MAX_CAPACITY_PER_SLOT
  ) {
    const remaining =
      MAX_CAPACITY_PER_SLOT - occupied;

    Alert.alert(
      'Horario lleno',
      remaining <= 0
        ? 'Este horario ya está completamente ocupado.'
        : `Solo quedan ${remaining} lugares disponibles.`
    );

    return {
      success: false,
      error: 'Horario lleno',
    };
  }

  const updated = all.map((r) =>
    r.id === id
      ? {
          ...r,
          ...data,
          updatedAt: new Date().toISOString(),
        }
      : r
  );

  await saveReservations(updated);

  Alert.alert(
    'Reservación actualizada',
    'Los cambios fueron guardados correctamente.'
  );

  return { success: true };
}

/**
 * Cancelar reservación
 */
export async function cancelReservation(id) {
  const all = await loadReservations();

  const updated = all.map((r) =>
    r.id === id
      ? { ...r, status: 'cancelada' }
      : r
  );

  await saveReservations(updated);

  Alert.alert(
    'Reservación cancelada',
    'La reservación fue cancelada correctamente.'
  );

  return { success: true };
}

/**
 * Eliminar reservación
 */
export async function deleteReservation(id) {
  const all = await loadReservations();

  const updated = all.filter(
    (r) => r.id !== id
  );

  await saveReservations(updated);

  Alert.alert(
    'Reservación eliminada',
    'La reservación fue eliminada.'
  );

  return { success: true };
}

/**
 * Calcular ocupación
 */
export function getOccupiedGuests(
  all,
  date,
  time,
  excludeId
) {
  return all
    .filter(
      (r) =>
        r.date === date &&
        r.time === time &&
        r.status === 'activa' &&
        r.id !== excludeId
    )
    .reduce(
      (sum, r) => sum + r.guests,
      0
    );
}

/**
 * Disponibilidad horarios
 */
export function getTimeSlotsAvailability(
  all,
  date,
  editingId = null
) {
  return AVAILABLE_TIMES.map((time) => {
    const occupied =
      getOccupiedGuests(
        all,
        date,
        time,
        editingId
      );

    const available =
      MAX_CAPACITY_PER_SLOT - occupied;

    return {
      time,
      occupied,
      available,
      isFull: available <= 0,
    };
  });
}
