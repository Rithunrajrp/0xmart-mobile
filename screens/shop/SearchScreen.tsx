import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Product } from "../../types";
import { useCartStore } from "../../store/cart-store";
import { useFavoritesStore } from "../../store/favorites-store";
import api from "../../api";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialQuery = params.q as string || "";

  const { selectedStablecoin } = useCartStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) return;

    try {
      setLoading(true);
      setSearched(true);
      const results = await api.searchProducts(searchTerm);
      setProducts(results.products || results);
    } catch (error) {
      console.error("Error searching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  const getProductPrice = (product: Product): string => {
    if (!product.prices || product.prices.length === 0) return "N/A";
    const price = product.prices.find(
      (p) => p.stablecoinType === selectedStablecoin
    ) || product.prices[0];
    return `${price.stablecoinType} ${parseFloat(price.price.toString()).toFixed(2)}`;
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
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#a0a0a0" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#a0a0a0"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#a0a0a0" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8b5cf6" />
          </View>
        ) : searched && products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#6a6a6a" />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>
              Try searching with different keywords
            </Text>
          </View>
        ) : products.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.resultsText}>
              {products.length} {products.length === 1 ? "result" : "results"} found
            </Text>
            <View style={styles.productsGrid}>
              {products.map((product, index) => renderProductCard(product, index))}
            </View>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#6a6a6a" />
            <Text style={styles.emptyTitle}>Start searching</Text>
            <Text style={styles.emptySubtitle}>
              Enter keywords to find products
            </Text>
          </View>
        )}
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
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e1e1e",
  },
  backButton: {
    padding: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 15,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingVertical: 16,
  },
  resultsText: {
    fontSize: 14,
    color: "#a0a0a0",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    marginBottom: 12,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#a0a0a0",
    textAlign: "center",
  },
});
