import { create } from "zustand";
import { Product } from "../types";
import api from "../api";

interface FavoritesState {
  favoriteIds: string[];
  favorites: Product[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchFavorites: () => Promise<void>;
  addToFavorites: (productId: string) => Promise<void>;
  removeFromFavorites: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  clearFavorites: () => Promise<void>;
  setFavoriteIds: (ids: string[]) => void;
  resetFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()((set, get) => ({
  favoriteIds: [],
  favorites: [],
  isLoading: false,
  error: null,

  fetchFavorites: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.getFavorites();
      const products = response.favorites.map((fav: any) => fav.product);
      const ids = products.map((p: Product) => p.id);

      set({
        favorites: products,
        favoriteIds: ids,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch favorites",
        isLoading: false,
      });
    }
  },

  addToFavorites: async (productId: string) => {
    try {
      await api.addToFavorites(productId);
      set((state) => ({
        favoriteIds: [...state.favoriteIds, productId],
      }));
      // Optionally refetch to get full product data
      await get().fetchFavorites();
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to add to favorites",
      });
      throw error;
    }
  },

  removeFromFavorites: async (productId: string) => {
    try {
      await api.removeFromFavorites(productId);
      set((state) => ({
        favoriteIds: state.favoriteIds.filter((id) => id !== productId),
        favorites: state.favorites.filter((p) => p.id !== productId),
      }));
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message || "Failed to remove from favorites",
      });
      throw error;
    }
  },

  isFavorite: (productId: string) => {
    const { favoriteIds } = get();
    return favoriteIds.includes(productId);
  },

  toggleFavorite: async (productId: string) => {
    const { isFavorite } = get();
    if (isFavorite(productId)) {
      await get().removeFromFavorites(productId);
    } else {
      await get().addToFavorites(productId);
    }
  },

  clearFavorites: async () => {
    try {
      await api.clearFavorites();
      set({ favoriteIds: [], favorites: [] });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to clear favorites",
      });
      throw error;
    }
  },

  setFavoriteIds: (ids: string[]) => {
    set({ favoriteIds: ids });
  },

  // Clear local state (called on logout)
  resetFavorites: () => {
    set({ favoriteIds: [], favorites: [], isLoading: false, error: null });
  },
}));
