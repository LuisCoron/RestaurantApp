import React from 'react';
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
import { COLORS, SIZES } from '../theme/colors';
import { POPULAR_ITEMS, RECENT_ORDERS, UPCOMING_RESERVATIONS } from '../data/mockData';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const activeOrder = RECENT_ORDERS[0];
  const nextReservation = UPCOMING_RESERVATIONS[0];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bienvenido,</Text>
            <Text style={styles.appName}>Aura Gourmet ✨</Text>
          </View>
          <TouchableOpacity style={styles.avatarButton}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>

        {/* AI Recommendation Banner */}
        <TouchableOpacity
          style={styles.aiBanner}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('AIRecommendation')}
        >
          <View style={styles.aiContent}>
            <View style={styles.aiTextContainer}>
              <Text style={styles.aiTag}>NUEVO</Text>
              <Text style={styles.aiTitle}>Recomendación IA</Text>
              <Text style={styles.aiSubtitle}>¿No sabes qué elegir? Deja que nuestra IA decida por ti según tu antojo y presupuesto.</Text>
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

        {/* Quick Navigation Sections */}
        <Text style={styles.sectionTitle}>Secciones principales</Text>
        <View style={styles.quickNavGrid}>
          <TouchableOpacity
            style={styles.quickNavCard}
            onPress={() => navigation.navigate('Menú')}
          >
            <View style={[styles.quickNavIconBg, { backgroundColor: '#FFEDD5' }]}>
              <Ionicons name="restaurant" size={22} color="#D97706" />
            </View>
            <Text style={styles.quickNavTitle}>Explorar Menú</Text>
            <Text style={styles.quickNavDesc}>Nuestros platillos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickNavCard}
            onPress={() => navigation.navigate('Pedidos')}
          >
            <View style={[styles.quickNavIconBg, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="cart" size={22} color="#15803D" />
            </View>
            <Text style={styles.quickNavTitle}>Mi Carrito</Text>
            <Text style={styles.quickNavDesc}>Confirmar pedido</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickNavCard}
            onPress={() => navigation.navigate('Reservaciones')}
          >
            <View style={[styles.quickNavIconBg, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="calendar" size={22} color="#1D4ED8" />
            </View>
            <Text style={styles.quickNavTitle}>Reservar</Text>
            <Text style={styles.quickNavDesc}>Asegura tu mesa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickNavCard}
            onPress={() => navigation.navigate('Historial')}
          >
            <View style={[styles.quickNavIconBg, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="time" size={22} color="#7E22CE" />
            </View>
            <Text style={styles.quickNavTitle}>Historial</Text>
            <Text style={styles.quickNavDesc}>Ver compras</Text>
          </TouchableOpacity>
        </View>

        {/* Active Order Card */}
        {activeOrder && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitleInside}>Pedido Activo</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Pedidos')}>
                <Text style={styles.seeMoreLink}>Ver Carrito</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Text style={styles.orderId}>{activeOrder.id}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>{activeOrder.status}</Text>
                </View>
              </View>
              <Text style={styles.orderDate}>{activeOrder.date}</Text>
              <View style={styles.orderDivider} />
              <Text style={styles.orderItemsList} numberOfLines={1}>
                {activeOrder.items.map(item => `${item.qty}x ${item.name}`).join(', ')}
              </Text>
              <View style={styles.orderFooter}>
                <Text style={styles.orderTotalText}>Total estimado:</Text>
                <Text style={styles.orderTotalPrice}>${activeOrder.total.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Next Reservation Card */}
        {nextReservation && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitleInside}>Próxima Reservación</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Reservaciones')}>
                <Text style={styles.seeMoreLink}>Nueva Reserva</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.reservationCard}>
              <View style={styles.reservationInfo}>
                <View style={styles.resIconBox}>
                  <Ionicons name="people" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.resTextBox}>
                  <Text style={styles.resDate}>{nextReservation.date}</Text>
                  <Text style={styles.resDetails}>
                    Hora: {nextReservation.time} • Para {nextReservation.guests} personas
                  </Text>
                  <Text style={styles.resTable}>{nextReservation.table}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Popular Dishes Horizontal Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitleInside}>Platillos Populares</Text>
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
                onPress={() => navigation.navigate('Menú', { selectedCategory: item.category })}
              >
                <View style={styles.popularEmojiContainer}>
                  <Text style={styles.popularEmoji}>{item.emoji}</Text>
                </View>
                <View style={styles.popularInfo}>
                  <Text style={styles.popularName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.popularDesc} numberOfLines={2}>{item.description}</Text>
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
  scrollContent: {
    padding: SIZES.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.large,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
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
  aiTextContainer: {
    flex: 1,
    paddingRight: SIZES.small,
  },
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
  aiSubtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.small,
    lineHeight: 16,
  },
  aiIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: SIZES.base,
  },
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
  aiFooterText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: SIZES.font,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.medium,
  },
  quickNavGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SIZES.large,
  },
  quickNavCard: {
    width: (width - SIZES.medium * 2 - 12) / 2,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: SIZES.medium,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickNavIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.base + 4,
  },
  quickNavTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  quickNavDesc: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  sectionContainer: {
    marginBottom: SIZES.large,
  },
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
  seeMoreLink: {
    color: COLORS.primary,
    fontSize: SIZES.font,
    fontWeight: '500',
  },
  statusCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderId: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statusBadge: {
    backgroundColor: 'rgba(232, 168, 56, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: COLORS.primary,
  },
  statusBadgeText: {
    color: COLORS.primary,
    fontSize: SIZES.small,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base,
  },
  orderDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.base,
  },
  orderItemsList: {
    color: COLORS.textSecondary,
    fontSize: SIZES.font,
    marginBottom: SIZES.base,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotalText: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
  },
  orderTotalPrice: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  reservationCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reservationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(232, 168, 56, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.medium,
  },
  resTextBox: {
    flex: 1,
  },
  resDate: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  resDetails: {
    fontSize: SIZES.small + 1,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  resTable: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '600',
  },
  popularCarousel: {
    paddingRight: SIZES.medium,
  },
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popularEmoji: {
    fontSize: 50,
  },
  popularInfo: {
    padding: SIZES.medium,
  },
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
  footerSpacing: {
    height: 40,
  },
});
