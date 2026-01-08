import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosInstance } from "axios";
import Constants from "expo-constants";
import { router } from "expo-router";

const FALLBACK_DEV_URL = "http://localhost:8000/api/v1";
const FALLBACK_PROD_URL = "https://api.0xmart.com/api/v1";

// Let Expo config or env vars define the backend URL so emulators and devices
// can point to the correct LAN/tunnel endpoint instead of hard-coded localhost.
const API_BASE_URL =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ||
  process.env.EXPO_PUBLIC_API_URL ||
  (__DEV__ ? FALLBACK_DEV_URL : FALLBACK_PROD_URL);

// Log API URL for debugging
if (__DEV__) {
  console.log("[API] Base URL:", API_BASE_URL);
  console.log("[API] If testing on a device/emulator, make sure to:");
  console.log("[API] 1. Start the backend server");
  console.log("[API] 2. Update API_BASE_URL with your computer's IP address");
  console.log("[API] Example: http://192.168.1.100:8000/api/v1");
}

export const SUPPORTED_NETWORKS = [
  "ETHEREUM",
  "POLYGON",
  "BSC",
  "ARBITRUM",
  "OPTIMISM",
  "AVALANCHE",
  "BASE",
  "SUI",
  "TON",
] as const;

export type NetworkType = (typeof SUPPORTED_NETWORKS)[number];
export type StablecoinType = "USDT" | "USDC" | "DAI" | "BUSD";

