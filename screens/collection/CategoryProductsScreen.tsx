import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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
import { Card } from "../../components/ui/Card";
import { useCartStore } from "../../store/cart-store";
import { useFavoritesStore } from "../../store/favorites-store";
import { Product } from "../../types";

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
          <Ionicons name="arrow-back" size={24} color="#111827" />
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
            tintColor="#111827"
          />
        }
      >
        {products.length === 0 && !loading ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={80} color="#D1D5DB" />
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
                          <Ionicons name="image-outline" size={32} color="#9CA3AF" />
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
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#FFFFFF",
    // borderBottomWidth: 1,
    // borderBottomColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
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
    backgroundColor: "#FFFFFF",
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    borderWidth: 1,
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
    backgroundColor: "#F3F4F6",
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
    color: "#111827",
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  lowStockText: {
    fontSize: 11,
    color: "#dc2626",
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
    backgroundColor: "#FFFFFF",
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
});
