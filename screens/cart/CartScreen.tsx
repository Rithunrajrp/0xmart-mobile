import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useAuthStore } from "../../store/auth-store";
import { useCartStore } from "../../store/cart-store";
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
          <Ionicons name="cart-outline" size={80} color="#D1D5DB" />
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
          <Ionicons name="arrow-back" size={24} color="#111827" />
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
                      <Ionicons name="remove" size={18} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      style={styles.quantityButton}
                    >
                      <Ionicons name="add" size={18} color="#111827" />
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
    backgroundColor: "#FFFFFF", // White
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#FFFFFF",
    // borderBottomWidth: 1,
    // borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827", // Charcoal
    flex: 1,
    textAlign: "center",
    marginLeft: -24, // Offset to center with back button
  },
  clearButton: {
    fontSize: 14,
    color: "#EF4444", // Red
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  stablecoinContainer: {
    padding: 16,
    backgroundColor: "#F9FAFB", // Very Light Gray
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
    fontFamily: 'Inter-Medium',
  },
  stablecoinButtons: {
    flexDirection: "row",
    gap: 8,
  },
  stablecoinButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  stablecoinButtonActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  stablecoinText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  stablecoinTextActive: {
    color: "#FFFFFF",
  },
  itemsContainer: {
    padding: 16,
  },
  itemCard: {
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
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
    color: "#111827", // Charcoal
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  itemCategory: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
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
    borderColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  quantityButton: {
    padding: 8,
    backgroundColor: "#F3F4F6",
  },
  quantityText: {
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  itemTotal: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  summaryCard: {
    margin: 16,
    backgroundColor: "#FFFFFF", // White
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827", // Charcoal
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  summaryTotal: {
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827", // Charcoal
    textAlign: "right",
  },
  totalCurrency: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "right",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  bottomTotal: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  checkoutButton: {
    paddingHorizontal: 24,
    backgroundColor: "#111827", // Charcoal
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
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
  browseButton: {
    marginTop: 24,
    backgroundColor: "#111827",
  },
});
