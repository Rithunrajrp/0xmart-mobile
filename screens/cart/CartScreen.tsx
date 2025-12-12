import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useCartStore } from "../../store/cart-store";
import { useAuthStore } from "../../store/auth-store";
import { StablecoinType } from "../../types";

export default function CartScreen() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getTotal,
    selectedStablecoin,
    setSelectedStablecoin,
  } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const subtotal = getTotal();
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      Alert.alert("Login Required", "Please login to proceed with checkout", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => router.push("/auth/login") },
      ]);
      return;
    }

    router.push("/checkout");
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    Alert.alert(
      "Remove Item",
      `Remove ${productName} from cart?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeItem(productId),
        },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      "Clear Cart",
      "Remove all items from cart?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: clearCart },
      ]
    );
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#4a4a4a" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Start shopping to add items to your cart
          </Text>
          <Button
            title="Browse Products"
            onPress={() => router.push("/")}
            style={styles.browseButton}
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
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <TouchableOpacity onPress={handleClearCart}>
          <Text style={styles.clearButton}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Stablecoin Selector */}
        <View style={styles.stablecoinContainer}>
          <Text style={styles.sectionTitle}>Pay with:</Text>
          <View style={styles.stablecoinButtons}>
            {(["USDT", "USDC", "DAI", "BUSD"] as StablecoinType[]).map(
              (coin) => (
                <TouchableOpacity
                  key={coin}
                  style={[
                    styles.stablecoinButton,
                    selectedStablecoin === coin &&
                      styles.stablecoinButtonActive,
                  ]}
                  onPress={() => setSelectedStablecoin(coin)}
                >
                  <Text
                    style={[
                      styles.stablecoinText,
                      selectedStablecoin === coin &&
                        styles.stablecoinTextActive,
                    ]}
                  >
                    {coin}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        {/* Cart Items */}
        <View style={styles.itemsContainer}>
          {items.map((item) => {
            const price = item.product.prices.find(
              (p) => p.stablecoinType === selectedStablecoin
            );
            const itemTotal = price
              ? parseFloat(price.price) * item.quantity
              : 0;

            return (
              <Card key={item.product.id} style={styles.itemCard}>
                <View style={styles.itemContent}>
                  {/* Image */}
                  <View style={styles.imageContainer}>
                    {item.product.imageUrl ? (
                      <Image
                        source={{ uri: item.product.imageUrl }}
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
                      {item.product.name}
                    </Text>
                    {item.product.category && (
                      <Text style={styles.itemCategory}>
                        {item.product.category}
                      </Text>
                    )}
                    <Text style={styles.itemPrice}>
                      ${price ? parseFloat(price.price).toFixed(2) : "0.00"}
                    </Text>
                  </View>

                  {/* Remove Button */}
                  <TouchableOpacity
                    onPress={() =>
                      handleRemoveItem(item.product.id, item.product.name)
                    }
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                {/* Quantity and Total */}
                <View style={styles.itemFooter}>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      onPress={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      style={styles.quantityButton}
                    >
                      <Ionicons name="remove" size={18} color="#ffffff" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      style={styles.quantityButton}
                    >
                      <Ionicons name="add" size={18} color="#ffffff" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.itemTotal}>
                    ${itemTotal.toFixed(2)}
                  </Text>
                </View>
              </Card>
            );
          })}
        </View>

        {/* Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (10%)</Text>
            <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
          </View>

          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.totalLabel}>Total</Text>
            <View>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
              <Text style={styles.totalCurrency}>{selectedStablecoin}</Text>
            </View>
          </View>
        </Card>

        {/* Spacer for bottom button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>Total Amount</Text>
          <Text style={styles.bottomTotal}>
            ${total.toFixed(2)} {selectedStablecoin}
          </Text>
        </View>
        <Button
          title="Checkout"
          onPress={handleCheckout}
          style={styles.checkoutButton}
          icon={<Ionicons name="arrow-forward" size={20} color="#ffffff" />}
        />
      </View>
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
    marginLeft: -24, // Offset to center with back button
  },
  clearButton: {
    fontSize: 14,
    color: "#ef4444",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  stablecoinContainer: {
    padding: 16,
    backgroundColor: "#121212",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#a0a0a0",
    marginBottom: 12,
  },
  stablecoinButtons: {
    flexDirection: "row",
    gap: 8,
  },
  stablecoinButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    alignItems: "center",
  },
  stablecoinButtonActive: {
    backgroundColor: "#8b5cf6",
    borderColor: "#8b5cf6",
  },
  stablecoinText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#a0a0a0",
  },
  stablecoinTextActive: {
    color: "#ffffff",
  },
  itemsContainer: {
    padding: 16,
  },
  itemCard: {
    marginBottom: 12,
  },
  itemContent: {
    flexDirection: "row",
    marginBottom: 12,
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
    padding: 4,
  },
  itemFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 8,
    overflow: "hidden",
  },
  quantityButton: {
    padding: 8,
    backgroundColor: "#1e1e1e",
  },
  quantityText: {
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  itemTotal: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  summaryCard: {
    margin: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#a0a0a0",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  summaryTotal: {
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#8b5cf6",
    textAlign: "right",
  },
  totalCurrency: {
    fontSize: 12,
    color: "#a0a0a0",
    textAlign: "right",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#121212",
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
  },
  bottomLabel: {
    fontSize: 12,
    color: "#a0a0a0",
  },
  bottomTotal: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  checkoutButton: {
    paddingHorizontal: 24,
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
  browseButton: {
    marginTop: 24,
  },
});
