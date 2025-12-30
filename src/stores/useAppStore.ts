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
  minQuantity?: number; // Minimum purchasable quantity
  quantityStep?: number; // Step for quantity changes
  description?: string;
  characteristics?: Record<string, string>;
}

export interface Recipe {
  id: string;
  name: string;
  image: string;
  time: number;
  calories: number;
  servings: number;
  ingredients: { name: string; amount: string; productId?: string }[];
}

// Base cart item type
export type CartItemType = 'product' | 'recipe-ingredients' | 'meal-plan' | 'meal-plan-ingredients' | 'meal-plan-diy' | 'farm-product' | 'catering';

export interface CateringService {
  id: string;
  name: string;
  pricePerPerson: number;
  included: boolean;
}

export interface CartItem {
  id: string;
  type: CartItemType;
  product?: Product;
  quantity: number;
  servings?: number; // For recipes - number of people
  // For recipe/meal plan ingredients
  sourceId?: string; // Recipe or meal plan ID
  sourceName?: string; // Recipe or meal plan name
  ingredients?: { name: string; amount: string; requiredAmount: number; unit: string }[];
  // For catering
  cateringId?: string;
  cateringName?: string;
  cateringImage?: string;
  guestCount?: number;
  depositAmount?: number;
  totalPrice?: number;
  services?: CateringService[];
  // For farm products
  farmId?: string;
  farmName?: string;
}

// Ingredient aggregation for optimization
export interface AggregatedIngredient {
  name: string;
  totalRequired: number;
  unit: string;
  minPackage: number;
  packagesToBuy: number;
  totalCost: number;
  sources: { sourceId: string; sourceName: string; amount: number }[];
}

type CartStrategy = 'savings' | 'time' | 'balanced';

interface AppState {
  // Onboarding
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (value: boolean) => void;

  // Cart
  cart: CartItem[];
  cartStrategy: CartStrategy;
  addToCart: (product: Product, quantity?: number) => void;
  addRecipeIngredientsToCart: (recipe: Recipe, servings: number) => void;
  addMealPlanToCart: (mealPlan: { id: string; name: string; price: number; image: string }, variant: 'ready' | 'supplier-kit' | 'diy') => void;
  addFarmProductToCart: (product: Product, farmId: string, farmName: string, quantity?: number) => void;
  addCateringToCart: (catering: { id: string; name: string; image: string; pricePerPerson: number; guestCount: number; depositPercent: number; totalPrice: number; services: CateringService[] }) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  setCartStrategy: (strategy: CartStrategy) => void;
  getAggregatedIngredients: () => AggregatedIngredient[];

  // Sections collapse state
  allSectionsCollapsed: boolean;
  setAllSectionsCollapsed: (collapsed: boolean) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Location
  location: { lat: number; lng: number; address: string } | null;
  setLocation: (location: { lat: number; lng: number; address: string } | null) => void;
}

// Helper to calculate minimum package quantity
const calculateMinPackage = (required: number, minPackage: number): number => {
  return Math.ceil(required / minPackage) * minPackage;
};

// Common ingredient min packages
const ingredientMinPackages: Record<string, { minPackage: number; unit: string; pricePerUnit: number }> = {
  'яйца': { minPackage: 10, unit: 'шт', pricePerUnit: 12 },
  'яйцо': { minPackage: 10, unit: 'шт', pricePerUnit: 12 },
  'мука': { minPackage: 1000, unit: 'г', pricePerUnit: 0.08 },
  'сахар': { minPackage: 500, unit: 'г', pricePerUnit: 0.06 },
  'молоко': { minPackage: 1000, unit: 'мл', pricePerUnit: 0.09 },
  'масло': { minPackage: 200, unit: 'г', pricePerUnit: 0.8 },
  'соль': { minPackage: 500, unit: 'г', pricePerUnit: 0.04 },
};

