import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Alert,
  Image,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme/colors';
import { CATEGORIES } from '../data/mockData';
import { cartStore } from '../data/cartStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Enriched menu items with premium Unsplash images and availability booleans
const INITIAL_PRODUCTS = [
  {
    id: 'ent_1',
    category: 'entradas',
    name: 'Bruschetta de Pomodoro',
    price: 120,
    emoji: '🥖',
    description: 'Pan artesanal tostado con tomate fresco, albahaca orgánica, ajo y un toque de aceite de oliva extra virgen.',
    image: 'https://images.unsplash.com/photo-1572656631137-7935297eff55?w=600',
    available: true,
  },
  {
    id: 'ent_2',
    category: 'entradas',
    name: 'Calamari Fritti',
    price: 180,
    emoji: '🦑',
    description: 'Anillos de calamar crujientes acompañados de una salsa tártara casera y rodajas de limón fresco.',
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600',
    available: false, // Marked as sold-out to demonstrate sold-out UI
  },
  {
    id: 'ent_3',
    category: 'entradas',
    name: 'Tabla de Quesos y Carnes',
    price: 260,
    emoji: '🧀',
    description: 'Selección premium de quesos maduros y embutidos finos acompañados de frutos secos y miel silvestre.',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600',
    available: true,
  },
  {
    id: 'ent_4',
    category: 'entradas',
    name: 'Empanadas Argentinas',
    price: 110,
    emoji: '🥟',
    description: 'Dos empanadas horneadas rellenas de carne cortada a cuchillo, sazonadas con comino y aceitunas.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',
    available: true,
  },
  {
    id: 'fuerte_1',
    category: 'fuertes',
    name: 'Ribeye Prime a la Parilla',
    price: 490,
    emoji: '🥩',
    description: 'Corte jugoso de 400g a las brasas, servido con papas rústicas al romero y mantequilla de chimichurri.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',
    available: true,
  },
  {
    id: 'fuerte_2',
    category: 'fuertes',
    name: 'Salmon Glaseado con Teriyaki',
    price: 380,
    emoji: '🐟',
    description: 'Filete de salmón fresco a la plancha con salsa teriyaki dulce, servido sobre una cama de arroz jazmín.',
    image: 'https://images.unsplash.com/photo-1485921325814-a50431496cc9?w=600',
    available: true,
  },
  {
    id: 'fuerte_3',
    category: 'fuertes',
    name: 'Ravioles de Espinaca y Ricotta',
    price: 290,
    emoji: '🍝',
    description: 'Pasta artesanal rellena de espinacas tiernas y queso ricotta, bañada en una cremosa salsa de trufa blanca.',
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600',
    available: true,
  },
  {
    id: 'fuerte_4',
    category: 'fuertes',
    name: 'Hamburguesa Royal Gourmet',
    price: 240,
    emoji: '🍔',
    description: 'Carne de res angus, queso cheddar fundido, tocino crujiente, cebolla caramelizada en pan brioche.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
    available: true,
  },
  {
    id: 'beb_1',
    category: 'bebidas',
    name: 'Maracuyá Mojito Premium',
    price: 110,
    emoji: '🍹',
    description: 'Ron blanco, pulpa de maracuyá fresca, hojas de menta maceradas, limón y un toque de soda.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600',
    available: true,
  },
  {
    id: 'beb_2',
    category: 'bebidas',
    name: 'Vino Tinto Copa (Reserva)',
    price: 140,
    emoji: '🍷',
    description: 'Copa de Cabernet Sauvignon con notas de frutos rojos, roble y un final aterciopelado elegante.',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600',
    available: true,
  },
  {
    id: 'beb_3',
    category: 'bebidas',
    name: 'Limonada de Lavanda y Menta',
    price: 75,
    emoji: '🍋',
    description: 'Refrescante limonada natural infusionada con flores de lavanda orgánica y hojas de menta.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600',
    available: true,
  },
  {
    id: 'beb_4',
    category: 'bebidas',
    name: 'Café Espresso Doble',
    price: 60,
    emoji: '☕',
    description: 'Extracción concentrada de granos de café seleccionados de altura con un aroma intenso.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600',
    available: true,
  },
  {
    id: 'pos_1',
    category: 'postres',
    name: 'Volcán de Chocolate Fondant',
    price: 130,
    emoji: '🌋',
    description: 'Bizcocho tibio de chocolate amargo con centro líquido fundido, acompañado de helado de vainilla.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600',
    available: true,
  },
  {
    id: 'pos_2',
    category: 'postres',
    name: 'Tiramisú de la Casa',
    price: 120,
    emoji: '🍰',
    description: 'Capas de bizcocho soletilla remojadas en café espresso, licor de amaretto y crema mascarpone.',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600',
    available: true,
  },
  {
    id: 'pos_3',
    category: 'postres',
    name: 'Cheesecake de Frutos Rojos',
    price: 115,
    emoji: '🍓',
    description: 'Clásico pay de queso cremoso al estilo Nueva York, bañado en una compota casera de frutos del bosque.',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600',
    available: false, // Marked as sold-out to demonstrate sold-out UI
  },
];

