import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Order } from "../../types";
import api from "../../api";

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      const data = await api.getOrder(id as string);
      setOrder(data);
    } catch (error) {
      console.error("Error loading order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0f0f0f" />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#303030" />
          <Text style={styles.errorText}>Order not found</Text>
          <Button
            title="Go to Orders"
            onPress={() => router.replace("/orders")}
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Success Icon */}
        <View style={styles.successIcon}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={64} color="#2b2b2b" />
          </View>
        </View>

        {/* Success Message */}
        <View style={styles.successMessage}>
          <Text style={styles.successTitle}>Order Placed Successfully!</Text>
          <Text style={styles.successSubtitle}>
            Thank you for your purchase
          </Text>
        </View>

        {/* Order Details Card */}
        <Card style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderLabel}>Order Number</Text>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{order.status}</Text>
            </View>
          </View>

          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Total Amount</Text>
            <View>
              <Text style={styles.orderAmount}>
                ${parseFloat(order.total).toFixed(2)}
              </Text>
              <Text style={styles.orderCurrency}>{order.stablecoinType}</Text>
            </View>
          </View>

          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Payment Status</Text>
            <View style={styles.paidBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#2b2b2b" />
              <Text style={styles.paidText}>Paid</Text>
            </View>
          </View>

          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Order Date</Text>
            <Text style={styles.orderValue}>
              {new Date(order.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </Card>

        {/* Shipping Address */}
        <Card style={styles.addressCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={20} color="#0f0f0f" />
            <Text style={styles.cardTitle}>Shipping Address</Text>
          </View>

          <Text style={styles.addressName}>{order.shippingAddress.fullName}</Text>
          <Text style={styles.addressText}>
            {order.shippingAddress.addressLine1}
          </Text>
          {order.shippingAddress.addressLine2 && (
            <Text style={styles.addressText}>
              {order.shippingAddress.addressLine2}
            </Text>
          )}
          <Text style={styles.addressText}>
            {order.shippingAddress.city}
            {order.shippingAddress.state && `, ${order.shippingAddress.state}`}{" "}
            {order.shippingAddress.postalCode}
          </Text>
          <Text style={styles.addressText}>{order.shippingAddress.country}</Text>
        </Card>

        {/* Order Items */}
        <Card style={styles.itemsCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="cube" size={20} color="#0f0f0f" />
            <Text style={styles.cardTitle}>Order Items</Text>
          </View>

          {order.items.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.orderItem,
                index < order.items.length - 1 && styles.orderItemBorder,
              ]}
            >
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>
                  {item.product?.name || "Product"}
                </Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                ${parseFloat(item.totalPrice).toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              ${parseFloat(order.total).toFixed(2)}
            </Text>
          </View>
        </Card>

        {/* Info Box */}
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle" size={20} color="#0f0f0f" />
            <Text style={styles.infoText}>
              You will receive updates about your order via email. Track your order
              status in the Orders section.
            </Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="View Order Details"
            onPress={() => router.replace(`/orders/${order.id}`)}
            style={styles.actionButton}
            icon={<Ionicons name="receipt" size={20} color="#ffffff" />}
          />

          <Button
            title="Continue Shopping"
            onPress={() => router.replace("/")}
            variant="outline"
            style={styles.actionButton}
            icon={<Ionicons name="storefront" size={20} color="#0f0f0f" />}
          />
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0a0a0a",
    marginTop: 16,
  },
  errorButton: {
    marginTop: 24,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  successIcon: {
    alignItems: "center",
    marginVertical: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
  },
  successMessage: {
    alignItems: "center",
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0a0a0a",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: "#6a6a6a",
  },
  orderCard: {
    marginBottom: 16,
  },
  orderHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  orderLabel: {
    fontSize: 12,
    color: "#6a6a6a",
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0a0a0a",
    fontFamily: "monospace",
  },
  divider: {
    height: 1,
    backgroundColor: "#e3e3e3",
    marginVertical: 16,
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#202020",
    textTransform: "uppercase",
  },
  orderAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f0f0f",
    textAlign: "right",
  },
  orderCurrency: {
    fontSize: 12,
    color: "#6a6a6a",
    textAlign: "right",
  },
  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  paidText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2d2d2d",
  },
  orderValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0a0a0a",
  },
  addressCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0a0a0a",
  },
  addressName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0a0a0a",
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: "#6a6a6a",
    marginBottom: 4,
  },
  itemsCard: {
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  orderItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#e3e3e3",
  },
  itemDetails: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0a0a0a",
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: "#6a6a6a",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0a0a0a",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e3e3e3",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0a0a0a",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f0f0f",
  },
  infoCard: {
    marginBottom: 16,
    backgroundColor: "#f6f6f6",
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#151515",
    lineHeight: 18,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    width: "100%",
  },
});
