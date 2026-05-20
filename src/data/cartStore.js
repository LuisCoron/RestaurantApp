import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { MOCK_CART, ORDER_HISTORY } from './mockData';

// --- SHOPPING CART STATE ---
let cart = [];
let cartListeners = [];

// Guardar carrito
const saveCart = async () => {
  try {
    await AsyncStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    Alert.alert(
      'Error',
      'No se pudo guardar el carrito.'
    );
    console.log('Error guardando carrito:', error);
  }
};

// Cargar carrito
const loadCart = async () => {
  try {
    const savedCart = await AsyncStorage.getItem('cart');

    if (savedCart !== null) {
      cart = JSON.parse(savedCart);
      notifyCart();
    } else {
      cart = [...MOCK_CART];
      notifyCart();
    }
  } catch (error) {
    Alert.alert(
      'Error',
      'No se pudo cargar el carrito.'
    );
    console.log('Error cargando carrito:', error);
  }
};

const notifyCart = () => {
  saveCart();
  cartListeners.forEach(listener => listener([...cart]));
};

export const cartStore = {
  getCart() {
    return [...cart];
  },

  addToCart(item, qty = 1) {
    const existingIndex = cart.findIndex(
      cartItem => cartItem.id === item.id
    );

    if (existingIndex > -1) {
      cart[existingIndex] = {
        ...cart[existingIndex],
        qty: cart[existingIndex].qty + qty
      };
    } else {
      cart.push({
        id: item.id,
        name: item.name || item.nombre,
        price: item.price || item.precio,
        emoji: item.emoji || '🍽️',
        description: item.description || item.descripción,
        image: item.image || item.imagen || '',
        qty: qty
      });
    }

    Alert.alert(
      'Producto agregado',
      `${item.name || item.nombre} fue agregado al carrito`
    );

    notifyCart();
  },

  removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);

    Alert.alert(
      'Producto eliminado',
      'El producto fue eliminado del carrito'
    );

    notifyCart();
  },

  updateCartQty(itemId, change) {
    const itemIndex = cart.findIndex(
      item => item.id === itemId
    );

    if (itemIndex > -1) {
      const newQty = cart[itemIndex].qty + change;

      if (newQty <= 0) {
        cart = cart.filter(item => item.id !== itemId);
      } else {
        cart[itemIndex] = {
          ...cart[itemIndex],
          qty: newQty
        };
      }

      notifyCart();
    }
  },

  clearCart() {
    cart = [];

    Alert.alert(
      'Carrito vacío',
      'Todos los productos fueron eliminados'
    );

    notifyCart();
  },

  resetToMock() {
    cart = [...MOCK_CART];
    notifyCart();
  },

  subscribe(listener) {
    cartListeners.push(listener);

    return () => {
      cartListeners = cartListeners.filter(
        l => l !== listener
      );
    };
  },

  unsubscribe(listener) {
    cartListeners = cartListeners.filter(
      l => l !== listener
    );
  }
};

// --- ORDER HISTORY STATE ---
let history = [...ORDER_HISTORY];
let historyListeners = [];

// Guardar historial
const saveHistory = async () => {
  try {
    await AsyncStorage.setItem(
      'history',
      JSON.stringify(history)
    );
  } catch (error) {
    Alert.alert(
      'Error',
      'No se pudo guardar el historial.'
    );

    console.log(
      'Error guardando historial:',
      error
    );
  }
};

// Cargar historial
const loadHistory = async () => {
  try {
    const savedHistory = await AsyncStorage.getItem(
      'history'
    );

    if (savedHistory !== null) {
      history = JSON.parse(savedHistory);
      notifyHistory();
    }
  } catch (error) {
    Alert.alert(
      'Error',
      'No se pudo cargar el historial.'
    );

    console.log(
      'Error cargando historial:',
      error
    );
  }
};

const notifyHistory = () => {
  saveHistory();

  historyListeners.forEach(listener =>
    listener([...history])
  );
};

export const historyStore = {
  getHistory() {
    return [...history];
  },

  addOrder(order) {
    history.unshift(order);

    Alert.alert(
      'Pedido confirmado',
      'Tu pedido fue realizado correctamente'
    );

    notifyHistory();
  },

  updateOrderStatus(orderId, newStatus) {
    history = history.map(order =>
      order.id === orderId
        ? { ...order, status: newStatus }
        : order
    );

    notifyHistory();
  },

  subscribe(listener) {
    historyListeners.push(listener);

    return () => {
      historyListeners = historyListeners.filter(
        l => l !== listener
      );
    };
  },

  unsubscribe(listener) {
    historyListeners = historyListeners.filter(
      l => l !== listener
    );
  }
};

// Cargar datos automáticamente
loadCart();
loadHistory();