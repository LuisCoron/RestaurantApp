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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SIZES } from '../theme/colors';
import { POPULAR_ITEMS, MENU_ITEMS } from '../data/mockData';
import { cartStore, historyStore } from '../data/cartStore';
import { loadReservations } from '../data/reservationsStore';

const { width } = Dimensions.get('window');

// ─── helpers ────────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

function formatResDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${parseInt(d)} de ${MONTH_NAMES[parseInt(m) - 1]}, ${y}`;
}

function getNextReservation(reservations) {
  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return reservations
    .filter((r) => {
      if (r.status !== 'activa') return false;
      const [y, m, d] = r.date.split('-').map(Number);
      return new Date(y, m - 1, d) >= todayMidnight;
    })
    .sort((a, b) => {
      const da = new Date(`${a.date}T${a.time}`);
      const db = new Date(`${b.date}T${b.time}`);
      return da - db;
    })[0] || null;
}

// Top-selling items by price (simulated ranking)
const TOP_MENU = POPULAR_ITEMS.slice(0, 3);

// ─── COMPONENT ──────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  // ── Live state ──
  const [cart, setCart] = useState(cartStore.getCart());
  const [history, setHistory] = useState(historyStore.getHistory());
  const [reservations, setReservations] = useState([]);

  // ── Subscribe to in-memory stores (cart + history) ──
  useEffect(() => {
    const unsubCart = cartStore.subscribe(setCart);
    const unsubHistory = historyStore.subscribe(setHistory);
    setCart(cartStore.getCart());
    setHistory(historyStore.getHistory());
    return () => {
      unsubCart();
      unsubHistory();
    };
  }, []);

  // ── Reload AsyncStorage reservations every time the tab gains focus ──
  useFocusEffect(
    useCallback(() => {
      loadReservations().then(setReservations);
    }, [])
  );

  // ── Derived values ──
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartItemCount = cart.reduce((s, i) => s + i.qty, 0);
  const lastOrder = history[0] || null;
  const nextReservation = getNextReservation(reservations);
  const activeReservationsCount = reservations.filter(
    (r) => r.status === 'activa'
  ).length;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bienvenido,</Text>
            <Text style={styles.appName}>Aura Gourmet ✨</Text>
          </View>
          <TouchableOpacity style={styles.avatarButton}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
            {(cartItemCount > 0 || activeReservationsCount > 0) && (
              <View style={styles.badge} />
            )}
          </TouchableOpacity>
        </View>

        {/* ── AI Banner ── */}
        <TouchableOpacity
          style={styles.aiBanner}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('AIRecommendation')}
        >
          <View style={styles.aiContent}>
            <View style={styles.aiTextContainer}>
              <Text style={styles.aiTag}>NUEVO</Text>
              <Text style={styles.aiTitle}>Recomendación IA</Text>
              <Text style={styles.aiSubtitle}>
                ¿No sabes qué elegir? Deja que nuestra IA decida por ti según tu antojo y presupuesto.
              </Text>
            </View>
            <View style={styles.aiIconContainer}>
              <Ionicons name="sparkles" size={40} color={COLORS.primary} />
            </View>
          </View>
          <View style={styles.aiFooter}>
            <Text style={styles.aiFooterText}>Probar Recomendación Personalizada</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
          </View>
        </TouchableOpacity>

        {/* ── Section Title ── */}
        <Text style={styles.sectionTitle}>Resumen en tiempo real</Text>

        {/* ══════════════════════════════════════════════════════════════
            GRID DE TARJETAS — 2×2
        ══════════════════════════════════════════════════════════════ */}
        <View style={styles.grid}>

          {/* ── TARJETA 1: Menú ── */}
          <TouchableOpacity
            style={[styles.card, styles.cardMenu]}
            onPress={() => navigation.navigate('Menú')}
            activeOpacity={0.85}
          >
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBg, { backgroundColor: 'rgba(217,119,6,0.15)' }]}>
                <Ionicons name="restaurant" size={18} color="#D97706" />
              </View>
              <Text style={styles.cardLabel}>Menú</Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.textSecondary} />
            </View>

            {/* Content: top 3 platillos */}
            <Text style={styles.cardSubLabel}>🏆 Más vendidos</Text>
            {TOP_MENU.map((item, idx) => (
              <View key={item.id} style={styles.menuRow}>
                <Text style={styles.menuRank}>{idx + 1}</Text>
                <Text style={styles.menuEmoji}>{item.emoji}</Text>
                <Text style={styles.menuName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.menuPrice}>${item.price}</Text>
              </View>
            ))}

            {/* Footer */}
            <View style={styles.cardFooter}>
              <Text style={styles.cardFooterText}>{MENU_ITEMS.length} platillos</Text>
            </View>
          </TouchableOpacity>

          {/* ── TARJETA 2: Pedido actual ── */}
          <TouchableOpacity
            style={[styles.card, styles.cardOrders]}
            onPress={() => navigation.navigate('Pedidos')}
            activeOpacity={0.85}
          >
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBg, { backgroundColor: 'rgba(21,128,61,0.15)' }]}>
                <Ionicons name="cart" size={18} color="#15803D" />
              </View>
              <Text style={styles.cardLabel}>Pedidos</Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.textSecondary} />
            </View>

            {cart.length === 0 ? (
              /* Empty cart */
              <View style={styles.cardEmptyBox}>
                <Ionicons name="cart-outline" size={28} color={COLORS.border} />
                <Text style={styles.cardEmptyText}>Carrito vacío</Text>
                <Text style={styles.cardEmptyHint}>Toca para agregar platillos</Text>
              </View>
            ) : (
              /* Active cart */
              <>
                <Text style={styles.cardSubLabel}>🛒 Carrito actual</Text>
                {cart.slice(0, 2).map((item) => (
                  <View key={item.id} style={styles.menuRow}>
                    <Text style={styles.menuEmoji}>{item.emoji}</Text>
                    <Text style={styles.menuName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.menuPrice}>×{item.qty}</Text>
                  </View>
                ))}
                {cart.length > 2 && (
                  <Text style={styles.moreText}>+{cart.length - 2} más...</Text>
                )}
                <View style={styles.cardFooter}>
                  <View style={styles.totalPill}>
                    <Text style={styles.totalPillText}>
                      {cartItemCount} {cartItemCount === 1 ? 'platillo' : 'platillos'}
                    </Text>
                  </View>
                  <Text style={styles.cartTotalText}>${cartTotal.toFixed(0)}</Text>
                </View>
              </>
            )}
          </TouchableOpacity>

          {/* ── TARJETA 3: Próxima Reservación ── */}
          <TouchableOpacity
            style={[styles.card, styles.cardRes]}
            onPress={() => navigation.navigate('Reservaciones')}
            activeOpacity={0.85}
          >
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBg, { backgroundColor: 'rgba(29,78,216,0.15)' }]}>
                <Ionicons name="calendar" size={18} color="#1D4ED8" />
              </View>
              <Text style={styles.cardLabel}>Reservas</Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.textSecondary} />
            </View>

            {!nextReservation ? (
              /* No reservations */
              <View style={styles.cardEmptyBox}>
                <Ionicons name="calendar-outline" size={28} color={COLORS.border} />
                <Text style={styles.cardEmptyText}>Sin reservas</Text>
                <Text style={styles.cardEmptyHint}>Toca para reservar tu mesa</Text>
              </View>
            ) : (
              /* Next reservation */
              <>
                <Text style={styles.cardSubLabel}>📅 Próxima reserva</Text>
                <Text style={styles.resClientName} numberOfLines={1}>
                  {nextReservation.clientName}
                </Text>
                <View style={styles.resDetailRow}>
                  <Ionicons name="calendar-outline" size={13} color={COLORS.primary} />
                  <Text style={styles.resDetailText}>
                    {formatResDate(nextReservation.date)}
                  </Text>
                </View>
                <View style={styles.resDetailRow}>
                  <Ionicons name="time-outline" size={13} color={COLORS.primary} />
                  <Text style={styles.resDetailText}>{nextReservation.time}</Text>
                </View>
                <View style={styles.resDetailRow}>
                  <Ionicons name="people-outline" size={13} color={COLORS.primary} />
                  <Text style={styles.resDetailText}>
                    {nextReservation.guests} persona{nextReservation.guests > 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardFooterText}>
                    {activeReservationsCount} activa{activeReservationsCount !== 1 ? 's' : ''}
                  </Text>
                </View>
              </>
            )}
          </TouchableOpacity>

          {/* ── TARJETA 4: Última compra ── */}
          <TouchableOpacity
            style={[styles.card, styles.cardHistory]}
            onPress={() => navigation.navigate('Historial')}
            activeOpacity={0.85}
          >
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBg, { backgroundColor: 'rgba(126,34,206,0.15)' }]}>
                <Ionicons name="time" size={18} color="#7E22CE" />
              </View>
              <Text style={styles.cardLabel}>Historial</Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.textSecondary} />
            </View>

            {!lastOrder ? (
              /* No history */
              <View style={styles.cardEmptyBox}>
                <Ionicons name="receipt-outline" size={28} color={COLORS.border} />
                <Text style={styles.cardEmptyText}>Sin compras</Text>
                <Text style={styles.cardEmptyHint}>Tu historial aparecerá aquí</Text>
              </View>
            ) : (
              /* Last order */
              <>
                <Text style={styles.cardSubLabel}>🧾 Último pedido</Text>
                <View style={styles.histOrderHeader}>
                  <Text style={styles.histOrderId}>{lastOrder.id}</Text>
                  <View style={styles.histStatusBadge}>
                    <Text style={styles.histStatusText}>{lastOrder.status}</Text>
                  </View>
                </View>
                <Text style={styles.histDate}>{lastOrder.date}</Text>
                <Text style={styles.histItems} numberOfLines={1}>
                  {lastOrder.items
                    .filter((i) => i.price > 0)
                    .map((i) => `${i.qty}× ${i.name}`)
                    .join(', ')}
                </Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardFooterText}>
                    {history.length} pedido{history.length !== 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.histTotal}>${lastOrder.total.toFixed(0)}</Text>
                </View>
              </>
            )}
          </TouchableOpacity>

        </View>
        {/* ══ END GRID ══ */}

        {/* ── Platillos Populares ── */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitleInside}>Platillos Populares</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Menú')}>
              <Text style={styles.seeMoreLink}>Ver menú →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularCarousel}
          >
            {POPULAR_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.popularCard}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('Menú', { selectedCategory: item.category })
                }
              >
                <View style={styles.popularEmojiContainer}>
                  <Text style={styles.popularEmoji}>{item.emoji}</Text>
                </View>
                <View style={styles.popularInfo}>
                  <Text style={styles.popularName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.popularDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <View style={styles.popularFooter}>
                    <Text style={styles.popularPrice}>${item.price.toFixed(2)}</Text>
                    <View style={styles.popularAddBtn}>
                      <Ionicons name="arrow-forward" size={14} color={COLORS.background} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const CARD_W = (width - SIZES.medium * 2 - 10) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SIZES.medium },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.large,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
  },
  greeting: { fontSize: SIZES.font, color: COLORS.textSecondary },
  appName: { fontSize: SIZES.extraLarge, fontWeight: 'bold', color: COLORS.text },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  // AI Banner
  aiBanner: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    overflow: 'hidden',
    marginBottom: SIZES.large,
  },
  aiContent: {
    flexDirection: 'row',
    padding: SIZES.medium,
    justifyContent: 'space-between',
  },
  aiTextContainer: { flex: 1, paddingRight: SIZES.small },
  aiTag: {
    backgroundColor: COLORS.primary,
    color: COLORS.background,
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  aiTitle: {
    color: COLORS.text,
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  aiSubtitle: { color: COLORS.textSecondary, fontSize: SIZES.small, lineHeight: 16 },
  aiIconContainer: { justifyContent: 'center', alignItems: 'center', paddingLeft: SIZES.base },
  aiFooter: {
    backgroundColor: 'rgba(232, 168, 56, 0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.base + 2,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  aiFooterText: { color: COLORS.primary, fontWeight: '600', fontSize: SIZES.font },

  // Section titles
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.medium,
  },

  // ── GRID 2x2 ──
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SIZES.large,
    gap: 10,
  },

  // Base card
  card: {
    width: CARD_W,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 0,
    minHeight: 180,
  },
  cardMenu: { borderColor: 'rgba(217,119,6,0.25)' },
  cardOrders: { borderColor: 'rgba(21,128,61,0.25)' },
  cardRes: { borderColor: 'rgba(29,78,216,0.25)' },
  cardHistory: { borderColor: 'rgba(126,34,206,0.25)' },

  // Card header row
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base + 2,
  },
  cardIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  cardLabel: {
    flex: 1,
    fontSize: SIZES.font,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  // Sub labels
  cardSubLabel: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.2,
  },

  // Card footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    marginTop: 8,
  },
  cardFooterText: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },

  // Empty state inside card
  cardEmptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  cardEmptyText: {
    fontSize: SIZES.font - 1,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  cardEmptyHint: {
    fontSize: SIZES.small - 1,
    color: COLORS.border,
    textAlign: 'center',
  },

  // Menu rows
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 4,
  },
  menuRank: {
    fontSize: SIZES.small - 1,
    color: COLORS.primary,
    fontWeight: 'bold',
    width: 12,
  },
  menuEmoji: { fontSize: 14 },
  menuName: {
    flex: 1,
    fontSize: SIZES.small,
    color: COLORS.text,
    fontWeight: '500',
  },
  menuPrice: {
    fontSize: SIZES.small - 1,
    color: COLORS.primary,
    fontWeight: 'bold',
  },

  // Cart extras
  moreText: {
    fontSize: SIZES.small - 1,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  totalPill: {
    backgroundColor: 'rgba(21,128,61,0.12)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  totalPillText: {
    fontSize: SIZES.small - 1,
    color: '#15803D',
    fontWeight: '600',
  },
  cartTotalText: {
    fontSize: SIZES.medium - 1,
    fontWeight: 'bold',
    color: COLORS.primary,
  },

  // Reservation details
  resClientName: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  resDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  resDetailText: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    flex: 1,
  },

  // History details
  histOrderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  histOrderId: {
    fontSize: SIZES.font - 1,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  histStatusBadge: {
    backgroundColor: 'rgba(76,175,80,0.12)',
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  histStatusText: {
    fontSize: SIZES.small - 2,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  histDate: {
    fontSize: SIZES.small - 1,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  histItems: {
    fontSize: SIZES.small - 1,
    color: COLORS.text,
    marginBottom: 4,
  },
  histTotal: {
    fontSize: SIZES.medium - 1,
    fontWeight: 'bold',
    color: COLORS.primary,
  },

  // ── Sections below grid ──
  sectionContainer: { marginBottom: SIZES.large },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  sectionTitleInside: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  seeMoreLink: { color: COLORS.primary, fontSize: SIZES.font, fontWeight: '500' },

  // Popular carousel
  popularCarousel: { paddingRight: SIZES.medium },
  popularCard: {
    width: 200,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    marginRight: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  popularEmojiContainer: {
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popularEmoji: { fontSize: 50 },
  popularInfo: { padding: SIZES.medium },
  popularName: {
    fontSize: SIZES.medium - 1,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  popularDesc: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    height: 32,
    lineHeight: 16,
    marginBottom: SIZES.base,
  },
  popularFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.base,
  },
  popularPrice: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  popularAddBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
