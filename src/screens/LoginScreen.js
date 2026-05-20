import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme/colors';
import { authStore } from '../data/authStore';

export default function LoginScreen() {
  const [selectedRole, setSelectedRole] = useState('cliente'); // 'cliente' | 'administrador'
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    // Artificial delay for premium loader feel
    setTimeout(async () => {
      const res = await authStore.login(selectedRole, password);
      setLoading(false);
      if (!res.success) {
        setError(res.error);
      }
    }, 800);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo & Header */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="restaurant-outline" size={42} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Aura Gourmet</Text>
            <Text style={styles.subtitle}>Experiencia gastronómica inteligente</Text>
          </View>

          {/* Card Form */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Selecciona tu Perfil</Text>

            {/* Role Buttons Row */}
            <View style={styles.roleContainer}>
              {/* Cliente */}
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  selectedRole === 'cliente' && styles.roleCardActive,
                ]}
                onPress={() => {
                  setSelectedRole('cliente');
                  setError('');
                  setPassword('');
                }}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.roleIconBg,
                    selectedRole === 'cliente' ? styles.roleIconBgActive : null,
                  ]}
                >
                  <Ionicons
                    name="people"
                    size={22}
                    color={selectedRole === 'cliente' ? COLORS.background : COLORS.primary}
                  />
                </View>
                <Text
                  style={[
                    styles.roleLabel,
                    selectedRole === 'cliente' && styles.roleLabelActive,
                  ]}
                >
                  Cliente
                </Text>
              </TouchableOpacity>

              {/* Administrador */}
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  selectedRole === 'administrador' && styles.roleCardActive,
                ]}
                onPress={() => {
                  setSelectedRole('administrador');
                  setError('');
                }}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.roleIconBg,
                    selectedRole === 'administrador' ? styles.roleIconBgActive : null,
                  ]}
                >
                  <Ionicons
                    name="shield-half"
                    size={22}
                    color={selectedRole === 'administrador' ? COLORS.background : COLORS.primary}
                  />
                </View>
                <Text
                  style={[
                    styles.roleLabel,
                    selectedRole === 'administrador' && styles.roleLabelActive,
                  ]}
                >
                  Admin
                </Text>
              </TouchableOpacity>
            </View>

            {/* Password Input (only if admin) */}
            {selectedRole === 'administrador' && (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Contraseña de Administrador</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Escribe la clave (p. ej: admin)"
                    placeholderTextColor={COLORS.textSecondary}
                    secureTextEntry
                    value={password}
                    onChangeText={(val) => {
                      setPassword(val);
                      setError('');
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>
            )}

            {/* Error Message */}
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.background} />
              ) : (
                <>
                  <Text style={styles.buttonText}>Ingresar al Restaurante</Text>
                  <Ionicons name="arrow-forward" size={18} color={COLORS.background} style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SIZES.large,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SIZES.extraLarge + 10,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(232, 168, 56, 0.1)',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  title: {
    fontSize: SIZES.extraLarge + 4,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SIZES.large,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.medium,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: SIZES.large,
  },
  roleCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SIZES.large,
    alignItems: 'center',
    gap: 10,
  },
  roleCardActive: {
    backgroundColor: 'rgba(232, 168, 56, 0.05)',
    borderColor: COLORS.primary,
  },
  roleIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleIconBgActive: {
    backgroundColor: COLORS.primary,
  },
  roleLabel: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  roleLabelActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  inputWrapper: {
    marginBottom: SIZES.large,
  },
  inputLabel: {
    fontSize: SIZES.small + 1,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SIZES.medium,
  },
  inputIcon: {
    marginRight: SIZES.small,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: SIZES.font,
    paddingVertical: SIZES.medium - 2,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: COLORS.error,
    padding: SIZES.medium - 4,
    marginBottom: SIZES.large,
    gap: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.small + 1,
    fontWeight: '500',
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: SIZES.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: SIZES.font + 1,
    fontWeight: 'bold',
  },
});
