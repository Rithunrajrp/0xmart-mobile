import { TopBar } from "@/components/navigation/TopBar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../api";
import { useCartStore } from "../../store/cart-store";
import { useFavoritesStore } from "../../store/favorites-store";
import { Product } from "../../types";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

export default function HomeScreen() {
  const router = useRouter();
  // @ts-ignore
  const { getItemCount, selectedStablecoin } = useCartStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cartItemCount = getItemCount();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadCategories(), loadProducts(), loadFeatured()]);
    } finally {
      setLoading(false);
    }
  };
  const handleCategoryPress = (category: string) => {
    router.push(`/collection/${encodeURIComponent(category)}` as any);
  };

  const loadCategories = async () => {
    try {
      const cats = await api.getCategories();
      setCategories(cats.slice(0, 8)); // Limit to 8 categories
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await api.getProducts({
        page: 1,
        limit: 10,
        status: "ACTIVE",
      });
      setProducts(response.products || response);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const loadFeatured = async () => {
    try {
      const response = await api.getProducts({
        page: 1,
        limit: 5,
        status: "ACTIVE",
        isFeatured: true,
      });
      setFeaturedProducts(response.products || response);
    } catch (error) {
      console.error("Error loading featured products:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleProductPress = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  const getProductPrice = (product: Product): string => {
    if (!product.prices || product.prices.length === 0) return "N/A";
    const price =
      product.prices.find((p) => p.stablecoinType === selectedStablecoin) ||
      product.prices[0];
    return `${price.stablecoinType} ${parseFloat(
      price.price.toString()
    ).toFixed(2)}`;
  };

  const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    const lowerCat = category.toLowerCase();
    if (lowerCat.includes('electronic') || lowerCat.includes('tech')) return 'hardware-chip-outline';
    if (lowerCat.includes('cloth') || lowerCat.includes('fashion') || lowerCat.includes('wear')) return 'shirt-outline';
    if (lowerCat.includes('home') || lowerCat.includes('living')) return 'home-outline';
    if (lowerCat.includes('beauty') || lowerCat.includes('health')) return 'sparkles-outline';
    if (lowerCat.includes('sport') || lowerCat.includes('fitness')) return 'basketball-outline';
    if (lowerCat.includes('toy') || lowerCat.includes('game')) return 'game-controller-outline';
    if (lowerCat.includes('book') || lowerCat.includes('read')) return 'book-outline';
    if (lowerCat.includes('watch') || lowerCat.includes('jewel')) return 'watch-outline';
    if (lowerCat.includes('bag') || lowerCat.includes('luggage')) return 'briefcase-outline';
    if (lowerCat.includes('shoe') || lowerCat.includes('footwear')) return 'footsteps-outline';
    return 'grid-outline';
  };

  const renderProductCard = (product: Product, index: number) => (
    <TouchableOpacity
      key={product.id}
      style={[
        styles.productCard,
        index % 2 === 0 ? styles.productCardLeft : styles.productCardRight,
      ]}
      onPress={() => handleProductPress(product)}
    >
      <Image
        source={{ uri: product.imageUrl || "https://via.placeholder.com/200" }}
        style={styles.productImage}
      />
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => toggleFavorite(product.id)}
      >
        <Ionicons
          name={isFavorite(product.id) ? "heart" : "heart-outline"}
          size={20}
          color={isFavorite(product.id) ? "#ef4444" : "#a0a0a0"}
        />
      </TouchableOpacity>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.productPrice}>{getProductPrice(product)}</Text>
        {product.stock && product.stock < 10 && product.stock > 0 && (
          <Text style={styles.lowStockText}>Only {product.stock} left!</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFeaturedCarousel = () => {
    if (featuredProducts.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Products</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.featuredScroll}
        >
          {featuredProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.featuredCard}
              onPress={() => handleProductPress(product)}
            >
              <Image
                source={{
                  uri: product.imageUrl || "https://via.placeholder.com/300",
                }}
                style={styles.featuredImage}
              />
              <View style={styles.featuredInfo}>
                <Text style={styles.featuredName} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.featuredPrice}>
                  {getProductPrice(product)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderCategoriesGrid = () => {
    if (categories.length === 0) return null;

    return (
      <View style={[styles.section, styles.categoriesSection]}>
        <Text style={styles.sectionTitle}>Shop by Category</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(category)}
            >
              <View style={styles.categoryIcon}>
                <Ionicons name={getCategoryIcon(category)} size={24} color="#111827" />
              </View>
              <Text style={styles.categoryName} numberOfLines={2}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#111827" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <TopBar />

      {/* Scrollable Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#111827"
          />
        }
      >
        {/* Featured Carousel */}
        {renderFeaturedCarousel()}

        {/* Categories Grid */}
        {renderCategoriesGrid()}

        {/* All Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Products</Text>
            <TouchableOpacity onPress={() => router.push("/search")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productsGrid}>
            {products.map((product, index) =>
              renderProductCard(product, index)
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // White
  },
  content: {
    flex: 1,
  },
  section: {
    paddingVertical: 16, // Reduced from 24
  },
  categoriesSection: {
    marginBottom: 24, // Added extra spacing after categories
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827", // Charcoal Black
    paddingHorizontal: 16,
    fontFamily: 'PlayfairDisplay-Bold', // Luxury Heading
  },
  seeAllText: {
    fontSize: 14,
    color: "#4B5563", // Gray
    fontWeight: "500",
    fontFamily: 'Inter-Medium',
  },
  featuredScroll: {
    paddingLeft: 16,
  },
  featuredCard: {
    width: 280,
    marginRight: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, // Soft shadow
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  featuredImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#F3F4F6",
  },
  featuredInfo: {
    padding: 16,
  },
  featuredName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  featuredPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 8,
  },
  categoryCard: {
    width: (width - 48) / 4,
    alignItems: "center",
    marginBottom: 12,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F9FAFB", // Very light gray
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  categoryName: {
    fontSize: 12,
    color: "#4B5563",
    textAlign: "center",
    fontFamily: 'Inter-Medium',
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    marginTop: 8,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  productCardLeft: {
    marginRight: 12,
  },
  productCardRight: {
    marginLeft: 0,
  },
  productImage: {
    width: "100%",
    height: 180, // Taller images
    backgroundColor: "#F3F4F6",
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
    height: 40,
    fontFamily: 'Inter-Medium',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  lowStockText: {
    fontSize: 11,
    color: "#D4AF37", // Gold for urgency/accent? Or Red? Sticking to Gold/Red
    marginTop: 4,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});
