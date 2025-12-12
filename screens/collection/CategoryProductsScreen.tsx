import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../../components/ui/Card";
import { useCartStore } from "../../store/cart-store";
import { useFavoritesStore } from "../../store/favorites-store";
import { Product } from "../../types";
import api from "../../api";

export default function CategoryProductsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const category = (params.category as string) || "";

  const { selectedStablecoin } = useCartStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [category]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.getProducts({
        page: 1,
        limit: 50,
        status: "ACTIVE",
        category: category,
      });
      setProducts(response.products || response);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProductPrice = (product: Product): { value: number; coin: string } => {
    const price =
      product.prices?.find((p) => p.stablecoinType === selectedStablecoin) ||
      product.prices?.[0];
    return {
      value: price ? parseFloat(price.price) : 0,
      coin: price?.stablecoinType || selectedStablecoin,
    };
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadProducts}
            tintColor="#8b5cf6"
          />
        }
      >
        {products.length === 0 && !loading ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={80} color="#4a4a4a" />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>
              Check back later for new items
            </Text>
          </View>
        ) : (
          <View style={styles.itemsContainer}>
            {products.map((product) => {
              const price = getProductPrice(product);
              const isLiked = isFavorite(product.id);

              return (
                <Card key={product.id} style={styles.itemCard}>
                  <TouchableOpacity
                    style={styles.itemContent}
                    onPress={() => router.push(`/product/${product.id}`)}
                    activeOpacity={0.7}
                  >
                    {/* Image */}
                    <View style={styles.imageContainer}>
                      {product.imageUrl ? (
                        <Image
                          source={{ uri: product.imageUrl }}
                          style={styles.itemImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.placeholderImage}>
                          <Ionicons name="image-outline" size={32} color="#6a6a6a" />
                        </View>
                      )}
                    </View>

                    {/* Details */}
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName} numberOfLines={2}>
                        {product.name}
                      </Text>
                      {product.category && (
                        <Text style={styles.itemCategory}>
                          {product.category}
                        </Text>
                      )}
                      <Text style={styles.itemPrice}>
                        ${price.value.toFixed(2)} {price.coin}
                      </Text>
                      {product.stock !== undefined && product.stock < 10 && product.stock > 0 && (
                        <Text style={styles.lowStockText}>
                          Only {product.stock} left!
                        </Text>
                      )}
                    </View>

                    {/* Favorite Button */}
                    <TouchableOpacity
                      onPress={() => toggleFavorite(product.id)}
                      style={styles.favoriteButton}
                    >
                      <Ionicons
                        name={isLiked ? "heart" : "heart-outline"}
                        size={24}
                        color={isLiked ? "#ef4444" : "#a0a0a0"}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                </Card>
              );
            })}
          </View>
        )}

        {/* Spacer */}
        <View style={{ height: 32 }} />
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
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#121212",
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    flex: 1,
    textAlign: "center",
    textTransform: "capitalize",
  },
  content: {
    flex: 1,
  },
  itemsContainer: {
    padding: 16,
  },
  itemCard: {
    marginBottom: 12,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#1e1e1e",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: "#a0a0a0",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8b5cf6",
  },
  lowStockText: {
    fontSize: 11,
    color: "#ef4444",
    marginTop: 4,
  },
  favoriteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#a0a0a0",
    marginTop: 8,
    textAlign: "center",
  },
});
