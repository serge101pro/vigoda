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

type CartStrategy = 'savings' | 'time' | 'balanced';

interface AppState {
  // Onboarding
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (value: boolean) => void;

  // Cart
  cart: CartItem[];
  cartStrategy: CartStrategy;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCartStrategy: (strategy: CartStrategy) => void;

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
      }),
    }
  )
);