export default function MenuScreen({ route }) {
  const [products] = useState(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [searchQuery, setSearchQuery] = useState('');

  // Detail Modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailQty, setDetailQty] = useState(1);

  // If we came from another screen (like HomeScreen) with a category selected
  useEffect(() => {
    if (route.params?.selectedCategory) {
      setSelectedCategory(route.params.selectedCategory);
    }
  }, [route.params?.selectedCategory]);

  // Combined filtering: both Category AND Search text matching name
  const filteredItems = products.filter(item => {
    const matchesCategory = selectedCategory === 'todas' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Direct fast add-to-cart (1 quantity) from list card
  const handleAddItem = (item) => {
    cartStore.addToCart(item, 1);
    Alert.alert(
      '✨ Agregado',
      `¡"${item.name}" se ha añadido a tu carrito!`,
      [{ text: 'Excelente', style: 'default' }],
      { cancelable: true }
    );
  };

  // Add-to-cart from detailed modal with customizable quantity
  const handleAddFromModal = () => {
    if (!selectedProduct) return;
    cartStore.addToCart(selectedProduct, detailQty);
    const prodName = selectedProduct.name;
    setSelectedProduct(null);
    Alert.alert(
      '✨ Agregado',
      `¡Se han añadido ${detailQty}x "${prodName}" a tu carrito!`,
      [{ text: 'Excelente', style: 'default' }],
      { cancelable: true }
    );
  };

  const renderCategoryChip = ({ item }) => {
    const isSelected = selectedCategory === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.chip,
          isSelected && styles.chipSelected
        ]}
        onPress={() => setSelectedCategory(item.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.chipEmoji}>{item.emoji}</Text>
        <Text
          style={[
            styles.chipText,
            isSelected && styles.chipTextSelected
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderMenuItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => {
          setSelectedProduct(item);
          setDetailQty(1);
        }}
        activeOpacity={0.8}
      >
        {/* Premium Unsplash Image with Sold-out Overlay */}
        <View style={styles.itemImageContainer}>
          <Image source={{ uri: item.image }} style={styles.itemImage} />
          {!item.available && (
            <View style={styles.soldOutOverlay}>
              <Text style={styles.soldOutOverlayText}>AGOTADO</Text>
            </View>
          )}
        </View>

        <View style={styles.itemDetails}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.itemPrice}>{`$${item.price.toFixed(2)}`}</Text>
          </View>
          <Text style={styles.itemDesc} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.itemFooter}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {CATEGORIES.find(c => c.id === item.category)?.name}
              </Text>
            </View>

            {item.available ? (
              <TouchableOpacity
                style={styles.addButton}
                onPress={(e) => {
                  e.stopPropagation(); // Avoid triggering open modal on parent card
                  handleAddItem(item);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={18} color={COLORS.background} />
                <Text style={styles.addButtonText}>Agregar</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.soldOutBadge}>
                <Text style={styles.soldOutBadgeText}>Agotado</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Title Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Nuestro Menú 🍽️</Text>
        <Text style={styles.subtitle}>Selecciona tus delicias preferidas</Text>
      </View>

      {/* Premium Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar platillo por nombre..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Horizontal Category Selector */}
      <View style={styles.categoryContainer}>
        <FlatList
          data={CATEGORIES}
          renderItem={renderCategoryChip}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Vertical Dishes List */}
      <FlatList
        data={filteredItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.menuItemsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No se encontraron platillos que coincidan con la búsqueda.</Text>
          </View>
        }
      />

      {/* Premium Dish Detail sliding bottom drawer Modal */}
      {selectedProduct && (
        <Modal
          visible={true}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedProduct(null)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBgDismiss}
              activeOpacity={1}
              onPress={() => setSelectedProduct(null)}
            />
            <View style={styles.modalContent}>

              {/* Header Image */}
              <View style={styles.modalImageWrapper}>
                <Image source={{ uri: selectedProduct.image }} style={styles.modalHeaderImage} />
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedProduct(null)}
                >
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              {/* Modal Body Info */}
              <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.modalBody}>

                  <View style={styles.modalTitleRow}>
                    <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
                    <Text style={styles.modalPrice}>{`$${selectedProduct.price.toFixed(2)}`}</Text>
                  </View>

                  <View style={styles.modalMetaRow}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>
                        {CATEGORIES.find(c => c.id === selectedProduct.category)?.name}
                      </Text>
                    </View>

                    <View style={styles.availStatusRow}>
                      <View style={[
                        styles.availDot,
                        { backgroundColor: selectedProduct.available ? COLORS.success : COLORS.error }
                      ]} />
                      <Text style={[
                        styles.availText,
                        { color: selectedProduct.available ? COLORS.success : COLORS.error }
                      ]}>
                        {selectedProduct.available ? 'Disponible' : 'Agotado'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.modalDescription}>
                    {selectedProduct.description}
                  </Text>

                  {/* Quantity selector & Add Button (only if available) */}
                  {selectedProduct.available ? (
                    <View style={styles.purchaseSection}>
                      <View style={styles.qtyPickerWrapper}>
                        <Text style={styles.qtyPickerLabel}>Cantidad</Text>
                        <View style={styles.qtyPickerControls}>
                          <TouchableOpacity
                            style={[styles.qtyPickerBtn, detailQty <= 1 && styles.qtyPickerBtnDisabled]}
                            onPress={() => setDetailQty(Math.max(1, detailQty - 1))}
                            disabled={detailQty <= 1}
                          >
                            <Ionicons name="remove" size={20} color={detailQty <= 1 ? COLORS.border : COLORS.text} />
                          </TouchableOpacity>

                          <Text style={styles.qtyPickerText}>{detailQty}</Text>

                          <TouchableOpacity
                            style={styles.qtyPickerBtn}
                            onPress={() => setDetailQty(detailQty + 1)}
                          >
                            <Ionicons name="add" size={20} color={COLORS.text} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.modalAddBtn}
                        onPress={handleAddFromModal}
                        activeOpacity={0.9}
                      >
                        <Ionicons name="cart" size={22} color={COLORS.background} style={{ marginRight: 8 }} />
                        <Text style={styles.modalAddBtnText}>
                          {`Agregar al pedido • $${(selectedProduct.price * detailQty).toFixed(2)}`}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.purchaseSection}>
                      <View style={styles.modalSoldOutBtn}>
                        <Ionicons name="alert-circle-outline" size={22} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
                        <Text style={styles.modalSoldOutBtnText}>Platillo Agotado</Text>
                      </View>
                    </View>
                  )}

                </View>
              </ScrollView>

            </View>
          </View>
        </Modal>
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
  searchContainer: {
    paddingHorizontal: SIZES.medium,
    marginVertical: SIZES.base,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.base + 2,
  },
  searchIcon: {
    marginRight: SIZES.base,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: SIZES.font,
    padding: 0, // Reset default padding in Android/iOS
  },
  categoryContainer: {
    marginVertical: SIZES.base,
  },
  categoryList: {
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
  menuItemsList: {
    paddingHorizontal: SIZES.medium,
    paddingBottom: 80,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  itemImageContainer: {
    width: 85,
    height: 85,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: SIZES.medium,
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  soldOutOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soldOutOverlayText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginRight: SIZES.base,
  },
  itemPrice: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  itemDesc: {
    fontSize: SIZES.small + 1,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  categoryBadgeText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.small,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: COLORS.background,
    fontSize: SIZES.small + 1,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  soldOutBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  soldOutBadgeText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.small + 1,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.medium,
    fontSize: SIZES.font,
    paddingHorizontal: 32,
    lineHeight: 20,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalBgDismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: SCREEN_HEIGHT * 0.85,
    overflow: 'hidden',
    borderTopWidth: 1.5,
    borderTopColor: COLORS.border,
  },
  modalImageWrapper: {
    width: '100%',
    height: 230,
    position: 'relative',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  modalHeaderImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalScrollView: {
    flexGrow: 0,
  },
  modalBody: {
    padding: SIZES.large,
  },
  modalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.base,
  },
  modalTitle: {
    fontSize: SIZES.extraLarge - 2,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginRight: SIZES.medium,
  },
  modalPrice: {
    fontSize: SIZES.large + 2,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  modalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.large,
  },
  availStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  availText: {
    fontSize: SIZES.font,
    fontWeight: '600',
  },
  modalDescription: {
    fontSize: SIZES.font + 1,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SIZES.large + 8,
  },
  purchaseSection: {
    marginTop: SIZES.base,
  },
  qtyPickerWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    paddingVertical: SIZES.medium - 2,
    paddingHorizontal: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SIZES.large,
  },
  qtyPickerLabel: {
    fontSize: SIZES.font + 1,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  qtyPickerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyPickerBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qtyPickerBtnDisabled: {
    opacity: 0.4,
  },
  qtyPickerText: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    paddingHorizontal: 16,
    textAlign: 'center',
    minWidth: 46,
  },
  modalAddBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: SIZES.medium + 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  modalAddBtnText: {
    color: COLORS.background,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  modalSoldOutBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    paddingVertical: SIZES.medium + 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalSoldOutBtnText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
});
