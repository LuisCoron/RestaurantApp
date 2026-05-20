import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme/colors';
import {
  loadReservations,
  cancelReservation,
  deleteReservation,
  updateReservation,
  AVAILABLE_TIMES,
  MAX_CAPACITY_PER_SLOT,
  getOccupiedGuests,
} from '../data/reservationsStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const OCCASIONS = ['Cumpleaños', 'Aniversario', 'Cita Romántica', 'Reunión de Negocios', 'Cena Familiar', 'Casual / Otro'];

export default function AdminReservationsScreen({ navigation }) {
  const [reservations, setReservations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todas'); // Todas | Activas | Canceladas

  // Modal editing state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [guests, setGuests] = useState('2');
  const [date, setDate] = useState('2026-05-19');
  const [time, setTime] = useState('19:00');
  const [occasion, setOccasion] = useState('Casual / Otro');
  const [requests, setRequests] = useState('');

  const fetchReservations = useCallback(async () => {
    const list = await loadReservations();
    setReservations(list);
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const filteredReservations = reservations.filter(res => {
    const nameMatch = res.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      res.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'Todas') return nameMatch;
    if (statusFilter === 'Activas') return nameMatch && res.status === 'activa';
    if (statusFilter === 'Canceladas') return nameMatch && res.status === 'cancelada';
    return nameMatch;
  });

  const handleOpenEdit = (res) => {
    setEditingId(res.id);
    setName(res.name);
    setPhone(res.phone || '');
    setGuests(res.guests.toString());
    setDate(res.date);
    setTime(res.time);
    setOccasion(res.occasion || 'Casual / Otro');
    setRequests(res.requests || '');
    setIsModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor, ingresa el nombre del cliente.');
      return;
    }

    const guestsNum = parseInt(guests);
    if (isNaN(guestsNum) || guestsNum <= 0) {
      Alert.alert('Error', 'La cantidad de personas debe ser mayor a cero.');
      return;
    }

    // Prepare updated data structure
    const updatedData = {
      name: name.trim(),
      phone: phone.trim(),
      guests: guestsNum,
      date,
      time,
      occasion,
      requests: requests.trim(),
      status: 'activa', // Re-activate if updated
    };

    const res = await updateReservation(editingId, updatedData);

    if (res.success) {
      Alert.alert('✨ Éxito', 'La reservación ha sido modificada y reprogramada con éxito.');
      setIsModalOpen(false);
      fetchReservations();
    } else {
      Alert.alert('Capacidad Superada', res.error || 'No hay suficiente disponibilidad para ese horario.');
    }
  };

  const handleCancel = (id, name) => {
    Alert.alert(
      'Cancelar Reservación',
      `¿Deseas cancelar la reservación de "${name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            await cancelReservation(id);
            fetchReservations();
          },
        },
      ]
    );
  };

  const handleDelete = (id, name) => {
    Alert.alert(
      '🚨 Eliminar Permanentemente',
      `¿Estás seguro de que deseas eliminar permanentemente la reservación de "${name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteReservation(id);
            fetchReservations();
          },
        },
      ]
    );
  };

  const renderReservationCard = ({ item }) => {
    const isActiva = item.status === 'activa';
    return (
      <View style={[styles.card, !isActiva && styles.cardInactive]}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.headerInfo}>
            <Text style={styles.clientName}>{item.name}</Text>
            {item.phone ? <Text style={styles.clientPhone}>📞 {item.phone}</Text> : null}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isActiva ? 'rgba(76,175,80,0.15)' : 'rgba(239,68,68,0.15)' }]}>
            <Text style={[styles.statusBadgeText, { color: isActiva ? '#4CAF50' : '#EF4444' }]}>
              {isActiva ? 'Activa' : 'Cancelada'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Reservation details */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.detailText}>{item.date}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.detailText}>{item.time} hrs</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="people-outline" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.detailText}>{item.guests} personas</Text>
          </View>
          {item.occasion ? (
            <View style={styles.detailItem}>
              <Ionicons name="sparkles-outline" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
              <Text style={styles.detailText}>{item.occasion}</Text>
            </View>
          ) : null}
        </View>

        {item.requests ? (
          <View style={styles.requestBox}>
            <Text style={styles.requestLabel}>Notas Especiales:</Text>
            <Text style={styles.requestText}>{item.requests}</Text>
          </View>
        ) : null}

        <View style={styles.divider} />

        {/* Card Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDelete(item.id, item.name)}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={15} color={COLORS.error} />
            <Text style={styles.deleteBtnText}>Eliminar</Text>
          </TouchableOpacity>

          <View style={styles.rightActions}>
            {isActiva && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={() => handleCancel(item.id, item.name)}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle-outline" size={15} color={COLORS.textSecondary} />
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionBtn, styles.editBtn]}
              onPress={() => handleOpenEdit(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={15} color={COLORS.primary} />
              <Text style={styles.editBtnText}>Editar / Reprogramar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Reservaciones 📅</Text>
          <Text style={styles.subtitle}>Supervisar asignación de mesas y cupo</Text>
        </View>
      </View>

      {/* Search & Filtering */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por cliente o teléfono..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Status Tabs */}
      <View style={styles.filterTabs}>
        {['Todas', 'Activas', 'Canceladas'].map(tab => {
          const isActive = statusFilter === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setStatusFilter(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Reservations List */}
      <FlatList
        data={filteredReservations}
        renderItem={renderReservationCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No hay reservaciones que coincidan.</Text>
          </View>
        }
      />

      {/* Edit Reservation Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Reservación</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Form */}
            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              
              {/* Client Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Nombre del Cliente *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ej: Sofía Pérez"
                  placeholderTextColor={COLORS.textSecondary}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Phone */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Teléfono de Contacto</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ej: 5512345678"
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              {/* Guests and Date */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { width: 100, marginRight: 10 }]}>
                  <Text style={styles.formLabel}>Personas *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="2"
                    placeholderTextColor={COLORS.textSecondary}
                    keyboardType="numeric"
                    value={guests}
                    onChangeText={setGuests}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Fecha (AAAA-MM-DD) *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={COLORS.textSecondary}
                    value={date}
                    onChangeText={setDate}
                  />
                </View>
              </View>

              {/* Time selection */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Horario Disponible</Text>
                <View style={styles.timeSelectorRow}>
                  {AVAILABLE_TIMES.map(t => {
                    const isSelected = time === t;
                    return (
                      <TouchableOpacity
                        key={t}
                        style={[styles.timeChip, isSelected && styles.timeChipActive]}
                        onPress={() => setTime(t)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.timeChipText, isSelected && styles.timeChipTextActive]}>
                          {t}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Occasion */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Ocasión Especial</Text>
                <View style={styles.occasionSelectorRow}>
                  {OCCASIONS.map(occ => {
                    const isSelected = occasion === occ;
                    return (
                      <TouchableOpacity
                        key={occ}
                        style={[styles.occChip, isSelected && styles.occChipActive]}
                        onPress={() => setOccasion(occ)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.occChipText, isSelected && styles.occChipTextActive]}>
                          {occ}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Requests */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Peticiones Especiales / Notas</Text>
                <TextInput
                  style={[styles.formInput, styles.formMultilineInput]}
                  placeholder="Alergias, preferencia de mesa exterior, etc..."
                  placeholderTextColor={COLORS.textSecondary}
                  multiline
                  numberOfLines={3}
                  value={requests}
                  onChangeText={setRequests}
                />
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsModalOpen(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveEdit}
                activeOpacity={0.9}
              >
                <Text style={styles.saveBtnText}>Guardar Cambios</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.medium,
    paddingTop: SIZES.medium,
    marginBottom: SIZES.medium,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.medium,
  },
  headerTitleContainer: {
    flex: 1,
  },
  title: {
    fontSize: SIZES.extraLarge - 2,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  searchRow: {
    paddingHorizontal: SIZES.medium,
    marginBottom: SIZES.base,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.base + 2,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: SIZES.font,
    padding: 0,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.medium,
    gap: 8,
    marginVertical: SIZES.base,
  },
  tab: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: SIZES.font - 1,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: SIZES.medium,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
  },
  cardInactive: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerInfo: {
    flex: 1,
    marginRight: 10,
  },
  clientName: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  clientPhone: {
    fontSize: SIZES.small + 1,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: SIZES.small,
    fontWeight: 'bold',
  },
  divider: {
    height: 0.5,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: SIZES.small + 1,
    color: COLORS.text,
    fontWeight: '500',
  },
  requestBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 0.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
  },
  requestLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  requestText: {
    fontSize: SIZES.small + 1,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  deleteBtn: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  deleteBtnText: {
    color: COLORS.error,
    fontSize: SIZES.small,
    fontWeight: 'bold',
  },
  rightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    borderColor: COLORS.border,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.small,
    fontWeight: 'bold',
  },
  editBtn: {
    borderColor: 'rgba(232, 168, 56, 0.3)',
    backgroundColor: 'rgba(232, 168, 56, 0.05)',
  },
  editBtnText: {
    color: COLORS.primary,
    fontSize: SIZES.small,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    gap: 10,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.font,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: SCREEN_HEIGHT * 0.85,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.medium + 4,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    padding: SIZES.large,
  },
  formGroup: {
    marginBottom: SIZES.large,
  },
  formLabel: {
    fontSize: SIZES.small + 1,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.medium - 4,
    color: COLORS.text,
    fontSize: SIZES.font,
  },
  formMultilineInput: {
    textAlignVertical: 'top',
    paddingTop: SIZES.small,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: SIZES.base,
  },
  timeSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  timeChipActive: {
    backgroundColor: 'rgba(232, 168, 56, 0.1)',
    borderColor: COLORS.primary,
  },
  timeChipText: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  timeChipTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  occasionSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  occChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  occChipActive: {
    backgroundColor: 'rgba(232, 168, 56, 0.1)',
    borderColor: COLORS.primary,
  },
  occChipText: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  occChipTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    padding: SIZES.large,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    gap: 12,
    backgroundColor: COLORS.card,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SIZES.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: COLORS.text,
    fontSize: SIZES.font,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: SIZES.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    color: COLORS.background,
    fontSize: SIZES.font,
    fontWeight: 'bold',
  },
});
