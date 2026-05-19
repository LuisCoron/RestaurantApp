import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme/colors';
import {
  loadReservations,
  addReservation,
  updateReservation,
  cancelReservation,
  deleteReservation,
  getTimeSlotsAvailability,
  AVAILABLE_TIMES,
  MAX_CAPACITY_PER_SLOT,
} from '../data/reservationsStore';

const { width } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────
// Calendar helpers
// ─────────────────────────────────────────────────────────
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const WEEKDAY_LABELS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

function toDateString(year, month, day) {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${parseInt(d)} de ${MONTH_NAMES[parseInt(m) - 1]}, ${y}`;
}

// ─────────────────────────────────────────────────────────
// VIEWS
// ─────────────────────────────────────────────────────────
const TAB_FORM = 'form';
const TAB_LIST = 'list';

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────
export default function ReservationsScreen() {
  const [activeTab, setActiveTab] = useState(TAB_FORM);
  const [reservations, setReservations] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Editing state – null means "new reservation"
  const [editingId, setEditingId] = useState(null);

  // Form state
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [guests, setGuests] = useState(2);
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [comments, setComments] = useState('');

  // Slot availability (recomputed when date or reservations change)
  const [slots, setSlots] = useState([]);

  // Modal for "cancel confirmation"
  const [cancelModalId, setCancelModalId] = useState(null);

  // ── Load reservations on mount and after changes ──
  const refreshReservations = useCallback(async () => {
    const all = await loadReservations();
    setReservations(all);
    setLoadingData(false);
  }, []);

  useEffect(() => {
    refreshReservations();
  }, [refreshReservations]);

  // ── Recompute slots whenever date or reservations change ──
  useEffect(() => {
    if (selectedDate) {
      const availability = getTimeSlotsAvailability(
        reservations,
        selectedDate,
        editingId
      );
      setSlots(availability);
      // Auto-deselect time if it became full
      if (selectedTime) {
        const slot = availability.find((s) => s.time === selectedTime);
        if (slot && slot.isFull) setSelectedTime(null);
      }
    }
  }, [selectedDate, reservations, editingId]);

  // ── Calendar navigation ──
  const goToPrevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  };
  const goToNextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  };

  // ── Day validation ──
  const isDayPast = (day) => {
    const d = new Date(calYear, calMonth, day);
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < todayMidnight;
  };

  // ── Form reset ──
  const resetForm = () => {
    const now = new Date();
    setCalYear(now.getFullYear());
    setCalMonth(now.getMonth());
    setSelectedDate(null);
    setSelectedTime(null);
    setGuests(2);
    setClientName('');
    setPhone('');
    setComments('');
    setEditingId(null);
  };

  // ── Start editing a reservation ──
  const handleEdit = (res) => {
    const [y, m, d] = res.date.split('-').map(Number);
    setCalYear(y);
    setCalMonth(m - 1);
    setSelectedDate(res.date);
    setSelectedTime(res.time);
    setGuests(res.guests);
    setClientName(res.clientName);
    setPhone(res.phone || '');
    setComments(res.comments || '');
    setEditingId(res.id);
    setActiveTab(TAB_FORM);
  };

  // ── Submit (create or update) ──
  const handleSubmit = async () => {
    // Validations
    if (!selectedDate) {
      return Alert.alert('Fecha requerida', 'Por favor selecciona una fecha para tu reservación.');
    }
    if (!selectedTime) {
      return Alert.alert('Hora requerida', 'Por favor selecciona un horario disponible.');
    }
    if (!clientName.trim()) {
      return Alert.alert('Nombre requerido', 'Por favor ingresa el nombre del cliente.');
    }
    if (!phone.trim()) {
      return Alert.alert('Teléfono requerido', 'Por favor ingresa un número de teléfono.');
    }
    const phoneClean = phone.replace(/\D/g, '');
    if (phoneClean.length < 7) {
      return Alert.alert('Teléfono inválido', 'Por favor ingresa un número de teléfono válido.');
    }

    setSubmitting(true);

    const data = {
      date: selectedDate,
      time: selectedTime,
      guests,
      clientName: clientName.trim(),
      phone: phone.trim(),
      comments: comments.trim(),
    };

    // Capture isEditing BEFORE resetForm() clears editingId
    const wasEditing = !!editingId;

    let result;
    if (editingId) {
      result = await updateReservation(editingId, data);
    } else {
      result = await addReservation(data);
    }

    setSubmitting(false);

    if (!result.success) {
      return Alert.alert('Horario no disponible', result.error);
    }

    await refreshReservations();
    resetForm();

    Alert.alert(
      wasEditing ? '✅ Reservación Actualizada' : '🍷 ¡Reservación Confirmada!',
      `${wasEditing ? 'Cambios guardados para' : '¡Todo listo,'} ${data.clientName}!\n\n📅 ${formatDateDisplay(data.date)}\n⏰ ${data.time}\n👥 ${data.guests} persona${data.guests > 1 ? 's' : ''}`,
      [{ text: '¡Excelente!', onPress: () => setActiveTab(TAB_LIST) }]
    );
  };

  // ── Cancel confirmation ──
  const handleCancelConfirm = async () => {
    if (!cancelModalId) return;
    await cancelReservation(cancelModalId);
    setCancelModalId(null);
    await refreshReservations();
  };

  // ── Delete (after cancel) ──
  const handleDelete = (id) => {
    Alert.alert(
      'Eliminar Reservación',
      '¿Eliminar permanentemente esta reservación?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteReservation(id);
            await refreshReservations();
          },
        },
      ]
    );
  };

  // ── Calendar render ──
  const renderCalendar = () => {
    const firstDow = getFirstDayOfWeek(calYear, calMonth);
    const daysCount = getDaysInMonth(calYear, calMonth);
    const daySize = Math.floor((width - SIZES.medium * 4 - 24) / 7);

    return (
      <View style={styles.calendarCard}>
        {/* Month navigation */}
        <View style={styles.calendarNav}>
          <TouchableOpacity onPress={goToPrevMonth} style={styles.calNavBtn}>
            <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.calMonthTitle}>
            {MONTH_NAMES[calMonth]} {calYear}
          </Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.calNavBtn}>
            <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Weekday headers */}
        <View style={styles.calHeaderRow}>
          {WEEKDAY_LABELS.map((d) => (
            <Text key={d} style={[styles.weekdayText, { width: daySize }]}>{d}</Text>
          ))}
        </View>

        {/* Grid */}
        <View style={styles.calendarGrid}>
          {Array.from({ length: firstDow }).map((_, i) => (
            <View key={`e-${i}`} style={{ width: daySize, height: 38, margin: 1.5 }} />
          ))}
          {Array.from({ length: daysCount }, (_, i) => i + 1).map((day) => {
            const dateStr = toDateString(calYear, calMonth, day);
            const past = isDayPast(day);
            const isSelected = selectedDate === dateStr;
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.calDayBtn,
                  { width: daySize, height: 38 },
                  isSelected && styles.calDayBtnSelected,
                  past && styles.calDayBtnPast,
                ]}
                onPress={() => !past && setSelectedDate(dateStr)}
                disabled={past}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.calDayText,
                    isSelected && styles.calDayTextSelected,
                    past && styles.calDayTextPast,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // ── Time slots render ──
  const renderTimeSlots = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.timeScroll}
    >
      {slots.map((slot) => {
        const isSelected = selectedTime === slot.time;
        const isFull = slot.isFull;
        return (
          <TouchableOpacity
            key={slot.time}
            style={[
              styles.timeChip,
              isSelected && styles.timeChipSelected,
              isFull && styles.timeChipFull,
            ]}
            onPress={() => !isFull && setSelectedTime(slot.time)}
            disabled={isFull}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isFull ? 'close-circle' : 'time-outline'}
              size={13}
              color={isSelected ? COLORS.background : isFull ? COLORS.error : COLORS.primary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.timeChipText,
                isSelected && styles.timeChipTextSelected,
                isFull && styles.timeChipTextFull,
              ]}
            >
              {slot.time}
            </Text>
            {!isFull && (
              <Text style={[styles.timeChipSub, isSelected && { color: COLORS.background + 'CC' }]}>
                {' '}{slot.available}p
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  // ── Reservation card ──
  const renderReservationCard = (res) => {
    // Parse date as LOCAL midnight to avoid UTC timezone offset making future dates appear as past
    const [ry, rm, rd] = res.date.split('-').map(Number);
    const isPast = new Date(ry, rm - 1, rd) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isCancelled = res.status === 'cancelada';
    return (
      <View
        key={res.id}
        style={[
          styles.resCard,
          isCancelled && styles.resCardCancelled,
        ]}
      >
        {/* Status badge */}
        <View style={styles.resCardHeader}>
          <View style={[
            styles.resBadge,
            isCancelled ? styles.resBadgeCancelled : isPast ? styles.resBadgePast : styles.resBadgeActive,
          ]}>
            <Text style={styles.resBadgeText}>
              {isCancelled ? '✕ Cancelada' : isPast ? '✓ Pasada' : '● Activa'}
            </Text>
          </View>
          <Text style={styles.resId}>{res.id}</Text>
        </View>

        {/* Info */}
        <View style={styles.resInfo}>
          <View style={styles.resRow}>
            <Ionicons name="person-outline" size={15} color={COLORS.primary} />
            <Text style={styles.resText}>{res.clientName}</Text>
          </View>
          <View style={styles.resRow}>
            <Ionicons name="call-outline" size={15} color={COLORS.primary} />
            <Text style={styles.resText}>{res.phone}</Text>
          </View>
          <View style={styles.resRow}>
            <Ionicons name="calendar-outline" size={15} color={COLORS.primary} />
            <Text style={styles.resText}>{formatDateDisplay(res.date)} • {res.time}</Text>
          </View>
          <View style={styles.resRow}>
            <Ionicons name="people-outline" size={15} color={COLORS.primary} />
            <Text style={styles.resText}>{res.guests} persona{res.guests > 1 ? 's' : ''}</Text>
          </View>
          {!!res.comments && (
            <View style={styles.resRow}>
              <Ionicons name="chatbox-ellipses-outline" size={15} color={COLORS.primary} />
              <Text style={[styles.resText, { flex: 1 }]} numberOfLines={2}>{res.comments}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        {!isCancelled && !isPast && (
          <View style={styles.resActions}>
            {/* Editar → carga el formulario con los datos de esta reservación */}
            <TouchableOpacity
              style={styles.resActionBtn}
              onPress={() => handleEdit(res)}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={16} color={COLORS.primary} />
              <Text style={styles.resActionText}>📝 Editar</Text>
            </TouchableOpacity>
            <View style={styles.resActionDivider} />
            {/* Eliminar → confirmación y borrado permanente */}
            <TouchableOpacity
              style={styles.resActionBtn}
              onPress={() => handleDelete(res.id)}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={16} color={COLORS.error} />
              <Text style={[styles.resActionText, { color: COLORS.error }]}>🗑 Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Pasadas o canceladas: solo Eliminar (estilo secundario) */}
        {(isCancelled || isPast) && (
          <TouchableOpacity
            style={styles.resDeleteBtn}
            onPress={() => handleDelete(res.id)}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.resDeleteText}>Eliminar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Reservaciones 🍷</Text>
        <Text style={styles.subtitle}>Reserva tu mesa ideal y evita esperas</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === TAB_FORM && styles.tabBtnActive]}
          onPress={() => { resetForm(); setActiveTab(TAB_FORM); }}
          activeOpacity={0.8}
        >
          <Ionicons
            name="add-circle-outline"
            size={16}
            color={activeTab === TAB_FORM ? COLORS.background : COLORS.primary}
            style={{ marginRight: 5 }}
          />
          <Text style={[styles.tabText, activeTab === TAB_FORM && styles.tabTextActive]}>
            {editingId ? 'Editando' : 'Nueva'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === TAB_LIST && styles.tabBtnActive]}
          onPress={() => { setActiveTab(TAB_LIST); }}
          activeOpacity={0.8}
        >
          <Ionicons
            name="list-outline"
            size={16}
            color={activeTab === TAB_LIST ? COLORS.background : COLORS.primary}
            style={{ marginRight: 5 }}
          />
          <Text style={[styles.tabText, activeTab === TAB_LIST && styles.tabTextActive]}>
            Mis Reservaciones {reservations.length > 0 ? `(${reservations.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* ── FORM TAB ── */}
        {activeTab === TAB_FORM && (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {editingId && (
              <View style={styles.editingBanner}>
                <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                <Text style={styles.editingBannerText}>Editando reservación</Text>
                <TouchableOpacity onPress={resetForm}>
                  <Ionicons name="close" size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            )}

            {/* 1. Date */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>1. Selecciona la Fecha</Text>
              {renderCalendar()}
              {selectedDate && (
                <View style={styles.selectedBadge}>
                  <Ionicons name="checkmark-circle" size={15} color={COLORS.success} />
                  <Text style={styles.selectedBadgeText}>{formatDateDisplay(selectedDate)}</Text>
                </View>
              )}
            </View>

            {/* 2. Time */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>2. Selecciona la Hora</Text>
              {!selectedDate ? (
                <Text style={styles.hintText}>Primero selecciona una fecha</Text>
              ) : renderTimeSlots()}
            </View>

            {/* 3. Guests */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>3. Número de Personas</Text>
              <View style={styles.guestCard}>
                <View style={styles.guestIconBox}>
                  <Ionicons name="people-outline" size={22} color={COLORS.primary} />
                  <Text style={styles.guestLabel}>{guests} persona{guests > 1 ? 's' : ''}</Text>
                </View>
                <View style={styles.qtyContainer}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => guests > 1 && setGuests((g) => g - 1)}
                    disabled={guests <= 1}
                  >
                    <Ionicons name="remove" size={20} color={guests <= 1 ? COLORS.border : COLORS.text} />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{guests}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => guests < MAX_CAPACITY_PER_SLOT && setGuests((g) => g + 1)}
                    disabled={guests >= MAX_CAPACITY_PER_SLOT}
                  >
                    <Ionicons name="add" size={20} color={guests >= MAX_CAPACITY_PER_SLOT ? COLORS.border : COLORS.text} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.capacityHint}>Máximo {MAX_CAPACITY_PER_SLOT} personas por horario</Text>
            </View>

            {/* 4. Client Details */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>4. Datos del Cliente</Text>
              <View style={styles.formCard}>
                {/* Name */}
                <Text style={styles.inputLabel}>Nombre Completo *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={17} color={COLORS.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: Sofía Martínez"
                    placeholderTextColor={COLORS.textSecondary}
                    value={clientName}
                    onChangeText={setClientName}
                    autoCapitalize="words"
                    keyboardAppearance="dark"
                  />
                </View>

                {/* Phone */}
                <Text style={[styles.inputLabel, { marginTop: SIZES.medium }]}>Teléfono *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={17} color={COLORS.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: 55 1234 5678"
                    placeholderTextColor={COLORS.textSecondary}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    keyboardAppearance="dark"
                  />
                </View>

                {/* Comments */}
                <Text style={[styles.inputLabel, { marginTop: SIZES.medium }]}>Comentarios Especiales</Text>
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <Ionicons
                    name="chatbox-ellipses-outline"
                    size={17}
                    color={COLORS.primary}
                    style={[styles.inputIcon, { marginTop: 12 }]}
                  />
                  <TextInput
                    style={[styles.textInput, styles.textAreaInput]}
                    placeholder="Ej: Mesa en terraza, aniversario, alergias..."
                    placeholderTextColor={COLORS.textSecondary}
                    value={comments}
                    onChangeText={setComments}
                    multiline
                    numberOfLines={3}
                    keyboardAppearance="dark"
                  />
                </View>
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.9}
            >
              {submitting ? (
                <ActivityIndicator color={COLORS.background} />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>
                    {editingId ? 'Guardar Cambios' : 'Confirmar Reservación'}
                  </Text>
                  <Ionicons
                    name={editingId ? 'save-outline' : 'checkmark-circle'}
                    size={20}
                    color={COLORS.background}
                    style={{ marginLeft: 6 }}
                  />
                </>
              )}
            </TouchableOpacity>

            <View style={{ height: 60 }} />
          </ScrollView>
        )}

        {/* ── LIST TAB ── */}
        {activeTab === TAB_LIST && (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {loadingData ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
            ) : reservations.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📅</Text>
                <Text style={styles.emptyTitle}>Sin reservaciones</Text>
                <Text style={styles.emptySubtitle}>Crea tu primera reservación en la pestaña "Nueva"</Text>
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => setActiveTab(TAB_FORM)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emptyBtnText}>Hacer Reservación</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Active reservations first */}
                {reservations.filter((r) => r.status === 'activa').length > 0 && (
                  <>
                    <Text style={styles.listSectionLabel}>Activas</Text>
                    {reservations
                      .filter((r) => r.status === 'activa')
                      .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
                      .map(renderReservationCard)}
                  </>
                )}
                {/* Cancelled */}
                {reservations.filter((r) => r.status === 'cancelada').length > 0 && (
                  <>
                    <Text style={[styles.listSectionLabel, { marginTop: SIZES.large }]}>Canceladas</Text>
                    {reservations
                      .filter((r) => r.status === 'cancelada')
                      .map(renderReservationCard)}
                  </>
                )}
              </>
            )}
            <View style={{ height: 60 }} />
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      {/* ── Cancel Confirmation Modal ── */}
      <Modal
        transparent
        visible={!!cancelModalId}
        animationType="fade"
        onRequestClose={() => setCancelModalId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="warning-outline" size={36} color={COLORS.error} style={{ marginBottom: 12 }} />
            <Text style={styles.modalTitle}>¿Cancelar Reservación?</Text>
            <Text style={styles.modalSubtitle}>
              Esta acción no puede deshacerse. La mesa quedará disponible para otros clientes.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtnSecondary}
                onPress={() => setCancelModalId(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalBtnSecondaryText}>Mantener</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnDanger}
                onPress={handleCancelConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.modalBtnDangerText}>Sí, Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: { paddingHorizontal: SIZES.medium, paddingTop: SIZES.base, paddingBottom: SIZES.base },
  title: { fontSize: SIZES.extraLarge, fontWeight: 'bold', color: COLORS.text },
  subtitle: { fontSize: SIZES.font, color: COLORS.textSecondary, marginTop: 2 },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: SIZES.medium,
    marginBottom: SIZES.medium,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 9,
  },
  tabBtnActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: SIZES.font - 1, color: COLORS.primary, fontWeight: '600' },
  tabTextActive: { color: COLORS.background },

  // Scroll
  scrollContent: { paddingHorizontal: SIZES.medium, paddingTop: SIZES.base },

  // Editing banner
  editingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(232, 168, 56, 0.1)',
    borderRadius: 10,
    padding: SIZES.base + 2,
    marginBottom: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
    gap: 6,
  },
  editingBannerText: { flex: 1, color: COLORS.primary, fontSize: SIZES.font - 1, fontWeight: '600' },

  // Section
  sectionContainer: { marginBottom: SIZES.large },
  sectionTitle: {
    fontSize: SIZES.medium - 1,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.base + 2,
  },

  // Selected badge
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  selectedBadgeText: { color: COLORS.success, fontSize: SIZES.font, fontWeight: '600' },

  // Hint
  hintText: { color: COLORS.textSecondary, fontSize: SIZES.font - 1, fontStyle: 'italic' },
  capacityHint: { color: COLORS.textSecondary, fontSize: SIZES.small, marginTop: 6 },

  // Calendar
  calendarCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  calendarNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calNavBtn: { padding: 6 },
  calMonthTitle: { color: COLORS.text, fontWeight: 'bold', fontSize: SIZES.medium },
  calHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.base,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    paddingBottom: SIZES.base,
  },
  weekdayText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: SIZES.small + 1,
  },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  calDayBtn: {
    margin: 1.5,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 0.5,
    borderColor: 'transparent',
  },
  calDayBtnSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  calDayBtnPast: { backgroundColor: 'transparent', opacity: 0.25 },
  calDayText: { color: COLORS.text, fontSize: SIZES.font, fontWeight: '500' },
  calDayTextSelected: { color: COLORS.background, fontWeight: 'bold' },
  calDayTextPast: { color: COLORS.textSecondary, textDecorationLine: 'line-through' },

  // Time slots
  timeScroll: { paddingRight: SIZES.medium, paddingBottom: SIZES.base },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.base + 2,
    marginRight: SIZES.base,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  timeChipFull: { opacity: 0.45, borderColor: COLORS.error + '50' },
  timeChipText: { color: COLORS.text, fontSize: SIZES.font - 1, fontWeight: '600' },
  timeChipTextSelected: { color: COLORS.background, fontWeight: 'bold' },
  timeChipTextFull: { textDecorationLine: 'line-through', color: COLORS.error },
  timeChipSub: { color: COLORS.textSecondary, fontSize: SIZES.small - 1, fontWeight: '500' },

  // Guests
  guestCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  guestIconBox: { flexDirection: 'row', alignItems: 'center' },
  guestLabel: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    fontWeight: 'bold',
    marginLeft: SIZES.base,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  qtyBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  qtyText: {
    color: COLORS.text,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    paddingHorizontal: 12,
  },

  // Form
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputLabel: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SIZES.base,
  },
  textAreaContainer: { alignItems: 'flex-start' },
  inputIcon: { marginRight: 6 },
  textInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: SIZES.font,
    paddingVertical: SIZES.medium - 4,
  },
  textAreaInput: { height: 80, textAlignVertical: 'top' },

  // Submit
  submitBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: SIZES.medium,
    marginTop: SIZES.large,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: COLORS.background, fontSize: SIZES.medium, fontWeight: 'bold' },

  // List
  listSectionLabel: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SIZES.base,
  },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: SIZES.large, fontWeight: 'bold', color: COLORS.text, marginBottom: 6 },
  emptySubtitle: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 20,
  },
  emptyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginTop: 24,
  },
  emptyBtnText: { color: COLORS.background, fontWeight: 'bold', fontSize: SIZES.medium - 1 },

  // Reservation Card
  resCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  resCardCancelled: { opacity: 0.65 },
  resCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.medium,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  resBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  resBadgeActive: { backgroundColor: 'rgba(76, 175, 80, 0.15)' },
  resBadgePast: { backgroundColor: 'rgba(160,160,192,0.12)' },
  resBadgeCancelled: { backgroundColor: 'rgba(239,83,80,0.12)' },
  resBadgeText: { fontSize: SIZES.small, fontWeight: '700', color: COLORS.textSecondary },
  resId: { fontSize: SIZES.small, color: COLORS.textSecondary },
  resInfo: { padding: SIZES.medium, gap: 8 },
  resRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resText: { color: COLORS.text, fontSize: SIZES.font - 1, flexShrink: 1 },
  resActions: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
  },
  resActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 5,
  },
  resActionBtnDanger: {},
  resActionDivider: { width: 0.5, backgroundColor: COLORS.border },
  resActionText: { color: COLORS.primary, fontWeight: '600', fontSize: SIZES.font - 1 },
  resDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    gap: 5,
  },
  resDeleteText: { color: COLORS.textSecondary, fontSize: SIZES.small, fontWeight: '500' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.large,
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: SIZES.large + 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalActions: { flexDirection: 'row', gap: 10, width: '100%' },
  modalBtnSecondary: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalBtnSecondaryText: { color: COLORS.text, fontWeight: '600' },
  modalBtnDanger: {
    flex: 1,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalBtnDangerText: { color: COLORS.white, fontWeight: 'bold' },
});
