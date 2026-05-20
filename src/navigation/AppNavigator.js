import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

// Import Stores
import { authStore } from '../data/authStore';
import { menuStore } from '../data/menuStore';

// Import Screens
import HomeScreen from '../screens/HomeScreen';
import MenuScreen from '../screens/MenuScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ReservationsScreen from '../screens/ReservationsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import HistoryDetailScreen from '../screens/HistoryDetailScreen';
import AIRecommendationScreen from '../screens/AIRecommendationScreen';
import LoginScreen from '../screens/LoginScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminDishesScreen from '../screens/AdminDishesScreen';
import AdminOrdersScreen from '../screens/AdminOrdersScreen';
import AdminReservationsScreen from '../screens/AdminReservationsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Home Stack Navigator (contains Home + AI Recommendation)
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="AIRecommendation" component={AIRecommendationScreen} />
    </Stack.Navigator>
  );
}

// History Stack Navigator (contains History List + Detail)
function HistoryStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="HistoryMain" component={HistoryScreen} />
      <Stack.Screen name="HistoryDetail" component={HistoryDetailScreen} />
    </Stack.Navigator>
  );
}

// Admin Stack Navigator (Dashboard -> Manage Dishes, Orders, Reservations)
function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="AdminMain" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminDishes" component={AdminDishesScreen} />
      <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} />
      <Stack.Screen name="AdminReservations" component={AdminReservationsScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await menuStore.loadMenu();
        const user = await authStore.loadSession();
        setCurrentUser(user);
      } catch (e) {
        console.error('Error during app initialization:', e);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    const unsubscribe = authStore.subscribe(setCurrentUser);
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopWidth: 1.5,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Menú') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Pedidos') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Reservaciones') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Historial') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Admin') {
            iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
          }

          return <Ionicons name={iconName} size={size - 1} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeStack} />
      <Tab.Screen name="Menú" component={MenuScreen} />
      <Tab.Screen name="Pedidos" component={OrdersScreen} />
      <Tab.Screen name="Reservaciones" component={ReservationsScreen} />
      <Tab.Screen name="Historial" component={HistoryStack} />
      {currentUser.role === 'administrador' && (
        <Tab.Screen name="Admin" component={AdminStack} />
      )}
    </Tab.Navigator>
  );
}
