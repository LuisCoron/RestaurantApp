import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme/colors';
import { cartStore } from '../data/cartStore';

export default function OrdersScreen() {
  const [cart, setCart] = useState(cartStore.getCart());
  const [discountCode, setDiscountCode] = useState('WELCOME50');

  // Subscribe to cartStore updates
  useEffect(() => {
    const unsubscribe = cartStore.subscribe((newCart) => {
      setCart(newCart);
    });
    // Sync initial state in case it changed between mounts
    setCart(cartStore.getCart());
    return unsubscribe;
  }, []);

  const deliveryFee = 45;
  const discountVal = discountCode ? 50 : 0;

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  };

  const handleQtyChange = (itemId, change) => {
    cartStore.updateCartQty(itemId, change);
  };

  const handleRemoveItem = (itemId, itemName) => {
    Alert.alert(
      'Eliminar platillo',
      `¿Deseas quitar "${itemName}" de tu carrito?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, quitar',
          style: 'destructive',
          onPress: () => {
            cartStore.removeFromCart(itemId);
          }
        }
      ]
    );
  };

  const handleConfirmOrder = () => {
    Alert.alert(
      '🎉 ¡Pedido Confirmado!',
      'Tu orden ha sido enviada directamente a nuestra cocina.\n\nTiempo estimado de entrega: 30 - 40 minutos.\n\n¡Gracias por elegir Aura Gourmet!',
      [
        {
          text: 'Entendido',
          onPress: () => {
            cartStore.clearCart();
          }
        }
      ]
    );
  };

  const handleResetCart = () => {
    cartStore.resetToMock();
  };

  const subtotal = calculateSubtotal();
  const total = Math.max(0, subtotal + deliveryFee - discountVal);

  const renderCartItem = ({ item }) => {
    return (
      <View style={styles.cartCard}>
        <View style={styles.cartEmojiContainer}>
          <Text style={styles.cartEmoji}>{item.emoji}</Text>
        </View>
        <View style={styles.cartDetails}>
          <View style={styles.cartItemHeader}>
            <Text style={styles.cartItemName} numberOfLines={1}>{item.name}</Text>
            <TouchableOpacity
              onPress={() => handleRemoveItem(item.id, item.name)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.error} />
            </TouchableOpacity>
          </View>
          <Text style={styles.cartItemDesc} numberOfLines={1}>{item.description}</Text>
          <View style={styles.cartItemFooter}>
            <Text style={styles.cartItemPrice}>${(item.price * item.qty).toFixed(2)}</Text>
            
            {/* Quantity Selector */}
            <View style={styles.qtyContainer}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => handleQtyChange(item.id, -1)}
                disabled={item.qty <= 1}
              >
                <Ionicons
                  name="remove"
                  size={16}
                  color={item.qty <= 1 ? COLORS.border : COLORS.text}
                />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.qty}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => handleQtyChange(item.id, 1)}
              >
                <Ionicons name="add" size={16} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>Mi Carrito 🛒</Text>
        <Text style={styles.subtitle}>Confirma y ordena en segundos</Text>
      </View>

      {cart.length > 0 ? (
        <View style={{ flex: 1 }}>
          {/* Cart items list */}
          <FlatList
            data={cart}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.cartList}
            showsVerticalScrollIndicator={false}
          />

          {/* Pricing Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.couponRow}>
              <Ionicons name="pricetag-outline" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.couponText}>Cupón aplicado: <Text style={styles.couponCode}>{discountCode}</Text></Text>
              <TouchableOpacity onPress={() => setDiscountCode(discountCode ? '' : 'WELCOME50')}>
                <Text style={styles.couponAction}>{discountCode ? 'Quitar' : 'Aplicar'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tarifa de Envío</Text>
              <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
            </View>
            {discountVal > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: COLORS.success }]}>Descuento Cupón</Text>
                <Text style={[styles.summaryValue, { color: COLORS.success }]}>-${discountVal.toFixed(2)}</Text>
              </View>
            )}

            <View style={[styles.summaryDivider, { marginVertical: 12 }]} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total a Pagar</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>

            {/* Confirm button */}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmOrder}
              activeOpacity={0.9}
            >
              <Text style={styles.confirmButtonText}>Confirmar Pedido</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.background} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Ionicons name="cart-outline" size={60} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
          <Text style={styles.emptySubtitle}>Agrega platillos exquisitos de nuestro menú y pégalos aquí.</Text>
          <TouchableOpacity
            style={styles.fillCartBtn}
            onPress={handleResetCart}
          >
            <Text style={styles.fillCartBtnText}>Simular productos en carrito</Text>
          </TouchableOpacity>
        </View>
      )}
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
  cartList: {
    paddingHorizontal: SIZES.medium,
    paddingTop: SIZES.base,
    paddingBottom: 20,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: SIZES.medium,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cartEmojiContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.medium,
  },
  cartEmoji: {
    fontSize: 34,
  },
  cartDetails: {
    flex: 1,
  },
  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  cartItemName: {
    fontSize: SIZES.medium - 1,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginRight: 4,
  },
  cartItemDesc: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base,
  },
  cartItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartItemPrice: {
    fontSize: SIZES.medium - 1,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    color: COLORS.text,
    fontSize: SIZES.font,
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SIZES.medium + 4,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.border,
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  couponText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.small + 1,
    flex: 1,
  },
  couponCode: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  couponAction: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: SIZES.small + 1,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.base,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: SIZES.font,
  },
  summaryValue: {
    color: COLORS.text,
    fontSize: SIZES.font,
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  totalLabel: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: SIZES.extraLarge - 2,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: SIZES.medium,
    marginTop: SIZES.base,
  },
  confirmButtonText: {
    color: COLORS.background,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    marginRight: 6,
  },
  emptyContainer: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(232, 168, 56, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.large,
  },
  emptyTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  emptySubtitle: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SIZES.large,
  },
  fillCartBtn: {
    backgroundColor: 'rgba(232, 168, 56, 0.15)',
    borderRadius: 12,
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.medium - 2,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  fillCartBtnText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: SIZES.font,
  },
});