const getIngredientPackageInfo = (ingredientName: string): { minPackage: number; unit: string; pricePerUnit: number } => {
  const lowerName = ingredientName.toLowerCase();
  for (const [key, value] of Object.entries(ingredientMinPackages)) {
    if (lowerName.includes(key)) {
      return value;
    }
  }
  return { minPackage: 1, unit: 'шт', pricePerUnit: 100 };
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Onboarding
      hasSeenOnboarding: false,
      setHasSeenOnboarding: (value) => set({ hasSeenOnboarding: value }),

      // Sections collapse
      allSectionsCollapsed: true,
      setAllSectionsCollapsed: (collapsed) => set({ allSectionsCollapsed: collapsed }),

      // Cart
      cart: [],
      cartStrategy: 'balanced',
      
      addToCart: (product, quantity = 1) => {
        const cart = get().cart;
        const minQty = product.minQuantity || 1;
        const actualQuantity = Math.max(quantity, minQty);
        
        const existingItem = cart.find(
          (item) => item.type === 'product' && item.product?.id === product.id
        );
        
        if (existingItem) {
          set({
            cart: cart.map((item) =>
              item.id === existingItem.id
                ? { ...item, quantity: item.quantity + actualQuantity }
                : item
            ),
          });
        } else {
          const newItem: CartItem = {
            id: `product-${product.id}-${Date.now()}`,
            type: 'product',
            product,
            quantity: actualQuantity,
          };
          set({ cart: [...cart, newItem] });
        }
      },

      addRecipeIngredientsToCart: (recipe, servings) => {
        const cart = get().cart;
        const newItem: CartItem = {
          id: `recipe-${recipe.id}-${Date.now()}`,
          type: 'recipe-ingredients',
          sourceId: recipe.id,
          sourceName: recipe.name,
          servings,
          quantity: 1,
          ingredients: recipe.ingredients.map((ing) => {
            const parsed = parseAmount(ing.amount);
            return {
              name: ing.name,
              amount: ing.amount,
              requiredAmount: parsed.amount * (servings / recipe.servings),
              unit: parsed.unit,
            };
          }),
        };
        set({ cart: [...cart, newItem] });
      },

      addMealPlanToCart: (mealPlan, variant) => {
        const cart = get().cart;
        const newItem: CartItem = {
          id: `mealplan-${mealPlan.id}-${variant}-${Date.now()}`,
          type: variant === 'ready' ? 'meal-plan' : variant === 'supplier-kit' ? 'meal-plan-ingredients' : 'meal-plan-diy',
          sourceId: mealPlan.id,
          sourceName: mealPlan.name,
          quantity: 1,
          product: {
            id: mealPlan.id,
            name: mealPlan.name,
            category: 'meal-plan',
            image: mealPlan.image,
            price: mealPlan.price,
            unit: 'шт',
            rating: 4.8,
            reviewCount: 100,
          },
        };
        set({ cart: [...cart, newItem] });
      },

      addFarmProductToCart: (product, farmId, farmName, quantity = 1) => {
        const cart = get().cart;
        const minQty = product.minQuantity || 1;
        const actualQuantity = Math.max(quantity, minQty);
        
        const existingItem = cart.find(
          (item) => item.type === 'farm-product' && item.product?.id === product.id && item.farmId === farmId
        );
        
        if (existingItem) {
          set({
            cart: cart.map((item) =>
              item.id === existingItem.id
                ? { ...item, quantity: item.quantity + actualQuantity }
                : item
            ),
          });
        } else {
          const newItem: CartItem = {
            id: `farm-${farmId}-${product.id}-${Date.now()}`,
            type: 'farm-product',
            product,
            quantity: actualQuantity,
            farmId,
            farmName,
          };
          set({ cart: [...cart, newItem] });
        }
      },

      addCateringToCart: (catering) => {
        const cart = get().cart;
        const depositAmount = Math.round(catering.totalPrice * (catering.depositPercent / 100));
        
        const newItem: CartItem = {
          id: `catering-${catering.id}-${Date.now()}`,
          type: 'catering',
          cateringId: catering.id,
          cateringName: catering.name,
          cateringImage: catering.image,
          guestCount: catering.guestCount,
          depositAmount,
          totalPrice: catering.totalPrice,
          services: catering.services,
          quantity: 1,
          product: {
            id: catering.id,
            name: catering.name,
            category: 'catering',
            image: catering.image,
            price: depositAmount,
            unit: 'заказ',
            rating: 4.8,
            reviewCount: 50,
          },
        };
        set({ cart: [...cart, newItem] });
      },

      removeFromCart: (cartItemId) => {
        set({ cart: get().cart.filter((item) => item.id !== cartItemId) });
      },
      
      updateQuantity: (cartItemId, quantity) => {
        const cart = get().cart;
        const item = cart.find((i) => i.id === cartItemId);
        
        if (!item) return;
        
        const minQty = item.product?.minQuantity || 1;
        
        if (quantity < minQty) {
          get().removeFromCart(cartItemId);
        } else {
          set({
            cart: cart.map((item) =>
              item.id === cartItemId ? { ...item, quantity } : item
            ),
          });
        }
      },
      
      clearCart: () => set({ cart: [] }),
      setCartStrategy: (strategy) => set({ cartStrategy: strategy }),

      getAggregatedIngredients: () => {
        const cart = get().cart;
        const aggregated: Map<string, AggregatedIngredient> = new Map();

        cart.forEach((item) => {
          if ((item.type === 'recipe-ingredients' || item.type === 'meal-plan-diy') && item.ingredients) {
            item.ingredients.forEach((ing) => {
              const key = ing.name.toLowerCase();
              const existing = aggregated.get(key);
              const packageInfo = getIngredientPackageInfo(ing.name);

              if (existing) {
                existing.totalRequired += ing.requiredAmount;
                existing.sources.push({
                  sourceId: item.sourceId || '',
                  sourceName: item.sourceName || '',
                  amount: ing.requiredAmount,
                });
                existing.packagesToBuy = Math.ceil(existing.totalRequired / existing.minPackage);
                existing.totalCost = existing.packagesToBuy * existing.minPackage * packageInfo.pricePerUnit;
              } else {
                const packagesToBuy = Math.ceil(ing.requiredAmount / packageInfo.minPackage);
                aggregated.set(key, {
                  name: ing.name,
                  totalRequired: ing.requiredAmount,
                  unit: ing.unit || packageInfo.unit,
                  minPackage: packageInfo.minPackage,
                  packagesToBuy,
                  totalCost: packagesToBuy * packageInfo.minPackage * packageInfo.pricePerUnit,
                  sources: [{
                    sourceId: item.sourceId || '',
                    sourceName: item.sourceName || '',
                    amount: ing.requiredAmount,
                  }],
                });
              }
            });
          }
        });

        return Array.from(aggregated.values());
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
        allSectionsCollapsed: state.allSectionsCollapsed,
      }),
    }
  )
);

// Helper to parse amount strings like "200 г" or "3 шт"
function parseAmount(amountStr: string): { amount: number; unit: string } {
  const match = amountStr.match(/^([\d.,]+)\s*(.*)$/);
  if (match) {
    return {
      amount: parseFloat(match[1].replace(',', '.')),
      unit: match[2] || 'шт',
    };
  }
  return { amount: 1, unit: 'шт' };
}
