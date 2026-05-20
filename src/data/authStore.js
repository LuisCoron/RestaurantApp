import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@restaurant_auth';

let currentUser = null;
let listeners = [];

const notify = () => {
  listeners.forEach(listener => listener(currentUser));
};

export const authStore = {
  async loadSession() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        currentUser = JSON.parse(raw);
      } else {
        currentUser = null;
      }
    } catch (e) {
      console.error('Error loading auth session:', e);
      currentUser = null;
    }
    notify();
    return currentUser;
  },

  getCurrentUser() {
    return currentUser;
  },

  async login(role, password = '') {
    if (role === 'administrador') {
      if (password.toLowerCase() !== 'admin') {
        return { success: false, error: 'Contraseña de administrador incorrecta' };
      }
      currentUser = { role: 'administrador', name: 'Administrador Aura' };
    } else {
      currentUser = { role: 'cliente', name: 'Cliente Aura' };
    }

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    } catch (e) {
      console.error('Error saving auth session:', e);
    }
    notify();
    return { success: true };
  },

  async logout() {
    currentUser = null;
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Error removing auth session:', e);
    }
    notify();
  },

  subscribe(listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },

  unsubscribe(listener) {
    listeners = listeners.filter(l => l !== listener);
  }
};
