import { MOCK_CART, ORDER_HISTORY } from './mockData';

// --- SHOPPING CART STATE ---
let cart = [...MOCK_CART];
let cartListeners = [];

const notifyCart = () => {
  cartListeners.forEach(listener => listener([...cart]));
};

export const cartStore = {
  getCart() {
    return [...cart];
  },

  addToCart(item, qty = 1) {
    const existingIndex = cart.findIndex(cartItem => cartItem.id === item.id);
    
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
    notifyCart();
  },

  removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    notifyCart();
  },

  updateCartQty(itemId, change) {
    const itemIndex = cart.findIndex(item => item.id === itemId);
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
    notifyCart();
  },

  resetToMock() {
    cart = [...MOCK_CART];
    notifyCart();
  },

  subscribe(listener) {
    cartListeners.push(listener);
    return () => {
      cartListeners = cartListeners.filter(l => l !== listener);
    };
  },

  unsubscribe(listener) {
    cartListeners = cartListeners.filter(l => l !== listener);
  }
};

// --- ORDER HISTORY STATE ---
let history = [...ORDER_HISTORY];
let historyListeners = [];

const notifyHistory = () => {
  historyListeners.forEach(listener => listener([...history]));
};

export const historyStore = {
  getHistory() {
    return [...history];
  },

  addOrder(order) {
    // Add new order at the beginning of the list
    history.unshift(order);
    notifyHistory();
  },

  subscribe(listener) {
    historyListeners.push(listener);
    return () => {
      historyListeners = historyListeners.filter(l => l !== listener);
    };
  },

  unsubscribe(listener) {
    historyListeners = historyListeners.filter(l => l !== listener);
  }
};
