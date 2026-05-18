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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme/colors';
import { MENU_ITEMS, CATEGORIES } from '../data/mockData';

export default function MenuScreen({ route }) {
  const [selectedCategory, setSelectedCategory] = useState('todas');

  // If we came from another screen (like HomeScreen) with a category selected
  useEffect(() => {
    if (route.params?.selectedCategory) {
      setSelectedCategory(route.params.selectedCategory);
    }
  }, [route.params?.selectedCategory]);

  const filteredItems = selectedCategory === 'todas'
    ? MENU_ITEMS
    : MENU_ITEMS.filter(item => item.category === selectedCategory);

  const handleAddItem = (itemName) => {
    Alert.alert(
      '✨ Agregado',
      `¡"${itemName}" se ha añadido al carrito de pedidos de simulación!`,
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
      <View style={styles.itemCard}>
        <View style={styles.itemEmojiContainer}>
          <Text style={styles.itemEmoji}>{item.emoji}</Text>
        </View>
        <View style={styles.itemDetails}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
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
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddItem(item.name)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color={COLORS.background} />
              <Text style={styles.addButtonText}>Agregar</Text>
            </TouchableOpacity>
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
        <Text style={styles.title}>Nuestro Menú 🍽️</Text>
        <Text style={styles.subtitle}>Selecciona tus delicias preferidas</Text>
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
            <Ionicons name="restaurant-outline" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No hay platillos en esta categoría por ahora.</Text>
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
  itemEmojiContainer: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.medium,
  },
  itemEmoji: {
    fontSize: 40,
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
  },
});
