import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme/colors';
import { MENU_ITEMS } from '../data/mockData';
import { cartStore } from '../data/cartStore';

const { width } = Dimensions.get('window');

// ── Questionnaire Options ──

const FOOD_TYPES = [
  { id: 'entradas', label: '🥗 Entradas', desc: 'Aperitivos ligeros para abrir el apetito', value: 'entradas' },
  { id: 'fuertes', label: '🥩 Platillos Fuertes', desc: 'Platos fuertes sustanciosos', value: 'fuertes' },
  { id: 'bebidas', label: '🍹 Bebidas', desc: 'Cócteles, vino o limonadas refrescantes', value: 'bebidas' },
  { id: 'postres', label: '🍰 Postres', desc: 'Una dulzura para finalizar', value: 'postres' },
  { id: 'cualquiera', label: '🍽️ Cualquier Tipo', desc: 'Explora todas las opciones del menú', value: 'cualquiera' },
];

const BUDGET_OPTIONS = [
  { id: 'bajo', label: '💵 Económico', desc: 'Hasta $150 MXN', value: 'bajo' },
  { id: 'medio', label: '💸 Moderado', desc: 'De $150 a $300 MXN', value: 'medio' },
  { id: 'alto', label: '👑 Gourmet', desc: 'Más de $300 MXN', value: 'alto' },
  { id: 'cualquiera', label: '✨ Sin Límite', desc: 'Lo mejor que recomiende el Chef', value: 'cualquiera' },
];

const HUNGER_LEVELS = [
  { id: 'ligero', label: '🍃 Poca Hambre', desc: 'Algo ligero o un antojo rápido', value: 'ligero' },
  { id: 'moderado', label: '🍽️ Hambre Normal', desc: 'Un plato equilibrado y satisfactorio', value: 'moderado' },
  { id: 'voraz', label: '🦖 Mucha Hambre', desc: 'Un festín robusto y sustancioso', value: 'voraz' },
];

const PREFERENCE_OPTIONS = [
  { id: 'picante', label: '🌶️ Picante', value: 'picante' },
  { id: 'dulce', label: '🧁 Dulce', value: 'dulce' },
  { id: 'italiana', label: '🍕 Italiana', value: 'italiana' },
  { id: 'carnes', label: '🥩 Carnes', value: 'carnes' },
  { id: 'mariscos', label: '🐟 Mariscos', value: 'mariscos' },
  { id: 'saludable', label: '🥗 Saludable / Ligero', value: 'saludable' },
];

const DIETARY_OPTIONS = [
  { id: 'vegetariano', label: '🥦 Vegetariano', value: 'vegetariano' },
  { id: 'sin gluten', label: '🌾 Sin Gluten', value: 'sin gluten' },
  { id: 'sin lactosa', label: '🥛 Sin Lactosa', value: 'sin lactosa' },
  { id: 'ninguna', label: '🚫 Ninguna', value: 'ninguna' },
];

