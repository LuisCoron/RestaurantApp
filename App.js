import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [loading, setLoading] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1800,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.logo}>🍽️</Text>

          <Text style={styles.title}>
            Aura Gourmet
          </Text>

          <Text style={styles.subtitle}>
            Experiencia gastronómica inteligente
          </Text>

          <ActivityIndicator
            size="large"
            color="#D4A537"
            style={{ marginTop: 30 }}
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
        <StatusBar style="light" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0B0B1A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },

  logo: {
    fontSize: 70,
    textAlign: 'center',
    marginBottom: 20,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  subtitle: {
    color: '#B0B0C3',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
});