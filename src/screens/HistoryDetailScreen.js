import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme/colors';

export default function HistoryDetailScreen({ route, navigation }) {
  const { order } = route.params;

  const handleReorder = () => {
    Alert.alert(
      '🔄 Re-ordenar pedido',
      `¿Deseas agregar todos los elementos del pedido ${order.id} al carrito actual?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, agregar',
          onPress: () => {
            Alert.alert(
              '🛒 Carrito Actualizado',
              'Los productos han sido cargados de forma simulada en tu carrito. Puedes revisarlos en la sección "Pedidos".',
              [{ text: 'Ver Carrito', onPress: () => navigation.navigate('Pedidos') }]
            );
          }
        }
      ]
    );
  };

  // Calculate items sum
  const subtotal = order.items.reduce((sum, item) => {
    // If the price is negative (like discount coupon), don't add to subtotal
    if (item.price < 0) return sum;
    return sum + (item.price * (item.qty || 1));
  }, 0);

  const discountItem = order.items.find(item => item.price < 0);
  const discountVal = discountItem ? Math.abs(discountItem.price) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Pedido</Text>
        <View style={{ width: 40 }} /> {/* Spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Order Summary Header */}
        <View style={styles.orderHeaderCard}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.orderIdLabel}>ID del Pedido</Text>
              <Text style={styles.orderId}>{order.id}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{order.status}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{order.date}</Text>
          </View>
          <View style={[styles.infoRow, { marginTop: 6 }]}>
            <Ionicons name="card-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>Pago: Tarjeta de Crédito (Simulado)</Text>
          </View>
        </View>

        {/* Order Items List */}
        <Text style={styles.sectionTitle}>Platillos Ordenados</Text>
        <View style={styles.itemsCard}>
          {order.items.filter(item => item.price > 0).map((item, index) => (
            <View key={index}>
              <View style={styles.itemRow}>
                <View style={styles.itemQuantityBox}>
                  <Text style={styles.itemQuantityText}>{item.qty || 1}x</Text>
                </View>
                <View style={styles.itemNameBox}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPriceUnit}>Precio unitario: ${item.price.toFixed(2)}</Text>
                </View>
                <Text style={styles.itemTotal}>${((item.price) * (item.qty || 1)).toFixed(2)}</Text>
              </View>
              {index < order.items.filter(item => item.price > 0).length - 1 && (
                <View style={styles.itemDivider} />
              )}
            </View>
          ))}
        </View>

        {/* Receipt Totals */}
        <Text style={styles.sectionTitle}>Resumen de Cuenta</Text>
        <View style={styles.receiptCard}>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Subtotal</Text>
            <Text style={styles.receiptValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Tarifa de Envío / Servicio</Text>
            <Text style={styles.receiptValue}>$45.00</Text>
          </View>
          {discountVal > 0 && (
            <View style={styles.receiptRow}>
              <Text style={[styles.receiptLabel, { color: COLORS.success }]}>Descuento Cupón</Text>
              <Text style={[styles.receiptValue, { color: COLORS.success }]}>-${discountVal.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.receiptDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Pagado</Text>
            <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Reorder Button */}
        <TouchableOpacity
          style={styles.reorderBtn}
          onPress={handleReorder}
          activeOpacity={0.9}
        >
          <Ionicons name="refresh-outline" size={20} color={COLORS.background} style={{ marginRight: 6 }} />
          <Text style={styles.reorderBtnText}>Volver a Pedir Todo</Text>
        </TouchableOpacity>

        <View style={styles.footerSpacing} />
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.medium,
    paddingTop: SIZES.medium,
    paddingBottom: SIZES.base,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollContent: {
    padding: SIZES.medium,
  },
  orderHeaderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SIZES.large,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderIdLabel: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  orderId: {
    fontSize: SIZES.large - 1,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statusBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: COLORS.success,
  },
  statusText: {
    color: COLORS.success,
    fontSize: SIZES.small + 1,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.medium,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.font,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.base + 2,
  },
  itemsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SIZES.large,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  itemQuantityBox: {
    backgroundColor: 'rgba(232, 168, 56, 0.15)',
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemQuantityText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: SIZES.font,
  },
  itemNameBox: {
    flex: 1,
  },
  itemName: {
    fontSize: SIZES.font,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemPriceUnit: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  itemTotal: {
    fontSize: SIZES.font,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  itemDivider: {
    height: 0.5,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.small,
  },
  receiptCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SIZES.large,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  receiptLabel: {
    color: COLORS.textSecondary,
    fontSize: SIZES.font,
  },
  receiptValue: {
    color: COLORS.text,
    fontSize: SIZES.font,
    fontWeight: '500',
  },
  receiptDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.base,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: SIZES.large - 1,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: SIZES.extraLarge - 2,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  reorderBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: SIZES.medium,
    marginTop: SIZES.base,
  },
  reorderBtnText: {
    color: COLORS.background,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  footerSpacing: {
    height: 40,
  },
});