export const NETWORK_DISPLAY_NAMES: Record<NetworkType, string> = {
  ETHEREUM: "Ethereum",
  POLYGON: "Polygon",
  BSC: "BNB Chain",
  ARBITRUM: "Arbitrum",
  OPTIMISM: "Optimism",
  AVALANCHE: "Avalanche",
  BASE: "Base",
  SUI: "Sui",
  TON: "TON",
};

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem("accessToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.warn("[API] No access token found in AsyncStorage");
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as (typeof error.config) & {
          _retry?: boolean;
        };

        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          try {
            console.log("[API] 401 error, attempting token refresh...");
            const refreshToken = await AsyncStorage.getItem("refreshToken");
            if (!refreshToken) {
              console.log("[API] No refresh token found");
              throw new Error("No refresh token");
            }

            console.log("[API] Refreshing token...");
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken,
            });

            const {
              accessToken,
              refreshToken: newRefreshToken,
            } = response.data;
            await AsyncStorage.setItem("accessToken", accessToken);
            await AsyncStorage.setItem("refreshToken", newRefreshToken);
            console.log("[API] Token refreshed successfully");

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError: any) {
            console.error("[API] Token refresh failed - Session expired");

            // Clear all local storage
            await AsyncStorage.clear();

            // Force navigation to login screen
            setTimeout(() => {
              if (router.canGoBack()) {
                router.dismissAll();
              }
              router.replace("/auth/login");
            }, 100);

            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // ============================================================================
  // Auth
  // ============================================================================

  async sendOTP(email: string, countryCode: string, phoneNumber: string, referralCode?: string) {
    const { data } = await this.client.post("/auth/send-otp", {
      email,
      countryCode,
      phoneNumber,
      referralCode,
    });
    return data;
  }

  async verifyOTP(
    email: string,
    emailOtp: string,
    countryCode: string,
    phoneNumber: string,
    phoneOtp: string,
    referralCode?: string
  ) {
    const { data } = await this.client.post("/auth/verify-otp", {
      email,
      emailOtp,
      countryCode,
      phoneNumber,
      phoneOtp,
      referralCode,
    });
    return data;
  }

  async validateReferralCode(code: string): Promise<{ valid: boolean; message: string; referrerEmail?: string }> {
    const { data } = await this.client.get("/auth/validate-referral-code", {
      params: { code },
    });
    return data;
  }

  async getCurrentUser() {
    const { data } = await this.client.get("/auth/me");
    return data;
  }

  async logout(token: string) {
    const { data} = await this.client.post("/auth/logout", { token });
    return data;
  }

  // ============================================================================
  // Users
  // ============================================================================

  async getUserProfile() {
    const { data } = await this.client.get("/users/me");
    return data;
  }

  async getUserStats() {
    const { data } = await this.client.get("/users/me/stats");
    return data;
  }

  async updateUserProfile(updates: any) {
    const { data } = await this.client.put("/users/me", updates);
    return data;
  }

  // ============================================================================
  // Products
  // ============================================================================

  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
  }) {
    const { data } = await this.client.get("/products", { params });
    return data;
  }

  async getProduct(id: string) {
    const { data } = await this.client.get(`/products/${id}`);
    return data;
  }

  async searchProducts(query: string, category?: string) {
    const { data } = await this.client.get("/products/search", {
      params: { q: query, category },
    });
    return data;
  }

  async getCategories() {
    const { data } = await this.client.get("/products/categories");
    return data;
  }

  // ============================================================================
  // Wallets
  // ============================================================================

  async getWallets() {
    const { data } = await this.client.get("/wallets");
    return data;
  }

  async createWallet(stablecoinType: string, network: string) {
    const { data } = await this.client.post("/wallets", {
      stablecoinType,
      network,
    });
    return data;
  }

  async getWalletTransactions(walletId: string) {
    const { data } = await this.client.get(`/wallets/${walletId}/transactions`);
    return data;
  }

  async initiateWithdrawal(params: {
    stablecoinType: string;
    network: string;
    toAddress: string;
    amount: number;
  }) {
    const { data } = await this.client.post("/wallets/withdraw", params);
    return data;
  }

  // ============================================================================
  // Orders
  // ============================================================================

  async createOrder(params: {
    stablecoinType: string;
    items: Array<{ productId: string; quantity: number }>;
    shippingAddress: any;
  }) {
    const { data } = await this.client.post("/orders", params);
    return data;
  }

  async confirmPayment(orderId: string) {
    const { data } = await this.client.post(
      `/orders/${orderId}/confirm-payment`
    );
    return data;
  }

  async getOrders(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { data } = await this.client.get("/orders", { params });
    return data;
  }

  async getOrder(orderId: string) {
    const { data } = await this.client.get(`/orders/${orderId}`);
    return data;
  }

  async cancelOrder(orderId: string) {
    const { data } = await this.client.delete(`/orders/${orderId}`);
    return data;
  }

  // ============================================================================
  // Favorites
  // ============================================================================

  async addToFavorites(productId: string) {
    const { data } = await this.client.post(`/favorites/${productId}`);
    return data;
  }

  async removeFromFavorites(productId: string) {
    const { data } = await this.client.delete(`/favorites/${productId}`);
    return data;
  }

  async getFavorites(params?: { page?: number; limit?: number }) {
    const { data } = await this.client.get("/favorites", { params });
    return data;
  }

  async checkIsFavorite(productId: string) {
    const { data } = await this.client.get(`/favorites/check/${productId}`);
    return data;
  }

  async getFavoriteProductIds(): Promise<string[]> {
    const { data } = await this.client.get("/favorites/product-ids");
    return data;
  }

  async clearFavorites() {
    const { data } = await this.client.delete("/favorites");
    return data;
  }

  // ============================================================================
  // User Addresses
  // ============================================================================

  async getAddresses(type?: "SHIPPING" | "BILLING") {
    const { data } = await this.client.get("/users/me/addresses", {
      params: { type },
    });
    return data;
  }

  async createAddress(params: {
    type: "SHIPPING" | "BILLING";
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone: string;
  }) {
    const { data } = await this.client.post("/users/me/addresses", params);
    return data;
  }

  async updateAddress(
    id: string,
    params: Partial<{
      type: "SHIPPING" | "BILLING";
      fullName: string;
      addressLine1: string;
      addressLine2: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      phone: string;
    }>
  ) {
    const { data } = await this.client.put(`/users/me/addresses/${id}`, params);
    return data;
  }

  async deleteAddress(id: string) {
    const { data } = await this.client.delete(`/users/me/addresses/${id}`);
    return data;
  }

  async setDefaultAddress(id: string) {
    const { data } = await this.client.put(`/users/me/addresses/${id}/default`);
    return data;
  }

  // ============================================================================
  // Deposits & Withdrawals
  // ============================================================================

  async getUserDeposits() {
    const { data } = await this.client.get("/deposit-monitor/user/deposits");
    return data;
  }

  async getDepositStatus(txHash: string) {
    const { data } = await this.client.get(`/deposit-monitor/status/${txHash}`);
    return data;
  }

  // ============================================================================
  // Rewards
  // ============================================================================

  async getMyRewards(status?: string) {
    const { data } = await this.client.get("/rewards/my-rewards", {
      params: status ? { status } : undefined,
    });
    return data;
  }

  async getRewardStatistics() {
    const { data } = await this.client.get("/rewards/statistics");
    return data;
  }

  async claimReward(rewardId: string) {
    const { data } = await this.client.patch(`/rewards/${rewardId}/claim`);
    return data;
  }

  // ============================================================================
  // Sellers
  // ============================================================================

  async getSeller(id: string) {
    const { data } = await this.client.get(`/sellers/${id}`);
    return data;
  }

  async getSellerProducts(id: string, params?: { page?: number; limit?: number; category?: string }) {
    const { data } = await this.client.get(`/sellers/${id}/products`, { params });
    return data;
  }

  // ============================================================================
  // Reviews
  // ============================================================================

  async createReview(reviewData: {
    productId: string;
    rating: number;
    title?: string;
    comment?: string;
    images?: string[];
  }) {
    const { data } = await this.client.post("/reviews", reviewData);
    return data;
  }

  async getProductReviews(productId: string, params?: { page?: number; limit?: number }) {
    const { data } = await this.client.get(`/reviews/product/${productId}`, { params });
    return data;
  }

  async getMyReviews(params?: { page?: number; limit?: number }) {
    const { data } = await this.client.get("/reviews/my-reviews", { params });
    return data;
  }

  async getReview(id: string) {
    const { data } = await this.client.get(`/reviews/${id}`);
    return data;
  }

  async updateReview(id: string, updateData: {
    rating?: number;
    title?: string;
    comment?: string;
    images?: string[];
  }) {
    const { data } = await this.client.patch(`/reviews/${id}`, updateData);
    return data;
  }

  async deleteReview(id: string) {
    const { data } = await this.client.delete(`/reviews/${id}`);
    return data;
  }

  async markReviewHelpful(id: string) {
    const { data } = await this.client.post(`/reviews/${id}/helpful`);
    return data;
  }
}

export const api = new ApiClient();
export default api;
