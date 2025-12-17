import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useCartStore } from "../../store/cart-store";
import { useUserStore } from "../../store/user-store";
import { UserAddress } from "../../types";

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, getTotal, selectedStablecoin, clearCart } = useCartStore();
  const { addresses, fetchAddresses, wallets, fetchWallets } = useUserStore();

  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);
  const [loading, setLoading] = useState(false);

  const subtotal = getTotal();
  const tax = subtotal * 0.1;
  const shippingCost = 0; // Free shipping
  const total = subtotal + tax + shippingCost;

  const wallet = wallets.find((w) => w.stablecoinType === selectedStablecoin);
  const availableBalance = wallet
    ? parseFloat(wallet.balance) - parseFloat(wallet.lockedBalance || "0")
    : 0;
  const hasEnoughBalance = availableBalance >= total;

  useEffect(() => {
    loadData();
  }, []);

  // Auto-select default address when addresses are loaded
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddr = addresses.find((a) => a.isDefault);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr);
      } else {
        setSelectedAddress(addresses[0]);
      }
    }
  }, [addresses]);

  const loadData = async () => {
    await Promise.all([fetchAddresses(), fetchWallets()]);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert("Address Required", "Please select a shipping address");
      return;
    }

    if (!hasEnoughBalance) {
      Alert.alert(
        "Insufficient Balance",
        "You don't have enough balance. Please add funds to your wallet.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Add Funds", onPress: () => router.push("/wallets") },
        ]
      );
      return;
    }

    Alert.alert(
      "Confirm Order",
      `Place order for $${total.toFixed(2)} ${selectedStablecoin}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: processOrder,
        },
      ]
    );
  };

  const processOrder = async () => {
    setLoading(true);
    try {
      // Create order
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const order = await api.createOrder({
        stablecoinType: selectedStablecoin,
        items: orderItems,
        shippingAddress: {
          fullName: selectedAddress!.fullName,
          phone: selectedAddress!.phone,
          addressLine1: selectedAddress!.addressLine1,
          addressLine2: selectedAddress!.addressLine2,
          city: selectedAddress!.city,
          state: selectedAddress!.state,
          postalCode: selectedAddress!.postalCode,
          country: selectedAddress!.country,
        },
      });

      // Confirm payment
      await api.confirmPayment(order.id);

      // Clear cart
      clearCart();

      // Navigate to order confirmation
      router.replace(`/orders/${order.id}/confirmation`);
    } catch (error: any) {
      Alert.alert(
        "Order Failed",
        error.response?.data?.message || "Failed to place order"
      );
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    router.replace("/cart");
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Shipping Address */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <TouchableOpacity onPress={() => router.push("/addresses")}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>

          {selectedAddress ? (
            <View style={styles.addressBox}>
              <View style={styles.addressHeader}>
                <Ionicons name="location" size={20} color="#111827" />
                <Text style={styles.addressName}>{selectedAddress.fullName}</Text>
              </View>
              <Text style={styles.addressText}>{selectedAddress.addressLine1}</Text>
              {selectedAddress.addressLine2 && (
                <Text style={styles.addressText}>{selectedAddress.addressLine2}</Text>
              )}
              <Text style={styles.addressText}>
                {selectedAddress.city}
                {selectedAddress.state && `, ${selectedAddress.state}`}{" "}
                {selectedAddress.postalCode}
              </Text>
              <Text style={styles.addressText}>{selectedAddress.country}</Text>
              <View style={styles.phoneRow}>
                <Ionicons name="call" size={16} color="#6B7280" />
                <Text style={styles.phoneText}>{selectedAddress.phone}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.noAddress}>
              <Text style={styles.noAddressText}>No address selected</Text>
              <Button
                title="Add Address"
                onPress={() => router.push("/addresses")}
                size="sm"
                style={styles.addAddressButton}
              />
            </View>
          )}
        </Card>

        {/* Order Items */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items ({items.length})</Text>
          {items.map((item) => {
            const price = item.product.prices.find(
              (p) => p.stablecoinType === selectedStablecoin
            );
            const itemTotal = price
              ? parseFloat(price.price) * item.quantity
              : 0;

            return (
              <View key={item.product.id} style={styles.orderItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>${itemTotal.toFixed(2)}</Text>
              </View>
            );
          })}
        </Card>

        {/* Payment Method */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentBox}>
            <View style={styles.walletIcon}>
              <Ionicons name="wallet" size={24} color="#111827" />
            </View>
            <View style={styles.walletInfo}>
              <Text style={styles.walletName}>{selectedStablecoin} Wallet</Text>
              <Text style={styles.walletBalance}>
                Available: ${availableBalance.toFixed(2)}
              </Text>
            </View>
            {hasEnoughBalance ? (
              <Ionicons name="checkmark-circle" size={24} color="#059669" />
            ) : (
              <Ionicons name="alert-circle" size={24} color="#DC2626" />
            )}
          </View>

          {!hasEnoughBalance && (
            <View style={styles.insufficientBox}>
              <Ionicons name="warning" size={16} color="#DC2626" />
              <Text style={styles.insufficientText}>
                Insufficient balance. Please add funds.
              </Text>
            </View>
          )}
        </Card>

        {/* Order Summary */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (10%)</Text>
            <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={[styles.summaryValue, styles.freeText]}>FREE</Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <View>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
              <Text style={styles.totalCurrency}>{selectedStablecoin}</Text>
            </View>
          </View>
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>Total Amount</Text>
          <Text style={styles.bottomTotal}>
            ${total.toFixed(2)} {selectedStablecoin}
          </Text>
        </View>
        <Button
          title="Place Order"
          onPress={handlePlaceOrder}
          loading={loading}
          disabled={!selectedAddress || !hasEnoughBalance}
          style={styles.placeOrderButton}
          icon={<Ionicons name="checkmark" size={20} color="#ffffff" />}
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
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827", // Charcoal
    marginBottom: 16,
    fontFamily: 'PlayfairDisplay-Bold',
  },
  changeText: {
    fontSize: 14,
    color: "#111827", // Charcoal or Blue/Gold
    fontWeight: "600",
  },
  addressBox: {
    backgroundColor: "#F9FAFB", // Light Gray
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  addressText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  phoneText: {
    fontSize: 14,
    color: "#111827",
  },
  noAddress: {
    alignItems: "center",
    padding: 24,
  },
  noAddressText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  addAddressButton: {
    marginTop: 8,
    backgroundColor: "#111827",
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827", // Charcoal
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: "#6B7280",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  paymentBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB", // Light Gray
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6", // Lighter Gray
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  walletBalance: {
    fontSize: 14,
    color: "#6B7280",
  },
  insufficientBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2", // Red 50
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  insufficientText: {
    flex: 1,
    fontSize: 12,
    color: "#DC2626", // Red 600
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
  freeText: {
    color: "#059669", // Green 600
  },
  totalRow: {
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
  placeOrderButton: {
    paddingHorizontal: 24,
    backgroundColor: "#111827",
  },
});
