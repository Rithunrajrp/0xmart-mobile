import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Product, StablecoinType } from "../../types";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useCartStore } from "../../store/cart-store";
import { useFavoritesStore } from "../../store/favorites-store";
import { useAuthStore } from "../../store/auth-store";
import api from "../../api";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { addItem, getItemQuantity, updateQuantity, selectedStablecoin } =
    useCartStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { isAuthenticated } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const cartQuantity = product ? getItemQuantity(product.id) : 0;
  const isFav = product ? isFavorite(product.id) : false;

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await api.getProduct(id as string);
      setProduct(data);

      // Auto-select first size/color if available
      if (data.specifications) {
        const specs = typeof data.specifications === 'string'
          ? JSON.parse(data.specifications)
          : data.specifications;

        if (specs.sizes && Array.isArray(specs.sizes) && specs.sizes.length > 0) {
          setSelectedSize(specs.sizes[0]);
        }
        if (specs.colors && Array.isArray(specs.colors) && specs.colors.length > 0) {
          setSelectedColor(specs.colors[0]);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load product");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    Alert.alert("Success", `Added ${quantity} item(s) to cart`);
  };

  const handleToggleFavorite = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      Alert.alert("Login Required", "Please login to add favorites", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => router.push("/auth/login") },
      ]);
      return;
    }

    try {
      await toggleFavorite(product.id);
    } catch (error) {
      Alert.alert("Error", "Failed to update favorites");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return null;
  }

  const price = product.prices?.find((p) => p.stablecoinType === selectedStablecoin);

  // Safely handle images - ensure it's always an array
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.imageUrl
    ? [product.imageUrl]
    : [];

  // Parse specifications for variants - with error handling
  let specifications = {};
  try {
    if (product.specifications) {
      specifications = typeof product.specifications === 'string'
        ? JSON.parse(product.specifications)
        : product.specifications;
    }
  } catch (error) {
    console.error('Error parsing specifications:', error);
    specifications = {};
  }

  const sizes = Array.isArray(specifications.sizes) ? specifications.sizes : [];
  const colors = Array.isArray(specifications.colors) ? specifications.colors : [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleToggleFavorite} style={styles.headerIcon}>
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={24}
              color={isFav ? "#8b5cf6" : "#ffffff"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/cart")} style={styles.headerIcon}>
            <Ionicons name="cart-outline" size={24} color="#ffffff" />
            {cartQuantity > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartQuantity}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          {images.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const index = Math.floor(e.nativeEvent.contentOffset.x / width);
                  setSelectedImage(index);
                }}
              >
                {images.map((img, index) => (
                  <Image
                    key={index}
                    source={{ uri: img }}
                    style={styles.mainImage}
                    resizeMode="contain"
                  />
                ))}
              </ScrollView>
              {images.length > 1 && (
                <View style={styles.imageIndicator}>
                  <Text style={styles.imageIndicatorText}>
                    {selectedImage + 1} / {images.length}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={64} color="#3a3a3a" />
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          {/* Brand */}
          {product.brand && (
            <TouchableOpacity>
              <Text style={styles.brand}>Visit the {product.brand} Store</Text>
            </TouchableOpacity>
          )}

          {/* Name */}
          <Text style={styles.name}>{product.name}</Text>

          {/* Rating & Reviews */}
          {product.avgRating && product.avgRating > 0 && (
            <View style={styles.ratingContainer}>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= (product.avgRating || 0) ? "star" : "star-outline"}
                    size={16}
                    color="#ffa41c"
                  />
                ))}
              </View>
              <Text style={styles.ratingNumber}>{product.avgRating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>
                {product.reviewCount || 0} ratings
              </Text>
            </View>
          )}

          {/* Price & Stock */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Price:</Text>
              <Text style={styles.price}>
                ${price ? parseFloat(price.price).toFixed(2) : "0.00"}
              </Text>
              <Text style={styles.stablecoin}>{selectedStablecoin}</Text>
            </View>

            {/* Stock Status */}
            {product.stock !== undefined && (
              <View style={styles.stockRow}>
                {product.stock > 0 ? (
                  <View style={styles.inStockContainer}>
                    <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
                    <Text style={styles.inStockText}>
                      In Stock ({product.stock} available)
                    </Text>
                  </View>
                ) : (
                  <View style={styles.outOfStockContainer}>
                    <Ionicons name="close-circle" size={18} color="#ef4444" />
                    <Text style={styles.outOfStockText}>Out of Stock</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Size Selector */}
          {sizes.length > 0 && (
            <View style={styles.variantSection}>
              <Text style={styles.variantLabel}>Size: <Text style={styles.variantValue}>{selectedSize}</Text></Text>
              <View style={styles.variantOptions}>
                {sizes.map((size: string) => (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setSelectedSize(size)}
                    style={[
                      styles.variantButton,
                      selectedSize === size && styles.variantButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.variantButtonText,
                        selectedSize === size && styles.variantButtonTextActive,
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Color Selector */}
          {colors.length > 0 && (
            <View style={styles.variantSection}>
              <Text style={styles.variantLabel}>Color: <Text style={styles.variantValue}>{selectedColor}</Text></Text>
              <View style={styles.variantOptions}>
                {colors.map((color: string) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={[
                      styles.variantButton,
                      selectedColor === color && styles.variantButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.variantButtonText,
                        selectedColor === color && styles.variantButtonTextActive,
                      ]}
                    >
                      {color}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Quantity Selector */}
          {product.stock !== undefined && product.stock > 0 && (
            <View style={styles.quantitySection}>
              <Text style={styles.variantLabel}>Quantity:</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  style={styles.quantityButton}
                >
                  <Ionicons name="remove" size={20} color="#ffffff" />
                </TouchableOpacity>
                <View style={styles.quantityDisplay}>
                  <Text style={styles.quantityText}>{quantity}</Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    setQuantity(Math.min(product.stock || 1, quantity + 1))
                  }
                  style={styles.quantityButton}
                >
                  <Ionicons name="add" size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          {product.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this item</Text>
              <Text
                style={styles.description}
                numberOfLines={showFullDescription ? undefined : 4}
              >
                {product.description}
              </Text>
              {(product.description?.length || 0) > 150 && (
                <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
                  <Text style={styles.readMore}>
                    {showFullDescription ? "Show less" : "Read more"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Product Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product details</Text>
            <View style={styles.detailsGrid}>
              {product.brand && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Brand</Text>
                  <Text style={styles.detailValue}>{product.brand}</Text>
                </View>
              )}
              {product.category && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Category</Text>
                  <Text style={styles.detailValue}>{product.category}</Text>
                </View>
              )}
              {product.sku && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>SKU</Text>
                  <Text style={styles.detailValue}>{product.sku}</Text>
                </View>
              )}
              {product.seller && product.seller.companyName && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Seller</Text>
                  <Text style={styles.detailValue}>{product.seller.companyName}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      {product.stock !== undefined && product.stock > 0 && (
        <View style={styles.bottomBar}>
          <Button
            title={cartQuantity > 0 ? `Update Cart (${cartQuantity})` : "Add to Cart"}
            onPress={handleAddToCart}
            style={styles.addToCartButton}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#121212",
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  headerIcon: {
    padding: 8,
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#8b5cf6",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    backgroundColor: "#1a1a1a",
    height: 350,
    position: "relative",
  },
  mainImage: {
    width: width,
    height: 350,
  },
  placeholderImage: {
    width: "100%",
    height: 350,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1a1a",
  },
  imageIndicator: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageIndicatorText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  productInfo: {
    padding: 16,
  },
  brand: {
    fontSize: 14,
    color: "#8b5cf6",
    marginBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 12,
    lineHeight: 28,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  stars: {
    flexDirection: "row",
    gap: 2,
  },
  ratingNumber: {
    fontSize: 14,
    color: "#ffa41c",
    fontWeight: "600",
    marginLeft: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: "#a0a0a0",
    marginLeft: 8,
  },
  priceSection: {
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: "#a0a0a0",
    marginRight: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    marginRight: 6,
  },
  stablecoin: {
    fontSize: 16,
    color: "#8b5cf6",
    fontWeight: "600",
  },
  stockRow: {
    marginTop: 8,
  },
  inStockContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  inStockText: {
    fontSize: 14,
    color: "#22c55e",
    fontWeight: "600",
  },
  outOfStockContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  outOfStockText: {
    fontSize: 14,
    color: "#ef4444",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#2a2a2a",
    marginVertical: 20,
  },
  variantSection: {
    marginBottom: 20,
  },
  variantLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 12,
  },
  variantValue: {
    color: "#8b5cf6",
  },
  variantOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  variantButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "#1a1a1a",
    minWidth: 60,
    alignItems: "center",
  },
  variantButtonActive: {
    borderColor: "#8b5cf6",
    backgroundColor: "#8b5cf620",
  },
  variantButtonText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "500",
  },
  variantButtonTextActive: {
    color: "#8b5cf6",
    fontWeight: "600",
  },
  quantitySection: {
    marginBottom: 20,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    overflow: "hidden",
    marginTop: 12,
  },
  quantityButton: {
    padding: 12,
    backgroundColor: "#2a2a2a",
  },
  quantityDisplay: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#1a1a1a",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#d0d0d0",
    lineHeight: 22,
  },
  readMore: {
    fontSize: 14,
    color: "#8b5cf6",
    fontWeight: "600",
    marginTop: 8,
  },
  detailsGrid: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  detailLabel: {
    fontSize: 14,
    color: "#a0a0a0",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  bottomBar: {
    padding: 16,
    backgroundColor: "#121212",
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
  },
  addToCartButton: {
    backgroundColor: "#8b5cf6",
    borderRadius: 8,
    paddingVertical: 16,
  },
});
