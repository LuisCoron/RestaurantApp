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

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState(historyStore.getHistory());

  // Subscribe to historyStore updates
  useEffect(() => {
    const unsubscribe = historyStore.subscribe((newHistory) => {
      setHistory(newHistory);
    });
    // Sync initial state
    setHistory(historyStore.getHistory());
    return unsubscribe;
  }, []);

  const renderHistoryItem = ({ item }) => {
    const itemCount = item.items.reduce((sum, i) => sum + (i.qty || 1), 0);
    
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
              {itemCount} {itemCount === 1 ? 'platillo' : 'platillos'}
            </Text>
            <Text style={styles.itemsSummary} numberOfLines={1}>
              {item.items.map(i => i.name).join(', ')}
            </Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.totalPrice}>${item.total.toFixed(2)}</Text>
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

      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>Aún no tienes pedidos registrados.</Text>
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
    marginLeft: 24, // Align with orderId (after receipt icon)
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
  },
});
