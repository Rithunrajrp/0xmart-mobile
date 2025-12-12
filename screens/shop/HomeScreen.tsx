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
    router.push(`/category/${encodeURIComponent(category)}`);
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shop by Category</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(category)}
            >
              <View style={styles.categoryIcon}>
                <Ionicons name="grid-outline" size={24} color="#8b5cf6" />
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
          <ActivityIndicator size="large" color="#8b5cf6" />
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
            tintColor="#8b5cf6"
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
            <TouchableOpacity onPress={() => router.push("/products")}>
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
    backgroundColor: "#0a0a0a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e1e1e",
  },
  logo: {
    width: 100,
    height: 30,
  },
  cartButton: {
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  section: {
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    paddingHorizontal: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: "#8b5cf6",
    fontWeight: "600",
  },
  featuredScroll: {
    paddingLeft: 16,
  },
  featuredCard: {
    width: 280,
    marginRight: 12,
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    overflow: "hidden",
  },
  featuredImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#2a2a2a",
  },
  featuredInfo: {
    padding: 12,
  },
  featuredName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  featuredPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8b5cf6",
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
    marginBottom: 8,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1e1e1e",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: "#ffffff",
    textAlign: "center",
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    marginTop: 8,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  productCardLeft: {
    marginRight: 12,
  },
  productCardRight: {
    marginLeft: 0,
  },
  productImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#2a2a2a",
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
    height: 40,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#8b5cf6",
  },
  lowStockText: {
    fontSize: 11,
    color: "#ef4444",
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
