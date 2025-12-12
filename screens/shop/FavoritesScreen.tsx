import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useFavoritesStore } from "../../store/favorites-store";
import { useCartStore } from "../../store/cart-store";
import { useAuthStore } from "../../store/auth-store";

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, isLoading, fetchFavorites, removeFavorite, toggleFavorite } =
    useFavoritesStore();
  const { selectedStablecoin } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [isAuthenticated]);

  const loadFavorites = async () => {
    try {
      await fetchFavorites();
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const handleRemoveFavorite = (productId: string, productName: string) => {
    Alert.alert(
      "Remove from Favorites",
      `Remove ${productName} from favorites?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => toggleFavorite(productId),
        },
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Favorites</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color="#4a4a4a" />
          <Text style={styles.emptyTitle}>Login to view favorites</Text>
          <Text style={styles.emptySubtitle}>
            Save your favorite products for easy access
          </Text>
          <Button
            title="Login"
            onPress={() => router.push("/auth/login")}
            style={styles.loginButton}
            icon={<Ionicons name="log-in" size={20} color="#ffffff" />}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (favorites.length === 0 && !isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Favorites</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color="#4a4a4a" />
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptySubtitle}>
            Start adding products to your wishlist
          </Text>
          <Button
            title="Browse Products"
            onPress={() => router.push("/")}
            style={styles.loginButton}
            icon={<Ionicons name="storefront" size={20} color="#ffffff" />}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadFavorites}
            tintColor="#8b5cf6"
          />
        }
      >
        {/* Favorite Items */}
        <View style={styles.itemsContainer}>
          {favorites.map((product) => {
            const price = product.prices?.find(
              (p) => p.stablecoinType === selectedStablecoin
            ) || product.prices?.[0];
            const priceValue = price ? parseFloat(price.price) : 0;

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
                      ${priceValue.toFixed(2)} {price?.stablecoinType || selectedStablecoin}
                    </Text>
                  </View>

                  {/* Remove Button */}
                  <TouchableOpacity
                    onPress={() => handleRemoveFavorite(product.id, product.name)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="heart" size={24} color="#ef4444" />
                  </TouchableOpacity>
                </TouchableOpacity>
              </Card>
            );
          })}
        </View>

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
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8b5cf6",
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
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
  loginButton: {
    marginTop: 24,
  },
});
