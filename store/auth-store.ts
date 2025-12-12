import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, AuthTokens } from "../types";
import api from "../api";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setTokens: (tokens: AuthTokens) => Promise<void>;
  setUser: (user: User) => void;
  login: (
    email: string,
    otp: string,
    countryCode: string,
    phoneNumber: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setTokens: async (tokens: AuthTokens) => {
        await AsyncStorage.setItem("accessToken", tokens.accessToken);
        await AsyncStorage.setItem("refreshToken", tokens.refreshToken);
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        });
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      login: async (
        email: string,
        otp: string,
        countryCode: string,
        phoneNumber: string
      ) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.verifyOTP(
            email,
            otp,
            countryCode,
            phoneNumber
          );

          await get().setTokens({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            expiresIn: response.expiresIn,
          });

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });

          // Initialize user-scoped cart and fetch favorites
          try {
            const { useCartStore } = await import('./cart-store');
            const { useFavoritesStore } = await import('./favorites-store');

            useCartStore.getState().loadCartForUser(response.user.id);
            useFavoritesStore.getState().fetchFavorites().catch(err =>
              console.log("Failed to fetch favorites:", err)
            );
          } catch (err) {
            console.error("Error initializing user stores:", err);
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Login failed",
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          const { refreshToken } = get();
          if (refreshToken) {
            await api.logout(refreshToken);
          }
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          // Clear all AsyncStorage data
          await AsyncStorage.clear();

          // Reset auth state
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          });

          // Clear other stores - import them dynamically to avoid circular dependencies
          try {
            const { useCartStore } = await import('./cart-store');
            const { useFavoritesStore } = await import('./favorites-store');
            const { useUserStore } = await import('./user-store');

            useCartStore.getState().clearCart();
            useCartStore.getState().loadCartForUser(null);
            useFavoritesStore.getState().resetFavorites();
            useUserStore.setState({ profile: null, addresses: [], wallets: [], stats: null });
          } catch (err) {
            console.error("Error clearing stores:", err);
          }
        }
      },

      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const user = await api.getCurrentUser();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to fetch user",
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
