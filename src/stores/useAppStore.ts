import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  oldPrice?: number;
  unit: string;
  rating: number;
  reviewCount: number;
  badge?: 'new' | 'sale' | 'hot';
  stores?: { name: string; price: number }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Recipe {
  id: string;
  name: string;
  image: string;
  time: number;
  calories: number;
  servings: number;
  ingredients: { name: string; amount: string }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  referralCode: string;
  bonusBalance: number;
}

type CartStrategy = 'savings' | 'time' | 'balanced';

interface AppState {
  // Onboarding
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (value: boolean) => void;

  // Auth
  isAuthenticated: boolean;
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;

  // Cart
  cart: CartItem[];
  cartStrategy: CartStrategy;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCartStrategy: (strategy: CartStrategy) => void;

  // Shopping Lists
  shoppingLists: { id: string; name: string; items: string[] }[];
  addShoppingList: (name: string) => void;
  addItemToList: (listId: string, item: string) => void;

  // Favorites
  favorites: string[];
  toggleFavorite: (productId: string) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Location
  location: { lat: number; lng: number; address: string } | null;
  setLocation: (location: { lat: number; lng: number; address: string } | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Onboarding
      hasSeenOnboarding: false,
      setHasSeenOnboarding: (value) => set({ hasSeenOnboarding: value }),

      // Auth
      isAuthenticated: false,
      user: null,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),

      // Cart
      cart: [],
      cartStrategy: 'balanced',
      addToCart: (product) => {
        const cart = get().cart;
        const existingItem = cart.find((item) => item.product.id === product.id);
        if (existingItem) {
          set({
            cart: cart.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ cart: [...cart, { product, quantity: 1 }] });
        }
      },
      removeFromCart: (productId) => {
        set({ cart: get().cart.filter((item) => item.product.id !== productId) });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
        } else {
          set({
            cart: get().cart.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item
            ),
          });
        }
      },
      clearCart: () => set({ cart: [] }),
      setCartStrategy: (strategy) => set({ cartStrategy: strategy }),

      // Shopping Lists
      shoppingLists: [],
      addShoppingList: (name) => {
        set({
          shoppingLists: [
            ...get().shoppingLists,
            { id: Date.now().toString(), name, items: [] },
          ],
        });
      },
      addItemToList: (listId, item) => {
        set({
          shoppingLists: get().shoppingLists.map((list) =>
            list.id === listId ? { ...list, items: [...list.items, item] } : list
          ),
        });
      },

      // Favorites
      favorites: [],
      toggleFavorite: (productId) => {
        const favorites = get().favorites;
        if (favorites.includes(productId)) {
          set({ favorites: favorites.filter((id) => id !== productId) });
        } else {
          set({ favorites: [...favorites, productId] });
        }
      },

      // Search
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      // Location
      location: null,
      setLocation: (location) => set({ location }),
    }),
    {
      name: 'vigodnotut-storage',
      partialize: (state) => ({
        hasSeenOnboarding: state.hasSeenOnboarding,
        cart: state.cart,
        favorites: state.favorites,
        shoppingLists: state.shoppingLists,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