export default function AIRecommendationScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(0); 
  // Steps: 0: FoodType, 1: Budget, 2: Hunger, 3: Preferences (Multi), 4: Dietary (Multi), 5: Loading, 6: Result

  const [answers, setAnswers] = useState({
    foodType: 'cualquiera',
    budget: 'cualquiera',
    hungerLevel: 'moderado',
    preferences: [],
    dietaryRestrictions: ['ninguna'],
  });

  const [recommendedDish, setRecommendedDish] = useState(null);
  const [similarDishes, setSimilarDishes] = useState([]);
  const [aiReason, setAiReason] = useState('');

  const handleSelectSingle = (key, value) => {
    const updatedAnswers = { ...answers, [key]: value };
    setAnswers(updatedAnswers);
    setCurrentStep(currentStep + 1);
  };

  const togglePreference = (value) => {
    const current = answers.preferences;
    let updated;
    if (current.includes(value)) {
      updated = current.filter(p => p !== value);
    } else {
      updated = [...current, value];
    }
    setAnswers({ ...answers, preferences: updated });
  };

  const toggleDietary = (value) => {
    const current = answers.dietaryRestrictions;
    let updated;
    if (value === 'ninguna') {
      updated = ['ninguna'];
    } else {
      if (current.includes(value)) {
        updated = current.filter(r => r !== value);
      } else {
        updated = [...current.filter(r => r !== 'ninguna'), value];
      }
      if (updated.length === 0) {
        updated = ['ninguna'];
      }
    }
    setAnswers({ ...answers, dietaryRestrictions: updated });
  };

  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleFinishQuestionnaire = () => {
    setCurrentStep(5); // Loading state
    generateRecommendation(answers);
  };

  const handleBack = () => {
    if (currentStep > 0 && currentStep !== 5) {
      if (currentStep === 6) {
        setCurrentStep(4); // Go back to dietary restrictions
      } else {
        setCurrentStep(currentStep - 1);
      }
    } else {
      navigation.goBack();
    }
  };

  // ── AI Recommendation Local Engine ──
  
  const generateRecommendation = (currentAnswers) => {
    setTimeout(() => {
      let candidates = [...MENU_ITEMS];
      const activeRestrictions = currentAnswers.dietaryRestrictions.filter(r => r !== 'ninguna');

      // 1. Filter out items violating dietary restrictions
      if (activeRestrictions.length > 0) {
        candidates = candidates.filter(item => {
          return activeRestrictions.every(res => item.restrictions && item.restrictions.includes(res));
        });
      }

      // 2. Budget filter
      let budgetFilter = [...candidates];
      if (currentAnswers.budget === 'bajo') {
        budgetFilter = candidates.filter(item => item.price <= 150);
      } else if (currentAnswers.budget === 'medio') {
        budgetFilter = candidates.filter(item => item.price > 150 && item.price <= 300);
      } else if (currentAnswers.budget === 'alto') {
        budgetFilter = candidates.filter(item => item.price > 300);
      }

      // If budget filter results in empty candidates, ignore budget filter but keep dietary constraints
      if (budgetFilter.length > 0) {
        candidates = budgetFilter;
      }

      // 3. Category Filter (Food Type)
      if (currentAnswers.foodType !== 'cualquiera') {
        const typeFilter = candidates.filter(item => item.category === currentAnswers.foodType);
        if (typeFilter.length > 0) {
          candidates = typeFilter;
        }
      }

      // 4. Score remaining items based on preferences and hunger level
      const scoredCandidates = candidates.map(item => {
        let score = 0;

        // Preferences match: +10 per matching tag
        currentAnswers.preferences.forEach(pref => {
          if (item.tags && item.tags.includes(pref)) {
            score += 10;
          }
        });

        // Hunger match
        if (currentAnswers.hungerLevel === 'ligero') {
          if (item.category === 'entradas' || item.category === 'bebidas' || item.category === 'postres') {
            score += 8;
          } else if (item.category === 'fuertes') {
            score -= 10; // Penalize heavy mains for light hunger
          }
        } else if (currentAnswers.hungerLevel === 'voraz') {
          if (item.category === 'fuertes') {
            score += 12; // Favor heavy mains
          } else if (item.category === 'bebidas' || item.category === 'entradas') {
            score -= 4; // Penalize small dishes
          }
        } else { // moderado
          if (item.category === 'fuertes' || item.category === 'entradas') {
            score += 5;
          }
        }

        // Secondary price alignment
        if (currentAnswers.budget === 'bajo' && item.price <= 100) score += 3;
        if (currentAnswers.budget === 'medio' && item.price >= 200 && item.price <= 280) score += 3;
        if (currentAnswers.budget === 'alto' && item.price >= 400) score += 3;

        return { item, score };
      });

      // Sort by score descending
      scoredCandidates.sort((a, b) => b.score - a.score);

      // Best recommendation
      let recommended = scoredCandidates[0]?.item;
      if (!recommended) {
        // Ultimate fallback
        recommended = MENU_ITEMS.find(m => activeRestrictions.every(r => m.restrictions?.includes(r))) || MENU_ITEMS[0];
      }

      // Similar items (next best matching candidates)
      let similar = scoredCandidates.slice(1, 4).map(sc => sc.item);
      
      // Pad similar dishes if we have less than 3
      if (similar.length < 3) {
        const existingIds = new Set([recommended.id, ...similar.map(s => s.id)]);
        const extras = MENU_ITEMS.filter(item => {
          if (existingIds.has(item.id)) return false;
          if (activeRestrictions.length > 0) {
            return activeRestrictions.every(res => item.restrictions && item.restrictions.includes(res));
          }
          return true;
        });
        similar = [...similar, ...extras].slice(0, 3);
      }

      const reason = buildDynamicReason(recommended, currentAnswers);

      setRecommendedDish(recommended);
      setSimilarDishes(similar);
      setAiReason(reason);
      setCurrentStep(6);
    }, 1800);
  };

  const buildDynamicReason = (dish, currentAnswers) => {
    const foodTypeLabel = FOOD_TYPES.find(f => f.value === currentAnswers.foodType)?.label.split(' ').slice(1).join(' ') || 'platillos';
    const budgetLabel = BUDGET_OPTIONS.find(b => b.value === currentAnswers.budget)?.label.split(' ').slice(1).join(' ');
    const hungerLabel = HUNGER_LEVELS.find(h => h.value === currentAnswers.hungerLevel)?.label.split(' ').slice(1).join(' ');

    let parts = [];
    parts.push(`Hemos recomendado **${dish.name}** porque se ajusta de manera ideal a tu búsqueda de **${foodTypeLabel}** dentro del presupuesto **${budgetLabel}**.`);

    if (currentAnswers.hungerLevel === 'ligero') {
      parts.push(`Para tu apetito **${hungerLabel}**, este platillo de preparación fresca ofrece una porción equilibrada sin sentirse pesado.`);
    } else if (currentAnswers.hungerLevel === 'voraz') {
      parts.push(`Dado tu apetito **${hungerLabel}**, esta opción sustanciosa y rica en ingredientes saciará tu apetito por completo.`);
    } else {
      parts.push(`Con un nivel de apetito **${hungerLabel}**, representa la porción de tamaño estándar y balanceada perfecta.`);
    }

    const matchedPrefs = currentAnswers.preferences.filter(pref => dish.tags && dish.tags.includes(pref));
    if (matchedPrefs.length > 0) {
      const prefNames = matchedPrefs.map(p => PREFERENCE_OPTIONS.find(pr => pr.value === p)?.label.split(' ').slice(1).join(' '));
      parts.push(`Destaca por cumplir con tu preferencia de sabores de estilo **${prefNames.join(', ')}**.`);
    }

    const activeRestrictions = currentAnswers.dietaryRestrictions.filter(r => r !== 'ninguna');
    if (activeRestrictions.length > 0) {
      const restNames = activeRestrictions.map(r => DIETARY_OPTIONS.find(dr => dr.value === r)?.label.split(' ').slice(1).join(' '));
      parts.push(`Asimismo, está certificado como seguro y apto para tu perfil alimenticio **${restNames.join(', ')}**.`);
    }

    return parts.join(' ');
  };

  // Swapping main recommendation with similar dishes
  const handleSelectSimilar = (selectedSimilar) => {
    const newSimilar = similarDishes.map(d => d.id === selectedSimilar.id ? recommendedDish : d);
    const newReason = buildDynamicReason(selectedSimilar, answers);
    setRecommendedDish(selectedSimilar);
    setSimilarDishes(newSimilar);
    setAiReason(newReason);
  };

  const handleRestart = () => {
    setAnswers({
      foodType: 'cualquiera',
      budget: 'cualquiera',
      hungerLevel: 'moderado',
      preferences: [],
      dietaryRestrictions: ['ninguna'],
    });
    setRecommendedDish(null);
    setSimilarDishes([]);
    setAiReason('');
    setCurrentStep(0);
  };

  const handleAddToCart = (dish) => {
    cartStore.addToCart(dish, 1);
    Alert.alert(
      '✨ Agregado por la IA',
      `¡"${dish.name}" ha sido añadido a tu carrito directamente desde las recomendaciones!`,
      [
        { text: 'Genial', style: 'default' },
        { text: 'Ir al Carrito', onPress: () => navigation.navigate('Pedidos') }
      ]
    );
  };

  // Helper to split text by ** and style odd elements as bold
  const renderFormattedText = (text) => {
    if (!text) return null;
    const parts = text.split('**');
    return parts.map((part, index) => {
      const isBold = index % 2 === 1;
      return (
        <Text key={index} style={isBold ? styles.boldText : null}>
          {part}
        </Text>
      );
    });
  };

  // Renders the 5 progress steps indicators
  const renderStepIndicators = () => {
    if (currentStep >= 5) return null;
    return (
      <View style={styles.stepIndicatorContainer}>
        {[0, 1, 2, 3, 4].map((step) => {
          const isActive = currentStep === step;
          const isDone = currentStep > step;
          return (
            <View key={step} style={styles.indicatorWrapper}>
              <View
                style={[
                  styles.indicatorDot,
                  isActive && styles.indicatorActive,
                  isDone && styles.indicatorDone
                ]}
              >
                {isDone ? (
                  <Ionicons name="checkmark" size={12} color={COLORS.background} />
                ) : (
                  <Text style={[styles.indicatorText, isActive && styles.indicatorTextActive]}>
                    {step + 1}
                  </Text>
                )}
              </View>
              {step < 4 && (
                <View style={[styles.indicatorLine, isDone && styles.indicatorLineDone]} />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gourmet IA ✨</Text>
        <TouchableOpacity
          style={styles.resetHeaderBtn}
          onPress={handleRestart}
          disabled={currentStep < 1 || currentStep === 5}
        >
          {currentStep > 0 && currentStep !== 5 && (
            <Ionicons name="refresh-outline" size={20} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* PROGRESS STEPPER */}
        {renderStepIndicators()}

        {/* STEP 0: FOOD TYPE (Desired Category) */}
        {currentStep === 0 && (
          <View style={styles.cardQuestion}>
            <Text style={styles.questionTitle}>¿Qué tipo de comida deseas?</Text>
            <Text style={styles.questionSubtitle}>Selecciona la categoría principal de tu antojo de hoy</Text>

            <View style={styles.optionsList}>
              {FOOD_TYPES.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={styles.optionBtn}
                  onPress={() => handleSelectSingle('foodType', opt.value)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionLabel}>{opt.label}</Text>
                    <Text style={styles.optionDesc}>{opt.desc}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* STEP 1: BUDGET */}
        {currentStep === 1 && (
          <View style={styles.cardQuestion}>
            <Text style={styles.questionTitle}>¿Cuál es tu presupuesto estimado?</Text>
            <Text style={styles.questionSubtitle}>Buscamos opciones que se ajusten perfectamente a tu bolsillo</Text>

            <View style={styles.optionsList}>
              {BUDGET_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={styles.optionBtn}
                  onPress={() => handleSelectSingle('budget', opt.value)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionLabel}>{opt.label}</Text>
                    <Text style={styles.optionDesc}>{opt.desc}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* STEP 2: HUNGER LEVEL */}
        {currentStep === 2 && (
          <View style={styles.cardQuestion}>
            <Text style={styles.questionTitle}>¿Qué tan hambriento estás?</Text>
            <Text style={styles.questionSubtitle}>Calculamos la densidad ideal para tu plato</Text>

            <View style={styles.optionsList}>
              {HUNGER_LEVELS.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={styles.optionBtn}
                  onPress={() => handleSelectSingle('hungerLevel', opt.value)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionLabel}>{opt.label}</Text>
                    <Text style={styles.optionDesc}>{opt.desc}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* STEP 3: PREFERENCES (Multi-select) */}
        {currentStep === 3 && (
          <View style={styles.cardQuestion}>
            <Text style={styles.questionTitle}>Selecciona tus preferencias</Text>
            <Text style={styles.questionSubtitle}>Elige los perfiles de sabor que más te atraen (puedes elegir varios)</Text>

            <View style={styles.gridOptions}>
              {PREFERENCE_OPTIONS.map((opt) => {
                const isSelected = answers.preferences.includes(opt.value);
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.gridPill, isSelected && styles.gridPillSelected]}
                    onPress={() => togglePreference(opt.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.gridPillText, isSelected && styles.gridPillTextSelected]}>
                      {opt.label}
                    </Text>
                    <Ionicons
                      name={isSelected ? "checkmark-circle" : "add-circle-outline"}
                      size={18}
                      color={isSelected ? COLORS.background : COLORS.primary}
                      style={{ marginLeft: 6 }}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.continueBtn}
              onPress={handleNextStep}
              activeOpacity={0.8}
            >
              <Text style={styles.continueBtnText}>Siguiente paso</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.background} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 4: DIETARY RESTRICTIONS (Multi-select) */}
        {currentStep === 4 && (
          <View style={styles.cardQuestion}>
            <Text style={styles.questionTitle}>Restricciones Alimenticias</Text>
            <Text style={styles.questionSubtitle}>Indica intolerancias o hábitos alimenticios obligatorios</Text>

            <View style={styles.gridOptions}>
              {DIETARY_OPTIONS.map((opt) => {
                const isSelected = answers.dietaryRestrictions.includes(opt.value);
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.gridPill, isSelected && styles.gridPillSelected]}
                    onPress={() => toggleDietary(opt.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.gridPillText, isSelected && styles.gridPillTextSelected]}>
                      {opt.label}
                    </Text>
                    <Ionicons
                      name={isSelected ? "checkmark-circle" : "add-circle-outline"}
                      size={18}
                      color={isSelected ? COLORS.background : COLORS.primary}
                      style={{ marginLeft: 6 }}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.continueBtn, { backgroundColor: COLORS.primary }]}
              onPress={handleFinishQuestionnaire}
              activeOpacity={0.8}
            >
              <Text style={[styles.continueBtnText, { color: COLORS.background }]}>Generar Recomendación ✨</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 5: LOADING SIMULATION */}
        {currentStep === 5 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginBottom: SIZES.large }} />
            <Text style={styles.loadingTitle}>Consultando con el Chef IA... 👨‍🍳</Text>
            <Text style={styles.loadingSubtitle}>
              Analizando tus antojos de comida, cruzando ingredientes frescos, validando tu perfil y diseñando tu maridaje perfecto...
            </Text>
          </View>
        )}

        {/* STEP 6: RECOMMENDATION RESULT */}
        {currentStep === 6 && recommendedDish && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitleHeader}>¡Tu Recomendación está Lista! 🎉</Text>

            {/* Recommended dish main card */}
            <View style={styles.recommendationCard}>
              <View style={styles.resultEmojiBg}>
                <Text style={styles.resultEmoji}>{recommendedDish.emoji}</Text>
                {/* Badges container for quick identification */}
                <View style={styles.badgesWrapper}>
                  {recommendedDish.prepTime && (
                    <View style={[styles.badge, styles.badgeTime]}>
                      <Ionicons name="time-outline" size={12} color={COLORS.white} style={{ marginRight: 3 }} />
                      <Text style={styles.badgeText}>{`${recommendedDish.prepTime} min`}</Text>
                    </View>
                  )}
                  {recommendedDish.restrictions && recommendedDish.restrictions.map((r) => {
                    let styleBg = styles.badgeRest;
                    if (r === 'vegetariano') styleBg = styles.badgeVeg;
                    if (r === 'sin gluten') styleBg = styles.badgeGluten;
                    return (
                      <View key={r} style={[styles.badge, styleBg]}>
                        <Text style={styles.badgeText}>{r.toUpperCase()}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{recommendedDish.name}</Text>
                <Text style={styles.resultPrice}>{`$${recommendedDish.price.toFixed(2)} MXN`}</Text>
                <Text style={styles.resultDesc}>{recommendedDish.description}</Text>
              </View>

              {/* AI Explanation Card */}
              <View style={styles.aiExplanationCard}>
                <View style={styles.aiExplanationHeader}>
                  <Ionicons name="sparkles" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.aiExplanationTitle}>Análisis del Gourmet IA</Text>
                </View>
                <Text style={styles.aiExplanationText}>
                  {renderFormattedText(aiReason)}
                </Text>
              </View>
            </View>

            {/* SIMILAR DISHES CAROUSEL */}
            {similarDishes.length > 0 && (
              <View style={styles.similarSection}>
                <Text style={styles.similarTitle}>Otras recomendaciones similares:</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.similarList}
                >
                  {similarDishes.map((dish) => (
                    <TouchableOpacity
                      key={dish.id}
                      style={styles.similarCard}
                      onPress={() => handleSelectSimilar(dish)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.similarEmoji}>{dish.emoji}</Text>
                      <Text style={styles.similarName} numberOfLines={1}>{dish.name}</Text>
                      <Text style={styles.similarPrice}>{`$${dish.price}`}</Text>
                      <View style={styles.similarTime}>
                        <Ionicons name="time-outline" size={11} color={COLORS.textSecondary} />
                        <Text style={styles.similarTimeText}>{` ${dish.prepTime}m`}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Action Buttons */}
            <TouchableOpacity
              style={styles.orderDishBtn}
              onPress={() => handleAddToCart(recommendedDish)}
              activeOpacity={0.9}
            >
              <Ionicons name="cart" size={20} color={COLORS.background} style={{ marginRight: 6 }} />
              <Text style={styles.orderDishBtnText}>Pedir este Platillo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tryAgainBtn}
              onPress={handleRestart}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.tryAgainBtnText}>Hacer otra consulta</Text>
            </TouchableOpacity>
          </View>
        )}

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
  resetHeaderBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: SIZES.medium,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SIZES.medium + 4,
  },
  indicatorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  indicatorActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.card,
  },
  indicatorDone: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  indicatorText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.small,
    fontWeight: 'bold',
  },
  indicatorTextActive: {
    color: COLORS.primary,
  },
  indicatorLine: {
    width: 32,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  indicatorLineDone: {
    backgroundColor: COLORS.primary,
  },
  cardQuestion: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: SIZES.large,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SIZES.base,
  },
  questionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.base,
  },
  questionSubtitle: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.large + 6,
    lineHeight: 18,
  },
  optionsList: {
    width: '100%',
  },
  optionBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: SIZES.medium - 2,
    paddingHorizontal: SIZES.medium,
    marginBottom: SIZES.medium - 2,
  },
  optionTextContainer: {
    flex: 1,
    marginRight: SIZES.small,
  },
  optionLabel: {
    color: COLORS.text,
    fontSize: SIZES.font + 1,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionDesc: {
    color: COLORS.textSecondary,
    fontSize: SIZES.small,
    lineHeight: 14,
  },
  gridOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: SIZES.large + 6,
  },
  gridPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  gridPillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  gridPillText: {
    color: COLORS.text,
    fontWeight: '500',
    fontSize: SIZES.font,
  },
  gridPillTextSelected: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  continueBtn: {
    backgroundColor: 'rgba(232, 168, 56, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: SIZES.medium,
    marginTop: SIZES.base,
  },
  continueBtnText: {
    color: COLORS.primary,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: SIZES.large,
  },
  loadingTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.base,
  },
  loadingSubtitle: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  resultContainer: {
    marginTop: SIZES.base,
  },
  resultTitleHeader: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.medium,
  },
  recommendationCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    overflow: 'hidden',
    marginBottom: SIZES.large,
  },
  resultEmojiBg: {
    height: 150,
    backgroundColor: 'rgba(232, 168, 56, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    position: 'relative',
  },
  resultEmoji: {
    fontSize: 74,
  },
  badgesWrapper: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 0.5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  badgeTime: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  badgeVeg: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  badgeGluten: {
    backgroundColor: '#F57C00',
    borderColor: '#F57C00',
  },
  badgeRest: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: COLORS.border,
  },
  resultInfo: {
    padding: SIZES.medium + 4,
  },
  resultName: {
    fontSize: SIZES.extraLarge - 2,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  resultPrice: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SIZES.medium,
  },
  resultDesc: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SIZES.base,
  },
  aiExplanationCard: {
    backgroundColor: 'rgba(232, 168, 56, 0.08)',
    borderTopWidth: 1.5,
    borderTopColor: COLORS.primary,
    padding: SIZES.medium,
  },
  aiExplanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  aiExplanationTitle: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: SIZES.font,
  },
  aiExplanationText: {
    color: COLORS.text,
    fontSize: SIZES.font - 1,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  similarSection: {
    marginBottom: SIZES.large + 4,
  },
  similarTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.medium - 4,
  },
  similarList: {
    gap: 12,
    paddingRight: SIZES.medium,
  },
  similarCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 12,
    width: 140,
    alignItems: 'center',
  },
  similarEmoji: {
    fontSize: 36,
    marginBottom: SIZES.base - 4,
  },
  similarName: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: SIZES.font - 1,
    textAlign: 'center',
    width: '100%',
  },
  similarPrice: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: SIZES.font - 1,
    marginVertical: 2,
  },
  similarTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  similarTimeText: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  orderDishBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: SIZES.medium,
    marginBottom: 12,
  },
  orderDishBtnText: {
    color: COLORS.background,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  tryAgainBtn: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  tryAgainBtnText: {
    color: COLORS.primary,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  footerSpacing: {
    height: 40,
  },
});
