import { MOCK_CART } from './mockData';

// Shared state for the shopping cart
let cart = [...MOCK_CART];
let listeners = [];

const notify = () => {
  listeners.forEach(listener => listener([...cart]));
};

export const cartStore = {
  // Get current cart items
  getCart() {
    return [...cart];
  },

  // Add item to cart with specific quantity
  addToCart(item, qty = 1) {
    const existingIndex = cart.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingIndex > -1) {
      // Create a copy of the item and update its quantity
      cart[existingIndex] = {
        ...cart[existingIndex],
        qty: cart[existingIndex].qty + qty
      };
    } else {
      // Add new item
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
    
    notify();
  },

  // Remove item by ID
  removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    notify();
  },

  // Update item quantity directly by a delta (+1 / -1)
  updateCartQty(itemId, change) {
    const itemIndex = cart.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
      const newQty = cart[itemIndex].qty + change;
      if (newQty <= 0) {
        // If quantity becomes 0 or less, remove item
        cart = cart.filter(item => item.id !== itemId);
      } else {
        cart[itemIndex] = {
          ...cart[itemIndex],
          qty: newQty
        };
      }
      notify();
    }
  },

  // Clear all items
  clearCart() {
    cart = [];
    notify();
  },

  // Reset to initial mockup items (for prototype demo reset)
  resetToMock() {
    cart = [...MOCK_CART];
    notify();
  },

  // Subscribe to cart changes
  subscribe(listener) {
    listeners.push(listener);
    // Return unsubscribe function for convenience
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },

  // Unsubscribe listener manually
  unsubscribe(listener) {
    listeners = listeners.filter(l => l !== listener);
  }
};
