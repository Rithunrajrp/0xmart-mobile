import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Product, StablecoinType } from "../../types";
import { useCartStore } from "../../store/cart-store";
import { useFavoritesStore } from "../../store/favorites-store";
import { useAuthStore } from "../../store/auth-store";
import { Ionicons } from "@expo/vector-icons";

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  stablecoin?: StablecoinType;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  stablecoin = "USDT",
}) => {
  const { addItem, isInCart } = useCartStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { isAuthenticated } = useAuthStore();

  const price = product.prices.find((p) => p.stablecoinType === stablecoin);
  const inCart = isInCart(product.id);
  const isFav = isFavorite(product.id);

  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    addItem(product, 1);
  };

  const handleToggleFavorite = async (e: any) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      // Navigate to login
      return;
    }
    try {
      await toggleFavorite(product.id);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={48} color="#6a6a6a" />
          </View>
        )}

        {/* Favorite Button */}
        {isAuthenticated && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={24}
              color={isFav ? "#ef4444" : "#ffffff"}
            />
          </TouchableOpacity>
        )}

        {/* Stock Badge */}
        {product.stock === 0 && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Category */}
        {product.category && (
          <Text style={styles.category}>{product.category}</Text>
        )}

        {/* Name */}
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Rating */}
        {product.avgRating && product.avgRating > 0 && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#f59e0b" />
            <Text style={styles.ratingText}>
              {product.avgRating.toFixed(1)}
            </Text>
            {product.reviewCount && (
              <Text style={styles.reviewCount}>({product.reviewCount})</Text>
            )}
          </View>
        )}

        {/* Price and Cart */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.price}>
              ${price ? parseFloat(price.price).toFixed(2) : "0.00"}
            </Text>
            <Text style={styles.stablecoin}>{stablecoin}</Text>
          </View>

          {product.stock > 0 && (
            <TouchableOpacity
              style={[styles.cartButton, inCart && styles.cartButtonActive]}
              onPress={handleAddToCart}
            >
              <Ionicons
                name={inCart ? "checkmark" : "cart-outline"}
                size={20}
                color="#ffffff"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  imageContainer: {
    width: "100%",
    height: 180,
    backgroundColor: "#1e1e1e",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e1e1e",
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    padding: 6,
  },
  outOfStockBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  outOfStockText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    padding: 12,
  },
  category: {
    fontSize: 12,
    color: "#a0a0a0",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: "#a0a0a0",
    marginLeft: 4,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#8b5cf6",
  },
  stablecoin: {
    fontSize: 12,
    color: "#a0a0a0",
  },
  cartButton: {
    backgroundColor: "#8b5cf6",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cartButtonActive: {
    backgroundColor: "#22c55e",
  },
});
