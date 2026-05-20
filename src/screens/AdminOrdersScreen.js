import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme/colors';
import { historyStore } from '../data/cartStore';

const STATUSES = ['Todos', 'En Cocina', 'Listo para Entrega', 'Entregado', 'Cancelado'];

export default function AdminOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState(historyStore.getHistory());
  const [selectedStatus, setSelectedStatus] = useState('Todos');

  // Subscribe to historyStore updates
  useEffect(() => {
    const unsub = historyStore.subscribe(setOrders);
    setOrders(historyStore.getHistory());
    return () => unsub();
  }, []);

  const filteredOrders = orders.filter(order => {
    if (selectedStatus === 'Todos') return true;
    return order.status === selectedStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'En Cocina':
        return { bg: 'rgba(217,119,6,0.15)', text: '#D97706' };
      case 'Listo para Entrega':
        return { bg: 'rgba(29,78,216,0.15)', text: '#1D4ED8' };
      case 'Entregado':
      case 'Completado':
        return { bg: 'rgba(76,175,80,0.15)', text: '#4CAF50' };
      case 'Cancelado':
        return { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' };
      default:
        return { bg: 'rgba(255,255,255,0.05)', text: COLORS.textSecondary };
    }
  };

  const handleUpdateStatus = (orderId, currentStatus, actionType) => {
    let nextStatus = '';
    if (actionType === 'progress') {
      if (currentStatus === 'En Cocina') {
        nextStatus = 'Listo para Entrega';
      } else if (currentStatus === 'Listo para Entrega') {
        nextStatus = 'Entregado';
      }
    } else if (actionType === 'cancel') {
      nextStatus = 'Cancelado';
    }

    if (nextStatus) {
      historyStore.updateOrderStatus(orderId, nextStatus);
    }
  };

  const handleCustomStatusChange = (orderId, newStatus) => {
    historyStore.updateOrderStatus(orderId, newStatus);
  };

  const renderOrderItem = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    const hasProgressAction = item.status === 'En Cocina' || item.status === 'Listo para Entrega';

    return (
      <View style={styles.orderCard}>
        {/* Card Header */}
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>{item.id}</Text>
            <Text style={styles.orderDate}>{item.date}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusColor.text }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Items List */}
        <View style={styles.itemsList}>
          {item.items.map((dish, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>
                {dish.qty}x {dish.name}
              </Text>
              <Text style={styles.itemPrice}>${(dish.price * dish.qty).toFixed(0)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Total Row */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${item.total.toFixed(2)}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {item.status !== 'Entregado' && item.status !== 'Cancelado' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn]}
              onPress={() => {
                Alert.alert(
                  'Cancelar Pedido',
                  `¿Estás seguro de que deseas marcar el pedido ${item.id} como Cancelado?`,
                  [
                    { text: 'No', style: 'cancel' },
                    { text: 'Sí, cancelar', style: 'destructive', onPress: () => handleUpdateStatus(item.id, item.status, 'cancel') }
                  ]
                );
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          )}

          {hasProgressAction && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.progressBtn]}
              onPress={() => handleUpdateStatus(item.id, item.status, 'progress')}
              activeOpacity={0.8}
            >
              <Text style={styles.progressBtnText}>
                {item.status === 'En Cocina' ? 'Listo para Entregar' : 'Entregado'}
              </Text>
              <Ionicons
                name={item.status === 'En Cocina' ? 'chevron-forward' : 'checkmark-done'}
                size={16}
                color={COLORS.background}
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          )}
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
          <Text style={styles.title}>Gestión de Pedidos 📦</Text>
          <Text style={styles.subtitle}>Supervisar y despachar pedidos en tiempo real</Text>
        </View>
      </View>

      {/* Filter Status Chips */}
      <View style={styles.statusChipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {STATUSES.map(stat => {
            const isSelected = selectedStatus === stat;
            return (
              <TouchableOpacity
                key={stat}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => setSelectedStatus(stat)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {stat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No hay pedidos con el estado seleccionado.</Text>
          </View>
        }
      />
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
  statusChipsContainer: {
    marginVertical: SIZES.base,
  },
  chipsScroll: {
    paddingHorizontal: SIZES.medium,
    paddingBottom: SIZES.base,
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: SIZES.font - 1,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: SIZES.medium,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  orderDate: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginTop: 2,
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
  itemsList: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: SIZES.font,
    color: COLORS.text,
    flex: 1,
    marginRight: 10,
  },
  itemPrice: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  totalLabel: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  cancelBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  cancelBtnText: {
    color: COLORS.error,
    fontSize: SIZES.small + 1,
    fontWeight: 'bold',
  },
  progressBtn: {
    backgroundColor: COLORS.primary,
  },
  progressBtnText: {
    color: COLORS.background,
    fontSize: SIZES.small + 1,
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
    textAlign: 'center',
  },
});
