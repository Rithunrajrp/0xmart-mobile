// ============================================================================
// Enums
// ============================================================================

export type NetworkType =
  | "ETHEREUM"
  | "POLYGON"
  | "BSC"
  | "ARBITRUM"
  | "OPTIMISM"
  | "AVALANCHE"
  | "BASE"
  | "SUI"
  | "TON";

export type StablecoinType = "USDT" | "USDC" | "DAI" | "BUSD";

export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

export type UserStatus = "ACTIVE" | "SUSPENDED" | "DEACTIVATED";

export type KYCStatus =
  | "NOT_STARTED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED";

export type ProductStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "OUT_OF_STOCK"
  | "PENDING_REVIEW"
  | "REJECTED";

export type OrderStatus =
  | "PENDING"
  | "PAYMENT_PENDING"
  | "PROCESSING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type AddressType = "SHIPPING" | "BILLING";

export type TransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "PURCHASE"
  | "REFUND"
  | "FIAT_PURCHASE"
  | "TRANSFER_IN"
  | "TRANSFER_OUT";

export type TransactionStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

// ============================================================================
// User & Auth
// ============================================================================

export interface User {
  id: string;
  phoneNumber: string;
  countryCode: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  kycStatus: KYCStatus;
  kycProviderId?: string;
  kycData?: any;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  metadata?: any;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}

// ============================================================================
// Products
// ============================================================================

export interface ProductPrice {
  id: string;
  productId: string;
  stablecoinType: StablecoinType;
  price: string;
  createdAt: string;
  updatedAt: string;
}

export interface Seller {
  id: string;
  companyName: string;
  logo?: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  country?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId?: string;
  customerId?: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerified: boolean;
  isApproved: boolean;
  helpfulCount: number;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  description?: string;
  shortDescription?: string;
  sku?: string;
  barcode?: string;
  imageUrl?: string;
  images?: string[];
  videoUrl?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  tags?: string[];
  specifications?: any;
  status: ProductStatus;
  stock: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  slug?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  seller?: Seller;
  prices: ProductPrice[];
  reviews?: ProductReview[];
  avgRating?: number;
  reviewCount?: number;
}

// ============================================================================
// Wallet
// ============================================================================

export interface Wallet {
  id: string;
  userId: string;
  stablecoinType: StablecoinType;
  network: NetworkType;
  depositAddress: string;
  balance: string;
  lockedBalance: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  type: TransactionType;
  amount: string;
  stablecoinType: StablecoinType;
  network: NetworkType;
  status: TransactionStatus;
  txHash?: string;
  fromAddress?: string;
  toAddress?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Deposit {
  id: string;
  walletId: string;
  txHash: string;
  fromAddress: string;
  amount: string;
  network: NetworkType;
  stablecoinType: StablecoinType;
  confirmations: number;
  requiredConfirmations: number;
  status: TransactionStatus;
  detectedAt: string;
  confirmedAt?: string;
  processedAt?: string;
  metadata?: any;
}

// ============================================================================
// Orders
// ============================================================================

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  pricePerUnit: string;
  totalPrice: string;
  stablecoinType: StablecoinType;
  product?: Product;
  price?: string; // Added for compatibility
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phoneNumber?: string; // Added for compatibility
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  stablecoinType: StablecoinType;
  subtotal: string;
  tax: string;
  shippingCost: string;
  total: string;
  shippingAddress: ShippingAddress;
  trackingNumber?: string;
  trackingUrl?: string; // Added
  shippingFee?: string; // Added
  transactionHash?: string; // Added
  network?: string; // Added
  notes?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  items: OrderItem[];
}

// ============================================================================
// Favorites
// ============================================================================

export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product: Product;
}

// ============================================================================
// Addresses
// ============================================================================

export interface UserAddress {
  id: string;
  userId: string;
  type: AddressType;
  label?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Cart (Local)
// ============================================================================

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  stablecoinType: StablecoinType;
}

// ============================================================================
// API Responses
// ============================================================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// ============================================================================
// Location
// ============================================================================

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface GeocodedAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formattedAddress?: string;
}

// ============================================================================
// Rewards
// ============================================================================

export type RewardType = "PURCHASE" | "REFERRAL" | "FIRST_PURCHASE" | "SUBSCRIPTION";

export interface Reward {
  id: string;
  userId: string;
  type: RewardType;
  amount?: string;
  currency?: StablecoinType;
  points: number;
  status: string; // EARNED, CLAIMED, EXPIRED
  description?: string;
  referenceType?: string;
  referenceId?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  claimedAt?: string;
  expiresAt?: string;
}

export interface RewardsResponse {
  rewards: Reward[];
  totalPoints: number;
}

export interface RewardStatistics {
  totalRewards: number;
  earnedRewards: number;
  claimedRewards: number;
  totalPoints: number;
}
