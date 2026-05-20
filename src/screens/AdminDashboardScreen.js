import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SIZES } from '../theme/colors';
import { historyStore } from '../data/cartStore';
import { loadReservations } from '../data/reservationsStore';
import { menuStore } from '../data/menuStore';

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen({ navigation }) {
  const [orders, setOrders] = useState(historyStore.getHistory());
  const [reservations, setReservations] = useState([]);
  const [menu, setMenu] = useState(menuStore.getMenu());

  // Subscribe to store updates
  useEffect(() => {
    const unsubOrders = historyStore.subscribe(setOrders);
    const unsubMenu = menuStore.subscribe(setMenu);
    setOrders(historyStore.getHistory());
    setMenu(menuStore.getMenu());
    return () => {
      unsubOrders();
      unsubMenu();
    };
  }, []);

  // Reload reservations when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadReservations().then(setReservations);
    }, [])
  );

  // Helper to check if a date is "today"
  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const todayStr = '2026-05-19'; // Local current date from metadata
    return (
      dateStr.includes('Hoy') ||
      dateStr.includes(todayStr) ||
      dateStr.includes(new Date().toISOString().split('T')[0])
    );
  };

  // ── Stats Calculations ──
  
  // 1. Ingresos diarios (only completed/delivered/active orders of today)
  const dailyRevenue = orders
    .filter(order => isToday(order.date) && order.status !== 'Cancelado')
    .reduce((sum, order) => sum + order.total, 0);

  // 2. Pedidos completados (all-time completed or delivered orders)
  const completedOrdersCount = orders.filter(
    order => order.status === 'Completado' || order.status === 'Entregado'
  ).length;

  // 3. Reservaciones del día (active reservations of today)
  const dailyReservationsCount = reservations.filter(
    res => isToday(res.date) && res.status === 'activa'
  ).length;

  // 4. Platillos más vendidos (aggregate item counts from order history)
  const getMostSoldDishes = () => {
    const itemCounts = {};
    orders.forEach(order => {
      if (order.status !== 'Cancelado') {
        order.items.forEach(item => {
          if (item.price > 0) { // Exclude discounts
            const name = item.name;
            itemCounts[name] = (itemCounts[name] || 0) + item.qty;
          }
        });
      }
    });

    const sorted = Object.keys(itemCounts).map(name => {
      // Find matching item to get emoji
      const menuItem = menu.find(m => m.name === name);
      return {
        name,
        qty: itemCounts[name],
        emoji: menuItem ? menuItem.emoji : '🍽️',
      };
    });

    return sorted.sort((a, b) => b.qty - a.qty).slice(0, 3);
  };

  const topSoldDishes = getMostSoldDishes();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Panel de Control</Text>
            <Text style={styles.appName}>Administración 🛡️</Text>
          </View>
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
        </View>

        {/* Section title */}
        <Text style={styles.sectionTitle}>Resumen del día</Text>

        {/* 2x2 Grid of Stats */}
        <View style={styles.statsGrid}>
          {/* Card 1: Ingresos Diarios */}
          <View style={[styles.statCard, { borderColor: 'rgba(76,175,80,0.25)' }]}>
            <View style={[styles.iconBg, { backgroundColor: 'rgba(76,175,80,0.12)' }]}>
              <Ionicons name="cash" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.statLabel}>Ingresos Hoy</Text>
            <Text style={styles.statValue}>${dailyRevenue.toFixed(0)}</Text>
          </View>

          {/* Card 2: Pedidos Completados */}
          <View style={[styles.statCard, { borderColor: 'rgba(217,119,6,0.25)' }]}>
            <View style={[styles.iconBg, { backgroundColor: 'rgba(217,119,6,0.12)' }]}>
              <Ionicons name="checkmark-done" size={20} color="#D97706" />
            </View>
            <Text style={styles.statLabel}>Ped. Completados</Text>
            <Text style={styles.statValue}>{completedOrdersCount}</Text>
          </View>

          {/* Card 3: Reservas de Hoy */}
          <View style={[styles.statCard, { borderColor: 'rgba(29,78,216,0.25)' }]}>
            <View style={[styles.iconBg, { backgroundColor: 'rgba(29,78,216,0.12)' }]}>
              <Ionicons name="calendar" size={20} color="#1D4ED8" />
            </View>
            <Text style={styles.statLabel}>Reservas Hoy</Text>
            <Text style={styles.statValue}>{dailyReservationsCount}</Text>
          </View>

          {/* Card 4: Platillos Activos */}
          <View style={[styles.statCard, { borderColor: 'rgba(126,34,206,0.25)' }]}>
            <View style={[styles.iconBg, { backgroundColor: 'rgba(126,34,206,0.12)' }]}>
              <Ionicons name="restaurant" size={20} color="#7E22CE" />
            </View>
            <Text style={styles.statLabel}>Platillos Activos</Text>
            <Text style={styles.statValue}>{menu.length}</Text>
          </View>
        </View>

        {/* Section: Most Sold Dishes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleInside}>🏆 Ránking de Ventas</Text>
          <View style={styles.rankingCard}>
            {topSoldDishes.length === 0 ? (
              <Text style={styles.emptyText}>Aún no hay ventas registradas.</Text>
            ) : (
              topSoldDishes.map((dish, idx) => (
                <View key={dish.name} style={styles.rankingRow}>
                  <Text style={styles.rankNum}>{idx + 1}</Text>
                  <Text style={styles.rankEmoji}>{dish.emoji}</Text>
                  <Text style={styles.rankName} numberOfLines={1}>{dish.name}</Text>
                  <View style={styles.qtyBadge}>
                    <Text style={styles.qtyBadgeText}>{dish.qty} vendidas</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Section: Quick Actions */}
        <Text style={styles.sectionTitle}>Módulos de Gestión</Text>
        
        <View style={styles.actionsContainer}>
          {/* Action 1: Manage Dishes */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('AdminDishes')}
            activeOpacity={0.85}
          >
            <View style={[styles.actionIconBg, { backgroundColor: 'rgba(232,168,56,0.1)' }]}>
              <Ionicons name="restaurant-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Gestionar Platillos</Text>
              <Text style={styles.actionSubtitle}>Agregar, editar o eliminar productos del menú</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Action 2: Manage Orders */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('AdminOrders')}
            activeOpacity={0.85}
          >
            <View style={[styles.actionIconBg, { backgroundColor: 'rgba(76,175,80,0.1)' }]}>
              <Ionicons name="cart-outline" size={24} color="#4CAF50" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Gestionar Pedidos</Text>
              <Text style={styles.actionSubtitle}>Controlar pedidos en cocina y cambiar su estado</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Action 3: Manage Reservations */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('AdminReservations')}
            activeOpacity={0.85}
          >
            <View style={[styles.actionIconBg, { backgroundColor: 'rgba(29,78,216,0.1)' }]}>
              <Ionicons name="calendar-outline" size={24} color="#1D4ED8" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Gestionar Reservaciones</Text>
              <Text style={styles.actionSubtitle}>Ver, reprogramar o cambiar estado de las mesas</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.large,
  },
  greeting: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
  },
  appName: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  adminBadge: {
    backgroundColor: 'rgba(232, 168, 56, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  adminBadgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: SIZES.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - SIZES.medium * 2 - 10) / 2,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    padding: SIZES.medium,
    gap: 6,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  statLabel: {
    fontSize: SIZES.small + 1,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  statValue: {
    fontSize: SIZES.extraLarge - 2,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  section: {
    marginVertical: SIZES.large,
  },
  sectionTitleInside: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.medium,
  },
  rankingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    padding: SIZES.medium,
    gap: 12,
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rankNum: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
    color: COLORS.primary,
    width: 15,
  },
  rankEmoji: {
    fontSize: 18,
  },
  rankName: {
    flex: 1,
    fontSize: SIZES.font,
    color: COLORS.text,
    fontWeight: '500',
  },
  qtyBadge: {
    backgroundColor: 'rgba(232, 168, 56, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(232, 168, 56, 0.2)',
  },
  qtyBadgeText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.font,
    textAlign: 'center',
    paddingVertical: 10,
  },
  actionsContainer: {
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SIZES.medium,
    gap: 12,
  },
  actionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    lineHeight: 14,
  },
});
