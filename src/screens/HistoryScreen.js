import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme/colors';
import { historyStore } from '../data/cartStore';

const DATE_FILTERS = [
  { id: 'todos', name: 'Todos', emoji: '📜' },
  { id: 'hoy', name: 'Hoy', emoji: '📅' },
  { id: 'semana', name: 'Esta Semana', emoji: '🗓️' },
  { id: 'mes', name: 'Este Mes', emoji: '⏳' },
];

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState(historyStore.getHistory());
  const [selectedFilter, setSelectedFilter] = useState('todos');

  // Subscribe to historyStore updates
  useEffect(() => {
    const unsubscribe = historyStore.subscribe((newHistory) => {
      setHistory(newHistory);
    });
    // Sync initial state
    setHistory(historyStore.getHistory());
    return unsubscribe;
  }, []);

  // Matching logic for both historical mock data and real-time generated timestamps
  const matchesDateFilter = (item) => {
    if (selectedFilter === 'todos') return true;

    const dateStr = item.date.toLowerCase();

    // 1. "Hoy" filter
    if (selectedFilter === 'hoy') {
      return dateStr.includes('hoy') || dateStr.includes('17 de mayo');
    }

    // 2. "Esta Semana" filter (corresponds to Mayo 11 to Mayo 17, 2026)
    if (selectedFilter === 'semana') {
      if (dateStr.includes('hoy') || dateStr.includes('ayer')) return true;

      // Extract day from dates like "15 de Mayo"
      const dayMatch = dateStr.match(/(\d+)\s+de\s+mayo/);
      if (dayMatch) {
        const day = parseInt(dayMatch[1], 10);
        return day >= 11 && day <= 17;
      }
      return false;
    }

    // 3. "Este Mes" filter (corresponds to Mayo/May)
    if (selectedFilter === 'mes') {
      return dateStr.includes('mayo') || dateStr.includes('hoy') || dateStr.includes('ayer');
    }

    return true;
  };

  // Helper to dynamically calculate quantities inside each date chip
  const getFilterCount = (filterId) => {
    return history.filter((item) => {
      const dateStr = item.date.toLowerCase();
      if (filterId === 'todos') return true;
      if (filterId === 'hoy') return dateStr.includes('hoy') || dateStr.includes('17 de mayo');
      if (filterId === 'semana') {
        if (dateStr.includes('hoy') || dateStr.includes('ayer')) return true;
        const dayMatch = dateStr.match(/(\d+)\s+de\s+mayo/);
        if (dayMatch) {
          const day = parseInt(dayMatch[1], 10);
          return day >= 11 && day <= 17;
        }
        return false;
      }
      if (filterId === 'mes') return dateStr.includes('mayo') || dateStr.includes('hoy') || dateStr.includes('ayer');
      return true;
    }).length;
  };

  const filteredHistory = history.filter(matchesDateFilter);

  const renderFilterChip = ({ item }) => {
    const isSelected = selectedFilter === item.id;
    const count = getFilterCount(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.chip,
          isSelected && styles.chipSelected
        ]}
        onPress={() => setSelectedFilter(item.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.chipEmoji}>{item.emoji}</Text>
        <Text
          style={[
            styles.chipText,
            isSelected && styles.chipTextSelected
          ]}
        >
          {`${item.name} (${count})`}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderHistoryItem = ({ item }) => {
    const itemCount = item.items.filter(i => i.price > 0).reduce((sum, i) => sum + (i.qty || 1), 0);

    return (
      <TouchableOpacity
        style={styles.historyCard}
        onPress={() => navigation.navigate('HistoryDetail', { order: item })}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.orderIdContainer}>
            <Ionicons name="receipt-outline" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.orderId}>{item.id}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.orderDate}>{item.date}</Text>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.itemCountText}>
              {`${itemCount} ${itemCount === 1 ? 'platillo' : 'platillos'}`}
            </Text>
            <Text style={styles.itemsSummary} numberOfLines={1}>
              {item.items.filter(i => i.price > 0).map(i => i.name).join(', ')}
            </Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.totalPrice}>{`$${item.total.toFixed(2)}`}</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.primary} style={{ marginLeft: 4 }} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Historial de Pedidos 📜</Text>
        <Text style={styles.subtitle}>Tus visitas y ordenes anteriores</Text>
      </View>

      {/* Sleek Date Filter Chips */}
      <View style={styles.filterContainer}>
        <FlatList
          data={DATE_FILTERS}
          renderItem={renderFilterChip}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Dynamic List */}
      <FlatList
        data={filteredHistory}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No tienes pedidos registrados en este período.</Text>
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
    paddingHorizontal: SIZES.medium,
    paddingTop: SIZES.medium,
    marginBottom: SIZES.base,
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
  filterContainer: {
    marginVertical: SIZES.base,
  },
  filterList: {
    paddingHorizontal: SIZES.medium,
    paddingBottom: SIZES.base,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.base,
    marginRight: SIZES.base,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipEmoji: {
    fontSize: SIZES.medium,
    marginRight: 6,
  },
  chipText: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: SIZES.medium,
    paddingTop: SIZES.base,
    paddingBottom: 80,
  },
  historyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: SIZES.medium,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderId: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statusBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: COLORS.success,
  },
  statusText: {
    color: COLORS.success,
    fontSize: SIZES.small,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: SIZES.small + 1,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base,
    marginLeft: 24,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.base,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCountText: {
    fontSize: SIZES.small + 1,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemsSummary: {
    fontSize: SIZES.font - 1,
    color: COLORS.text,
    width: 180,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalPrice: {
    fontSize: SIZES.large - 1,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyText: {
    color: COLORS.textSecondary,
    marginTop: SIZES.medium,
    fontSize: SIZES.font,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});
