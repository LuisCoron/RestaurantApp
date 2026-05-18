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
import { AI_QUESTIONNAIRE, MENU_ITEMS } from '../data/mockData';
import { cartStore } from '../data/cartStore';

const { width } = Dimensions.get('window');

export default function AIRecommendationScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(0); // 0: Cravings, 1: Budget, 2: FoodType, 3: Loading, 4: Result
  const [answers, setAnswers] = useState({
    craving: null,
    budget: null,
    foodType: null,
  });
  const [recommendedDish, setRecommendedDish] = useState(null);
  const [aiReason, setAiReason] = useState('');

  const handleSelectAnswer = (key, value) => {
    const updatedAnswers = { ...answers, [key]: value };
    setAnswers(updatedAnswers);

    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last step answered, transition to loading state
      setCurrentStep(3);
      generateRecommendation(updatedAnswers);
    }
  };

  const generateRecommendation = (currentAnswers) => {
    // Simulate loading for 1.8 seconds to feel like the AI is "calculating"
    setTimeout(() => {
      let dish = null;

      // Simple recommendation rule engine
      if (currentAnswers.craving === 'dulce') {
        // Pick dessert
        const desserts = MENU_ITEMS.filter(item => item.category === 'postres');
        dish = desserts[Math.floor(Math.random() * desserts.length)];
      } else if (currentAnswers.craving === 'refrescante') {
        // Pick beverage
        const drinks = MENU_ITEMS.filter(item => item.category === 'bebidas');
        dish = drinks[Math.floor(Math.random() * drinks.length)];
      } else if (currentAnswers.craving === 'fresco') {
        // Salad or salmon or ravioli
        dish = MENU_ITEMS.find(item => item.id === 'fuerte_2') || MENU_ITEMS[0]; // Salmon
      } else {
        // Salado robusto
        if (currentAnswers.budget === 'premium') {
          dish = MENU_ITEMS.find(item => item.id === 'fuerte_1'); // Ribeye
        } else if (currentAnswers.foodType === 'casual') {
          dish = MENU_ITEMS.find(item => item.id === 'fuerte_4'); // Burger
        } else {
          dish = MENU_ITEMS.find(item => item.id === 'fuerte_3') || MENU_ITEMS[5]; // Ravioles or default
        }
      }

      // Fallback if none chosen
      if (!dish) {
        dish = MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)];
      }

      // Generate AI explanation based on answers
      let reason = '';
      if (dish.category === 'postres') {
        reason = `Hemos seleccionado para ti el delicioso "${dish.name}" porque buscas consentirte con un toque dulce y distinguido. Su textura y balance son perfectos para cerrar con broche de oro.`;
      } else if (dish.category === 'bebidas') {
        reason = `Tu antojo pide refrescarse, por lo que te recomendamos nuestra bebida insignia: "${dish.name}". Sus notas aromáticas y frescura de ingredientes naturales son la combinación que tu paladar necesita en este momento.`;
      } else if (dish.id === 'fuerte_1') {
        reason = `Buscando una experiencia robusta y gourmet sin límites, el "${dish.name}" es la joya de nuestra parrilla. Su marmoleo y cocción lenta a las brasas cumplirán con creces tu expectativa de sabor premium.`;
      } else if (dish.id === 'fuerte_4') {
        reason = `Para un antojo salado de estilo casual pero sofisticado, la "${dish.name}" es ideal. Su jugosa carne de res angus y el toque dulce de cebolla caramelizada te darán una explosión de sabor inigualable.`;
      } else {
        reason = `Para complacer tu antojo de hoy, nuestro Chef virtual ha seleccionado "${dish.name}". Su cuidada preparación artesanal y equilibrio de ingredientes frescos se adaptan fantásticamente a tu presupuesto y antojo.`;
      }

      setRecommendedDish(dish);
      setAiReason(reason);
      setCurrentStep(4);
    }, 1800);
  };

  const handleRestart = () => {
    setAnswers({ craving: null, budget: null, foodType: null });
    setRecommendedDish(null);
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

  // Renders the progress steps indicators
  const renderStepIndicators = () => {
    if (currentStep >= 3) return null;
    return (
      <View style={styles.stepIndicatorContainer}>
        {[0, 1, 2].map((step) => {
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
              {step < 2 && (
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
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gourmet IA ✨</Text>
        <TouchableOpacity
          style={styles.resetHeaderBtn}
          onPress={handleRestart}
          disabled={currentStep < 1 || currentStep === 3}
        >
          {currentStep > 0 && currentStep !== 3 && (
            <Ionicons name="refresh-outline" size={20} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* PROGRESS STEPPER */}
        {renderStepIndicators()}

        {/* STEP 0: CRAVINGS */}
        {currentStep === 0 && (
          <View style={styles.cardQuestion}>
            <Text style={styles.questionTitle}>¿Qué se te antoja hoy?</Text>
            <Text style={styles.questionSubtitle}>Tu antojo principal guiará nuestra recomendación</Text>

            <View style={styles.optionsList}>
              {AI_QUESTIONNAIRE.cravings.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={styles.optionBtn}
                  onPress={() => handleSelectAnswer('craving', opt.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionLabel}>{opt.label}</Text>
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
            <Text style={styles.questionSubtitle}>Buscamos adaptarnos perfectamente a ti</Text>

            <View style={styles.optionsList}>
              {AI_QUESTIONNAIRE.budget.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={styles.optionBtn}
                  onPress={() => handleSelectAnswer('budget', opt.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionLabel}>{opt.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* STEP 2: FOOD TYPE */}
        {currentStep === 2 && (
          <View style={styles.cardQuestion}>
            <Text style={styles.questionTitle}>¿Qué tipo de comida prefieres?</Text>
            <Text style={styles.questionSubtitle}>El estilo de cocina que deseas experimentar</Text>

            <View style={styles.optionsList}>
              {AI_QUESTIONNAIRE.foodType.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={styles.optionBtn}
                  onPress={() => handleSelectAnswer('foodType', opt.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionLabel}>{opt.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* STEP 3: LOADING SIMULATION */}
        {currentStep === 3 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginBottom: SIZES.large }} />
            <Text style={styles.loadingTitle}>Consultando con el Chef IA... 👨‍🍳</Text>
            <Text style={styles.loadingSubtitle}>
              Analizando tu antojo de comida, cruzando ingredientes frescos y diseñando tu maridaje perfecto...
            </Text>
          </View>
        )}

        {/* STEP 4: RECOMMENDATION RESULT */}
        {currentStep === 4 && recommendedDish && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitleHeader}>¡Recomendación Lista! 🎉</Text>

            {/* The recommendation card */}
            <View style={styles.recommendationCard}>

              <View style={styles.resultEmojiBg}>
                <Text style={styles.resultEmoji}>{recommendedDish.emoji}</Text>
              </View>

              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{recommendedDish.name}</Text>
                <Text style={styles.resultPrice}>{`$${recommendedDish.price.toFixed(2)}`}</Text>
                <Text style={styles.resultDesc}>{recommendedDish.description}</Text>
              </View>

              <View style={styles.aiExplanationCard}>
                <View style={styles.aiExplanationHeader}>
                  <Ionicons name="sparkles" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.aiExplanationTitle}>Análisis del Gourmet IA</Text>
                </View>
                <Text style={styles.aiExplanationText}>{aiReason}</Text>
              </View>
            </View>

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
    width: 50,
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
  },
  optionsList: {
    width: '100%',
  },
  optionBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.medium,
    marginBottom: SIZES.medium - 2,
  },
  optionLabel: {
    color: COLORS.text,
    fontSize: SIZES.font + 1,
    fontWeight: '500',
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
    height: 140,
    backgroundColor: 'rgba(232, 168, 56, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultEmoji: {
    fontSize: 70,
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
    marginBottom: SIZES.medium,
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
