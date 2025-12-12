import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Product, CartItem, StablecoinType } from "../types";

interface CartState {
  items: CartItem[];
  selectedStablecoin: StablecoinType;
  userId: string | null; // Track which user owns this cart

  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: (stablecoin?: StablecoinType) => number;
  getItemCount: () => number;
  setSelectedStablecoin: (stablecoin: StablecoinType) => void;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
  setUserId: (userId: string | null) => void; // Set current user
  loadCartForUser: (userId: string | null) => void; // Load user-specific cart
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      selectedStablecoin: "USDT",
      userId: null,

      setUserId: (userId: string | null) => {
        set({ userId });
      },

      loadCartForUser: (userId: string | null) => {
        const currentUserId = get().userId;

        // If switching users, clear the cart
        if (currentUserId !== userId) {
          set({
            items: [],
            userId,
            selectedStablecoin: "USDT"
          });
        }
      },

      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(
            (item) => item.product.id === product.id
          );

          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { product, quantity }],
          };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (item) => item.product.id !== productId
              ),
            };
          }

          return {
            items: state.items.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item
            ),
          };
        });
      },

      clearCart: () => set({ items: [], selectedStablecoin: "USDT" }),

      getTotal: (stablecoin?: StablecoinType) => {
        const { items, selectedStablecoin } = get();
        const coin = stablecoin || selectedStablecoin;

        return items.reduce((sum, item) => {
          const price = item.product.prices.find(
            (p) => p.stablecoinType === coin
          );
          return sum + (price ? parseFloat(price.price) * item.quantity : 0);
        }, 0);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },

      setSelectedStablecoin: (stablecoin: StablecoinType) => {
        set({ selectedStablecoin: stablecoin });
      },

      isInCart: (productId: string) => {
        const { items } = get();
        return items.some((item) => item.product.id === productId);
      },

      getItemQuantity: (productId: string) => {
        const { items } = get();
        const item = items.find((item) => item.product.id === productId);
        return item?.quantity || 0;
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
