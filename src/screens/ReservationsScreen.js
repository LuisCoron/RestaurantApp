import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme/colors';
import { AVAILABLE_TIMES } from '../data/mockData';

export default function ReservationsScreen() {
  const [selectedDay, setSelectedDay] = useState(18); // Default to tomorrow
  const [selectedTime, setSelectedTime] = useState('20:00');
  const [guestsCount, setGuestsCount] = useState(2);
  const [fullName, setFullName] = useState('');
  const [notes, setNotes] = useState('');

  // Generate days of May (31 days)
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const weekdays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
  
  // Simulated starting day of the week for May 2026 (May 1, 2026 was a Friday, which is index 5)
  const startDayOffset = 5;

  const handleConfirmReservation = () => {
    if (!fullName.trim()) {
      Alert.alert('Datos requeridos', 'Por favor ingresa tu nombre completo para la reservación.', [
        { text: 'Entendido' }
      ]);
      return;
    }

    Alert.alert(
      '🍷 ¡Reservación Confirmada!',
      `¡Todo listo, ${fullName}!\n\n📅 Fecha: ${selectedDay} de Mayo, 2026\n⏰ Hora: ${selectedTime}\n👥 Personas: ${guestsCount} pax\n\nHemos reservado la mejor mesa disponible para ti. ¡Te esperamos!`,
      [
        {
          text: '¡Excelente!',
          onPress: () => {
            // Reset form
            setFullName('');
            setNotes('');
            setGuestsCount(2);
            setSelectedDay(18);
            setSelectedTime('20:00');
          }
        }
      ]
    );
  };

  const handleGuestChange = (change) => {
    const newVal = guestsCount + change;
    if (newVal >= 1 && newVal <= 15) {
      setGuestsCount(newVal);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Reservaciones 🍷</Text>
            <Text style={styles.subtitle}>Reserva tu mesa ideal y evita esperas</Text>
          </View>

          {/* Date Picker (Simulated Calendar) */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>1. Selecciona el Día (Mayo 2026)</Text>
            <View style={styles.calendarCard}>
              <View style={styles.calendarHeaderRow}>
                {weekdays.map((day, index) => (
                  <Text key={index} style={styles.weekdayText}>{day}</Text>
                ))}
              </View>
              
              <View style={styles.calendarGrid}>
                {/* Empty slots for starting offset */}
                {Array.from({ length: startDayOffset }).map((_, index) => (
                  <View key={`empty-${index}`} style={styles.calendarDayEmpty} />
                ))}

                {/* Days of the month */}
                {daysInMonth.map((day) => {
                  const isSelected = selectedDay === day;
                  const isPast = day < 17; // Today is simulated as 17th of May
                  
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.calendarDayBtn,
                        isSelected && styles.calendarDayBtnSelected,
                        isPast && styles.calendarDayBtnPast
                      ]}
                      onPress={() => !isPast && setSelectedDay(day)}
                      disabled={isPast}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.calendarDayText,
                          isSelected && styles.calendarDayTextSelected,
                          isPast && styles.calendarDayTextPast
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Time Picker */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>2. Selecciona la Hora</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.timeScroll}
            >
              {AVAILABLE_TIMES.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeChip,
                      isSelected && styles.timeChipSelected
                    ]}
                    onPress={() => setSelectedTime(time)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={isSelected ? COLORS.background : COLORS.primary}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        styles.timeChipText,
                        isSelected && styles.timeChipTextSelected
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Guest Count Selector */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>3. Número de Comensales</Text>
            <View style={styles.guestSelectorCard}>
              <View style={styles.guestIconBox}>
                <Ionicons name="people-outline" size={24} color={COLORS.primary} />
                <Text style={styles.guestCurrentText}>{guestsCount} personas</Text>
              </View>
              
              <View style={styles.qtyContainer}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => handleGuestChange(-1)}
                  disabled={guestsCount <= 1}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={guestsCount <= 1 ? COLORS.border : COLORS.text}
                  />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{guestsCount}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => handleGuestChange(1)}
                >
                  <Ionicons name="add" size={20} color={COLORS.text} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Client Details Form */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>4. Datos de la Reservación</Text>
            
            <View style={styles.formCard}>
              <Text style={styles.inputLabel}>Nombre Completo *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={18} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej: Sofía Martínez"
                  placeholderTextColor={COLORS.textSecondary}
                  value={fullName}
                  onChangeText={setFullName}
                  keyboardAppearance="dark"
                />
              </View>

              <Text style={[styles.inputLabel, { marginTop: SIZES.medium }]}>Notas Especiales o Alergias</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <Ionicons
                  name="chatbox-ellipses-outline"
                  size={18}
                  color={COLORS.primary}
                  style={[styles.inputIcon, { marginTop: 12 }]}
                />
                <TextInput
                  style={[styles.textInput, styles.textAreaInput]}
                  placeholder="Ej: Mesa en terraza, al aire libre. Celebración de aniversario."
                  placeholderTextColor={COLORS.textSecondary}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  keyboardAppearance="dark"
                />
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleConfirmReservation}
            activeOpacity={0.9}
          >
            <Text style={styles.submitBtnText}>Confirmar Reservación</Text>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.background} style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <View style={styles.footerSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.medium,
  },
  header: {
    paddingTop: SIZES.base,
    marginBottom: SIZES.large,
  },
  title: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionContainer: {
    marginBottom: SIZES.large,
  },
  sectionTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.base + 2,
  },
  calendarCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  calendarHeaderRow: {
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
    width: 38,
    textAlign: 'center',
    fontSize: SIZES.small + 1,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  calendarDayEmpty: {
    width: (Dimensions.get('window').width - SIZES.medium * 4 - 24) / 7,
    height: 38,
    margin: 1.5,
  },
  calendarDayBtn: {
    width: (Dimensions.get('window').width - SIZES.medium * 4 - 24) / 7,
    height: 38,
    margin: 1.5,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 0.5,
    borderColor: 'transparent',
  },
  calendarDayBtnSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  calendarDayBtnPast: {
    backgroundColor: 'transparent',
    opacity: 0.25,
  },
  calendarDayText: {
    color: COLORS.text,
    fontSize: SIZES.font,
    fontWeight: '500',
  },
  calendarDayTextSelected: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  calendarDayTextPast: {
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  timeScroll: {
    paddingRight: SIZES.medium,
    paddingBottom: SIZES.base,
  },
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
  timeChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeChipText: {
    color: COLORS.text,
    fontSize: SIZES.font - 1,
    fontWeight: '600',
  },
  timeChipTextSelected: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  guestSelectorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  guestIconBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestCurrentText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    fontWeight: 'bold',
    marginLeft: SIZES.base,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    color: COLORS.text,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    paddingHorizontal: 12,
  },
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
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SIZES.base,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
  },
  inputIcon: {
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: SIZES.font,
    paddingVertical: SIZES.medium - 4,
  },
  textAreaInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: SIZES.medium,
    marginTop: SIZES.large,
  },
  submitBtnText: {
    color: COLORS.background,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  footerSpacing: {
    height: 50,
  },
});
