import { create } from "zustand";
import { User, UserAddress, Wallet } from "../types";
import api from "../api";

interface UserState {
  profile: User | null;
  addresses: UserAddress[];
  wallets: Wallet[];
  stats: any;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  fetchAddresses: () => Promise<void>;
  addAddress: (address: Omit<UserAddress, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<void>;
  updateAddress: (id: string, updates: Partial<UserAddress>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  fetchWallets: () => Promise<void>;
  createWallet: (stablecoinType: string, network: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState>()((set, get) => ({
  profile: null,
  addresses: [],
  wallets: [],
  stats: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await api.getUserProfile();
      set({ profile, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch profile",
        isLoading: false,
      });
    }
  },

  updateProfile: async (updates: Partial<User>) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await api.updateUserProfile(updates);
      set({ profile, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update profile",
        isLoading: false,
      });
      throw error;
    }
  },

  fetchAddresses: async () => {
    set({ isLoading: true, error: null });
    try {
      const addresses = await api.getAddresses();
      set({ addresses, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch addresses",
        isLoading: false,
      });
    }
  },

  addAddress: async (address) => {
    set({ isLoading: true, error: null });
    try {
      await api.createAddress(address as any);
      await get().fetchAddresses();
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to add address",
        isLoading: false,
      });
      throw error;
    }
  },

  updateAddress: async (id: string, updates: Partial<UserAddress>) => {
    set({ isLoading: true, error: null });
    try {
      await api.updateAddress(id, updates);
      await get().fetchAddresses();
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update address",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteAddress: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.deleteAddress(id);
      set((state) => ({
        addresses: state.addresses.filter((a) => a.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete address",
        isLoading: false,
      });
      throw error;
    }
  },

  setDefaultAddress: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.setDefaultAddress(id);
      await get().fetchAddresses();
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to set default address",
        isLoading: false,
      });
      throw error;
    }
  },

  fetchWallets: async () => {
    set({ isLoading: true, error: null });
    try {
      const wallets = await api.getWallets();
      set({ wallets, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch wallets",
        isLoading: false,
      });
    }
  },

  createWallet: async (stablecoinType: string, network: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.createWallet(stablecoinType, network);
      await get().fetchWallets();
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create wallet",
        isLoading: false,
      });
      throw error;
    }
  },

  fetchStats: async () => {
    try {
      const stats = await api.getUserStats();
      set({ stats });
    } catch (error: any) {
      console.error("Failed to fetch stats:", error);
    }
  },

  clearError: () => set({ error: null }),
}));
