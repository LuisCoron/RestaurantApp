import AsyncStorage from '@react-native-async-storage/async-storage';
import { MENU_ITEMS } from './mockData';

const STORAGE_KEY = '@restaurant_menu';

const MOCK_IMAGES = {
  ent_1: 'https://images.unsplash.com/photo-1572656631137-7935297eff55?w=600',
  ent_2: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600',
  ent_3: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600',
  ent_4: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',
  fuerte_1: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',
  fuerte_2: 'https://images.unsplash.com/photo-1485921325814-a50431496cc9?w=600',
  fuerte_3: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600',
  fuerte_4: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
  beb_1: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600',
  beb_2: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600',
  beb_3: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600',
  beb_4: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600',
  pos_1: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600',
  pos_2: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600',
  pos_3: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600'
};

const MOCK_AVAILABILITY = {
  ent_2: false,
  pos_3: false
};

const INITIAL_MENU = MENU_ITEMS.map(item => ({
  ...item,
  image: MOCK_IMAGES[item.id] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
  available: MOCK_AVAILABILITY[item.id] !== undefined ? MOCK_AVAILABILITY[item.id] : true
}));

let menu = [];
let listeners = [];

const notify = () => {
  listeners.forEach(listener => listener([...menu]));
};

const saveMenu = async (newMenu) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newMenu));
  } catch (e) {
    console.error('Error saving menu to storage:', e);
  }
};

export const menuStore = {
  async loadMenu() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        menu = JSON.parse(raw);
      } else {
        menu = [...INITIAL_MENU];
        await saveMenu(menu);
      }
    } catch (e) {
      console.error('Error loading menu from storage:', e);
      menu = [...INITIAL_MENU];
    }
    notify();
    return [...menu];
  },

  getMenu() {
    if (menu.length === 0) {
      // Fallback in case loadMenu wasn't called yet
      return [...INITIAL_MENU];
    }
    return [...menu];
  },

  async addDish(dish) {
    const newDish = {
      ...dish,
      id: `dish_${Date.now()}`,
      price: parseFloat(dish.price) || 0,
      prepTime: parseInt(dish.prepTime) || 15,
      tags: Array.isArray(dish.tags) ? dish.tags : [],
      restrictions: Array.isArray(dish.restrictions) ? dish.restrictions : [],
      available: dish.available !== undefined ? dish.available : true
    };
    menu.push(newDish);
    await saveMenu(menu);
    notify();
    return newDish;
  },

  async editDish(id, updatedFields) {
    menu = menu.map(item => {
      if (item.id === id) {
        return {
          ...item,
          ...updatedFields,
          price: updatedFields.price !== undefined ? parseFloat(updatedFields.price) : item.price,
          prepTime: updatedFields.prepTime !== undefined ? parseInt(updatedFields.prepTime) : item.prepTime,
          tags: Array.isArray(updatedFields.tags) ? updatedFields.tags : item.tags,
          restrictions: Array.isArray(updatedFields.restrictions) ? updatedFields.restrictions : item.restrictions,
        };
      }
      return item;
    });
    await saveMenu(menu);
    notify();
  },

  async deleteDish(id) {
    menu = menu.filter(item => item.id !== id);
    await saveMenu(menu);
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
