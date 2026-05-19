import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@restaurant_reservations';

// Tabla de capacidad máxima por franja horaria
export const MAX_CAPACITY_PER_SLOT = 20; // personas máximas por horario

// Horarios disponibles del restaurante
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
 * Carga todas las reservaciones guardadas
 */
export async function loadReservations() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error loading reservations:', e);
    return [];
  }
}

/**
 * Guarda la lista completa de reservaciones
 */
async function saveReservations(reservations) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
  } catch (e) {
    console.error('Error saving reservations:', e);
  }
}

/**
 * Agrega una nueva reservación.
 * Retorna { success, error } 
 */
export async function addReservation(data) {
  const all = await loadReservations();

  // Calcular ocupación actual para esa fecha + hora (excluyendo canceladas)
  const occupied = getOccupiedGuests(all, data.date, data.time, null);
  if (occupied + data.guests > MAX_CAPACITY_PER_SLOT) {
    const remaining = MAX_CAPACITY_PER_SLOT - occupied;
    return {
      success: false,
      error:
        remaining <= 0
          ? `Este horario ya está completamente ocupado.`
          : `Solo quedan ${remaining} lugares disponibles en este horario.`,
    };
  }

  const newReservation = {
    id: `RES-${Date.now()}`,
    ...data,
    status: 'activa', // activa | cancelada
    createdAt: new Date().toISOString(),
  };

  const updated = [newReservation, ...all];
  await saveReservations(updated);
  return { success: true, reservation: newReservation };
}

/**
 * Actualiza una reservación existente.
 */
export async function updateReservation(id, data) {
  const all = await loadReservations();

  // Calcular ocupación excluyendo la reservación que se edita
  const occupied = getOccupiedGuests(all, data.date, data.time, id);
  if (occupied + data.guests > MAX_CAPACITY_PER_SLOT) {
    const remaining = MAX_CAPACITY_PER_SLOT - occupied;
    return {
      success: false,
      error:
        remaining <= 0
          ? `Este horario ya está completamente ocupado.`
          : `Solo quedan ${remaining} lugares disponibles en este horario.`,
    };
  }

  const updated = all.map((r) =>
    r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r
  );
  await saveReservations(updated);
  return { success: true };
}

/**
 * Cancela una reservación por ID.
 */
export async function cancelReservation(id) {
  const all = await loadReservations();
  const updated = all.map((r) =>
    r.id === id ? { ...r, status: 'cancelada' } : r
  );
  await saveReservations(updated);
  return { success: true };
}

/**
 * Elimina permanentemente una reservación.
 */
export async function deleteReservation(id) {
  const all = await loadReservations();
  const updated = all.filter((r) => r.id !== id);
  await saveReservations(updated);
  return { success: true };
}

/**
 * Cuenta cuántos invitados ya hay en una fecha+hora, excluyendo una reservación (para edición).
 */
export function getOccupiedGuests(all, date, time, excludeId) {
  return all
    .filter(
      (r) =>
        r.date === date &&
        r.time === time &&
        r.status === 'activa' &&
        r.id !== excludeId
    )
    .reduce((sum, r) => sum + r.guests, 0);
}

/**
 * Retorna los horarios con su disponibilidad para una fecha dada.
 * { time, occupied, available, isFull }
 */
export function getTimeSlotsAvailability(all, date, editingId = null) {
  return AVAILABLE_TIMES.map((time) => {
    const occupied = getOccupiedGuests(all, date, time, editingId);
    const available = MAX_CAPACITY_PER_SLOT - occupied;
    return {
      time,
      occupied,
      available,
      isFull: available <= 0,
    };
  });
}
