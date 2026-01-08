import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "@/api";

const { width } = Dimensions.get("window");
const PRODUCT_CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

export default function SellerStoreScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, page]);

  const loadData = async () => {
    try {
      await Promise.all([loadSeller(), loadProducts()]);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const loadSeller = async () => {
    try {
      setLoading(true);
      const data = await api.getSeller(id);
      setSeller(data);
    } catch (error) {
      console.error("Failed to load seller:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const data = await api.getSellerProducts(id, {
        page,
        limit: 12,
      });
      setProducts(data.products);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setProductsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading seller...</Text>
      </View>
    );
  }

  if (!seller) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="storefront-outline" size={64} color="#6B7280" />
        <Text style={styles.errorTitle}>Seller Not Found</Text>
        <Text style={styles.errorText}>
          The seller you're looking for doesn't exist or has been removed.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seller Store</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Banner */}
      {seller.banner && (
        <Image source={{ uri: seller.banner }} style={styles.banner} />
      )}

      {/* Seller Info */}
      <View style={styles.sellerInfo}>
        {/* Logo and Name */}
        <View style={styles.sellerHeader}>
          <View style={styles.logoContainer}>
            {seller.logo ? (
              <Image
                source={{ uri: seller.logo }}
                style={styles.logo}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Ionicons name="storefront-outline" size={40} color="#6B7280" />
              </View>
            )}
          </View>

          <View style={styles.sellerDetails}>
            <View style={styles.sellerNameRow}>
              <Text style={styles.sellerName} numberOfLines={2}>
                {seller.tradingName || seller.name}
              </Text>
              {seller.isVerified && (
                <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
              )}
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{seller.type}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={16} color="#ffa41c" />
            <Text style={styles.statValue}>{seller.stats.rating}</Text>
            <Text style={styles.statLabel}>
              ({seller.stats.totalReviews} reviews)
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="bag-handle-outline" size={16} color="#6B7280" />
            <Text style={styles.statLabel}>
              {seller.stats.totalSales.toLocaleString()} sales
            </Text>
          </View>
          {seller.productCount && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="cube-outline" size={16} color="#6B7280" />
                <Text style={styles.statLabel}>
                  {seller.productCount} products
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Location & Website */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>
              {[
                seller.location.city,
                seller.location.state,
                seller.location.country,
              ]
                .filter(Boolean)
                .join(", ")}
            </Text>
          </View>
          {seller.memberSince && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text style={styles.infoText}>
                Member since {new Date(seller.memberSince).getFullYear()}
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        {seller.description && (
          <Text style={styles.description}>{seller.description}</Text>
        )}
      </View>

      {/* Products Section */}
      <View style={styles.productsSection}>
        <Text style={styles.productsTitle}>Products</Text>

        {productsLoading ? (
          <View style={styles.productsGrid}>
            {[...Array(4)].map((_, i) => (
              <View key={i} style={styles.productCardSkeleton}>
                <View style={styles.productImageSkeleton} />
                <View style={styles.productInfoSkeleton}>
                  <View style={styles.skeletonLine} />
                  <View style={[styles.skeletonLine, { width: "60%" }]} />
                </View>
              </View>
            ))}
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color="#6B7280" />
            <Text style={styles.emptyTitle}>No Products Found</Text>
            <Text style={styles.emptyText}>
              This seller hasn't listed any products yet.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.productsGrid}>
              {products.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productCard}
                  onPress={() => router.push(`/product/${product.id}`)}
                >
                  <View style={styles.productImageContainer}>
                    {product.imageUrl ? (
                      <Image
                        source={{ uri: product.imageUrl }}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.productImagePlaceholder}>
                        <Ionicons name="cube-outline" size={40} color="#9CA3AF" />
                      </View>
                    )}
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.name}
                    </Text>
                    {product.prices && product.prices.length > 0 && (
                      <View style={styles.priceContainer}>
                        <Text style={styles.price}>
                          ${product.prices[0].price}
                        </Text>
                        <Text style={styles.currency}>
                          {product.prices[0].stablecoinType}
                        </Text>
                      </View>
                    )}
                    {product.rating > 0 && (
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={12} color="#ffa41c" />
                        <Text style={styles.rating}>{product.rating}</Text>
                        {product.totalReviews > 0 && (
                          <Text style={styles.reviewCount}>
                            ({product.totalReviews})
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Pagination */}
            {totalPages > 1 && (
              <View style={styles.pagination}>
                <TouchableOpacity
                  style={[
                    styles.paginationButton,
                    page === 1 && styles.paginationButtonDisabled,
                  ]}
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <Text
                    style={[
                      styles.paginationButtonText,
                      page === 1 && styles.paginationButtonTextDisabled,
                    ]}
                  >
                    Previous
                  </Text>
                </TouchableOpacity>
                <Text style={styles.paginationInfo}>
                  Page {page} of {totalPages}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.paginationButton,
                    page === totalPages && styles.paginationButtonDisabled,
                  ]}
                  onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <Text
                    style={[
                      styles.paginationButtonText,
                      page === totalPages && styles.paginationButtonTextDisabled,
                    ]}
                  >
                    Next
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#9CA3AF",
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#F9FAFB",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#121212",
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  headerBackButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1F2937",
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F9FAFB",
  },
  banner: {
    width: "100%",
    height: 200,
    backgroundColor: "#1F2937",
  },
  sellerInfo: {
    padding: 16,
    backgroundColor: "#121212",
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  sellerHeader: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#1F2937",
    borderWidth: 2,
    borderColor: "#374151",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  logoPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  sellerDetails: {
    flex: 1,
  },
  sellerNameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  sellerName: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#F9FAFB",
  },
  badge: {
    backgroundColor: "#374151",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#D1D5DB",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F9FAFB",
  },
  statLabel: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: "#374151",
  },
  infoSection: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  description: {
    fontSize: 14,
    color: "#D1D5DB",
    lineHeight: 20,
  },
  productsSection: {
    padding: 16,
  },
  productsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#F9FAFB",
    marginBottom: 16,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  productCard: {
    width: PRODUCT_CARD_WIDTH,
    backgroundColor: "#121212",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  productImageContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#1F2937",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productImagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F9FAFB",
    marginBottom: 6,
    minHeight: 40,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginBottom: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#8b5cf6",
  },
  currency: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  reviewCount: {
    fontSize: 12,
    color: "#6B7280",
  },
  productCardSkeleton: {
    width: PRODUCT_CARD_WIDTH,
    backgroundColor: "#121212",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  productImageSkeleton: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#1F2937",
  },
  productInfoSkeleton: {
    padding: 12,
    gap: 8,
  },
  skeletonLine: {
    height: 16,
    backgroundColor: "#1F2937",
    borderRadius: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F9FAFB",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 24,
  },
  paginationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#1F2937",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#374151",
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F9FAFB",
  },
  paginationButtonTextDisabled: {
    color: "#6B7280",
  },
  paginationInfo: {
    fontSize: 14,
    color: "#9CA3AF",
  },
});
