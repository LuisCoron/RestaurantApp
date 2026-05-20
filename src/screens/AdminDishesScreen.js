import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  ScrollView,
  Switch,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme/colors';
import { menuStore } from '../data/menuStore';
import { CATEGORIES } from '../data/mockData';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const AVAILABLE_TAGS = ['picante', 'saludable', 'italiana', 'carnes', 'mariscos', 'dulce', 'queso', 'casual'];
const AVAILABLE_RESTRICTIONS = ['vegetariano', 'sin gluten', 'sin lactosa'];

export default function AdminDishesScreen({ navigation }) {
  const [menu, setMenu] = useState(menuStore.getMenu());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDishId, setEditingDishId] = useState(null); // Null means "Adding new dish"
  
  // Form Fields State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('entradas');
  const [emoji, setEmoji] = useState('🍽️');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState('15');
  const [image, setImage] = useState('');
  const [available, setAvailable] = useState(true);
  const [tags, setTags] = useState([]);
  const [restrictions, setRestrictions] = useState([]);

  // Subscribe to menuStore
  useEffect(() => {
    const unsub = menuStore.subscribe(setMenu);
    setMenu(menuStore.getMenu());
    return () => unsub();
  }, []);

  const filteredMenu = menu.filter(item => {
    const matchesCategory = selectedCategory === 'todas' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenForm = (dish = null) => {
    if (dish) {
      // Edit mode
      setEditingDishId(dish.id);
      setName(dish.name);
      setPrice(dish.price.toString());
      setCategory(dish.category);
      setEmoji(dish.emoji);
      setDescription(dish.description || '');
      setPrepTime((dish.prepTime || 15).toString());
      setImage(dish.image || '');
      setAvailable(dish.available !== false);
      setTags(dish.tags || []);
      setRestrictions(dish.restrictions || []);
    } else {
      // Create mode
      setEditingDishId(null);
      setName('');
      setPrice('');
      setCategory('entradas');
      setEmoji('🍽️');
      setDescription('');
      setPrepTime('15');
      setImage('');
      setAvailable(true);
      setTags([]);
      setRestrictions([]);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert('Error', 'Por favor, ingresa el nombre y el precio del platillo.');
      return;
    }

    const priceVal = parseFloat(price);
    if (isNaN(priceVal) || priceVal <= 0) {
      Alert.alert('Error', 'El precio debe ser un número positivo válido.');
      return;
    }

    const prepTimeVal = parseInt(prepTime);
    if (isNaN(prepTimeVal) || prepTimeVal <= 0) {
      Alert.alert('Error', 'El tiempo de preparación debe ser un número entero positivo.');
      return;
    }

    const defaultImg = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600';
    const dishData = {
      name: name.trim(),
      price: priceVal,
      category,
      emoji: emoji.trim() || '🍽️',
      description: description.trim(),
      prepTime: prepTimeVal,
      image: image.trim() || defaultImg,
      available,
      tags,
      restrictions,
    };

    if (editingDishId) {
      await menuStore.editDish(editingDishId, dishData);
      Alert.alert('✨ Actualizado', 'El platillo ha sido actualizado exitosamente.');
    } else {
      await menuStore.addDish(dishData);
      Alert.alert('✨ Creado', 'El platillo ha sido agregado al menú exitosamente.');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id, dishName) => {
    Alert.alert(
      '🚨 Eliminar Platillo',
      `¿Estás seguro de que deseas eliminar permanentemente "${dishName}" del menú?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, eliminar',
          style: 'destructive',
          onPress: async () => {
            await menuStore.deleteDish(id);
            Alert.alert('Eliminado', 'El platillo ha sido retirado del menú.');
          },
        },
      ]
    );
  };

  const toggleTag = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const toggleRestriction = (res) => {
    if (restrictions.includes(res)) {
      setRestrictions(restrictions.filter(r => r !== res));
    } else {
      setRestrictions([...restrictions, res]);
    }
  };

  const renderDishItem = ({ item }) => {
    return (
      <View style={styles.dishCard}>
        <View style={styles.dishHeader}>
          <Text style={styles.dishEmoji}>{item.emoji}</Text>
          <View style={styles.dishDetails}>
            <Text style={styles.dishName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.dishMeta}>
              {CATEGORIES.find(c => c.id === item.category)?.name} • ${item.price.toFixed(0)} • {item.prepTime} min
            </Text>
          </View>
          <View style={[styles.statusIndicator, { backgroundColor: item.available ? COLORS.success : COLORS.error }]}>
            <Text style={styles.statusText}>{item.available ? 'Dispo' : 'Agotado'}</Text>
          </View>
        </View>

        {item.description ? (
          <Text style={styles.dishDesc} numberOfLines={2}>{item.description}</Text>
        ) : null}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => handleOpenForm(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={16} color={COLORS.primary} />
            <Text style={styles.editBtnText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDelete(item.id, item.name)}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={16} color={COLORS.error} />
            <Text style={styles.deleteBtnText}>Eliminar</Text>
          </TouchableOpacity>
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
          <Text style={styles.title}>Gestión de Menú 🍽️</Text>
          <Text style={styles.subtitle}>Administrar platillos en tiempo real</Text>
        </View>
      </View>

      {/* Controls: Search and Add Button */}
      <View style={styles.controlsContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => handleOpenForm(null)}
          activeOpacity={0.9}
        >
          <Ionicons name="add" size={22} color={COLORS.background} />
          <Text style={styles.addBtnText}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter Chips */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {cat.emoji} {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Dishes List */}
      <FlatList
        data={filteredMenu}
        renderItem={renderDishItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No hay platillos en esta categoría.</Text>
          </View>
        }
      />

      {/* Create / Edit Dish Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingDishId ? 'Editar Platillo' : 'Nuevo Platillo'}
              </Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Form */}
            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              
              {/* Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Nombre del Platillo *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ej: Tacos de Ribeye"
                  placeholderTextColor={COLORS.textSecondary}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Price & Emoji Row */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.formLabel}>Precio ($ MXN) *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Ej: 240"
                    placeholderTextColor={COLORS.textSecondary}
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                  />
                </View>
                <View style={[styles.formGroup, { width: 90 }]}>
                  <Text style={styles.formLabel}>Emoji</Text>
                  <TextInput
                    style={[styles.formInput, { textAlign: 'center' }]}
                    placeholder="🍔"
                    placeholderTextColor={COLORS.textSecondary}
                    value={emoji}
                    onChangeText={setEmoji}
                  />
                </View>
              </View>

              {/* Category selector */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Categoría</Text>
                <View style={styles.categorySelectorRow}>
                  {CATEGORIES.filter(c => c.id !== 'todas').map(cat => {
                    const isSelected = category === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[styles.selectorChip, isSelected && styles.selectorChipActive]}
                        onPress={() => setCategory(cat.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.selectorChipText, isSelected && styles.selectorChipTextActive]}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Descripción</Text>
                <TextInput
                  style={[styles.formInput, styles.formMultilineInput]}
                  placeholder="Detalles sobre el sabor, ingredientes y preparación..."
                  placeholderTextColor={COLORS.textSecondary}
                  multiline
                  numberOfLines={3}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              {/* PrepTime & Image URL */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { width: 110, marginRight: 10 }]}>
                  <Text style={styles.formLabel}>Tiempo (Min) *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="15"
                    placeholderTextColor={COLORS.textSecondary}
                    keyboardType="numeric"
                    value={prepTime}
                    onChangeText={setPrepTime}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>URL de Imagen (Unsplash)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="https://images.unsplash.com/..."
                    placeholderTextColor={COLORS.textSecondary}
                    value={image}
                    onChangeText={setImage}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Availability Switch */}
              <View style={styles.switchGroup}>
                <View>
                  <Text style={styles.switchTitle}>Disponibilidad</Text>
                  <Text style={styles.switchSubtitle}>Mostrar en el menú como disponible para ordenar</Text>
                </View>
                <Switch
                  value={available}
                  onValueChange={setAvailable}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor={Platform.OS === 'ios' ? '#fff' : COLORS.card}
                />
              </View>

              {/* Restrictions */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Restricciones Alimenticias (Certificación)</Text>
                <View style={styles.pillsContainer}>
                  {AVAILABLE_RESTRICTIONS.map(res => {
                    const isSelected = restrictions.includes(res);
                    return (
                      <TouchableOpacity
                        key={res}
                        style={[styles.pill, isSelected && styles.pillActive]}
                        onPress={() => toggleRestriction(res)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                          {res}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Tags */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Etiquetas de Sabor / Estilo</Text>
                <View style={styles.pillsContainer}>
                  {AVAILABLE_TAGS.map(tag => {
                    const isSelected = tags.includes(tag);
                    return (
                      <TouchableOpacity
                        key={tag}
                        style={[styles.pill, isSelected && styles.pillActive]}
                        onPress={() => toggleTag(tag)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                          {tag}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsModalOpen(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                activeOpacity={0.9}
              >
                <Text style={styles.saveBtnText}>Guardar Platillo</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

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
  controlsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.medium,
    gap: 10,
    marginBottom: SIZES.small,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.base + 2,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: SIZES.font,
    padding: 0,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: SIZES.medium,
    justifyContent: 'center',
  },
  addBtnText: {
    color: COLORS.background,
    fontSize: SIZES.font,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  categoryContainer: {
    marginVertical: SIZES.base,
  },
  categoryScroll: {
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
  dishCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
  },
  dishHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dishEmoji: {
    fontSize: 26,
    marginRight: 10,
  },
  dishDetails: {
    flex: 1,
    marginRight: 10,
  },
  dishName: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  dishMeta: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: 'bold',
  },
  dishDesc: {
    fontSize: SIZES.small + 1,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  editBtn: {
    borderColor: 'rgba(232, 168, 56, 0.3)',
    backgroundColor: 'rgba(232, 168, 56, 0.05)',
  },
  editBtnText: {
    color: COLORS.primary,
    fontSize: SIZES.small + 1,
    fontWeight: 'bold',
  },
  deleteBtn: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  deleteBtnText: {
    color: COLORS.error,
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
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: SCREEN_HEIGHT * 0.85,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.medium + 4,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    padding: SIZES.large,
  },
  formGroup: {
    marginBottom: SIZES.large,
  },
  formLabel: {
    fontSize: SIZES.small + 1,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.medium - 4,
    color: COLORS.text,
    fontSize: SIZES.font,
  },
  formMultilineInput: {
    textAlignVertical: 'top',
    paddingTop: SIZES.small,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: SIZES.base,
  },
  categorySelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectorChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  selectorChipActive: {
    backgroundColor: 'rgba(232, 168, 56, 0.1)',
    borderColor: COLORS.primary,
  },
  selectorChipText: {
    fontSize: SIZES.small + 1,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  selectorChipTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SIZES.medium,
    marginBottom: SIZES.large,
  },
  switchTitle: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  switchSubtitle: {
    fontSize: SIZES.small - 1,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  pillTextActive: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    padding: SIZES.large,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    gap: 12,
    backgroundColor: COLORS.card,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SIZES.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: COLORS.text,
    fontSize: SIZES.font,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: SIZES.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    color: COLORS.background,
    fontSize: SIZES.font,
    fontWeight: 'bold',
  },
});
