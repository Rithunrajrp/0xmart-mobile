import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Order, OrderStatus } from "../../types";
import api from "../../api";

export default function OrderDetailScreen() {
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

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
      case "PAYMENT_PENDING":
        return { bg: "#efefef", text: "#4a4a4a", icon: "time-outline" };
      case "PROCESSING":
      case "CONFIRMED":
        return { bg: "#f0f0f0", text: "#202020", icon: "checkmark-circle-outline" };
      case "SHIPPED":
        return { bg: "#ededed", text: "#1b1b1b", icon: "airplane-outline" };
      case "DELIVERED":
        return { bg: "#f2f2f2", text: "#2d2d2d", icon: "checkmark-done-outline" };
      case "CANCELLED":
      case "REFUNDED":
        return { bg: "#ececec", text: "#2f2f2f", icon: "close-circle-outline" };
      default:
        return { bg: "#f2f2f2", text: "#6a6a6a", icon: "help-circle-outline" };
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#0a0a0a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 24 }} />
        </View>

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

  const statusInfo = getStatusColor(order.status);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0a0a0a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Status Card */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View
              style={[styles.statusIconContainer, { backgroundColor: statusInfo.bg }]}
            >
              <Ionicons name={statusInfo.icon as any} size={32} color={statusInfo.text} />
            </View>
          </View>
          <Text style={styles.statusTitle}>{order.status.replace(/_/g, " ")}</Text>
          <Text style={styles.statusSubtitle}>
            {order.status === "DELIVERED"
              ? "Your order has been delivered"
              : order.status === "SHIPPED"
              ? "Your order is on its way"
              : order.status === "CONFIRMED"
              ? "Your order is being processed"
              : order.status === "CANCELLED"
              ? "This order has been cancelled"
              : "Order placed successfully"}
          </Text>
        </Card>

        {/* Order Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order Number</Text>
            <Text style={styles.infoValue}>{order.orderNumber}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order Date</Text>
            <Text style={styles.infoValue}>
              {new Date(order.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Amount</Text>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.totalAmount}>
                ${parseFloat(order.total).toFixed(2)}
              </Text>
              <Text style={styles.totalCurrency}>{order.stablecoinType}</Text>
            </View>
          </View>
        </Card>

        {/* Tracking Info */}
        {order.trackingNumber && (
          <Card style={styles.trackingCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="cube" size={20} color="#0f0f0f" />
              <Text style={styles.cardTitle}>Tracking Information</Text>
            </View>
            <View style={styles.trackingInfo}>
              <Text style={styles.trackingLabel}>Tracking Number</Text>
              <Text style={styles.trackingNumber}>{order.trackingNumber}</Text>
            </View>
            {order.trackingUrl && (
              <TouchableOpacity
                style={styles.trackingButton}
                onPress={() => Linking.openURL(order.trackingUrl!)}
              >
                <Text style={styles.trackingButtonText}>Track Package</Text>
                <Ionicons name="open-outline" size={16} color="#0f0f0f" />
              </TouchableOpacity>
            )}
          </Card>
        )}

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
          {order.shippingAddress.phoneNumber && (
            <Text style={styles.addressPhone}>
              {order.shippingAddress.phoneNumber}
            </Text>
          )}
        </Card>

        {/* Order Items */}
        <Card style={styles.itemsCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="cart" size={20} color="#0f0f0f" />
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
                <Text style={styles.itemQuantity}>
                  ${parseFloat(item.price).toFixed(2)} x {item.quantity}
                </Text>
              </View>
              <Text style={styles.itemPrice}>
                ${parseFloat(item.totalPrice).toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                ${parseFloat(order.subtotal).toFixed(2)}
              </Text>
            </View>
            {parseFloat(order.tax) > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax</Text>
                <Text style={styles.summaryValue}>
                  ${parseFloat(order.tax).toFixed(2)}
                </Text>
              </View>
            )}
            {parseFloat(order.shippingFee) > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={styles.summaryValue}>
                  ${parseFloat(order.shippingFee).toFixed(2)}
                </Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ${parseFloat(order.total).toFixed(2)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Transaction Info */}
        {order.transactionHash && (
          <Card style={styles.transactionCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="swap-horizontal" size={20} color="#0f0f0f" />
              <Text style={styles.cardTitle}>Payment Transaction</Text>
            </View>
            <Text style={styles.transactionLabel}>Transaction Hash</Text>
            <Text style={styles.transactionHash} numberOfLines={1}>
              {order.transactionHash}
            </Text>
            <Text style={styles.transactionNetwork}>
              Network: {order.network?.toUpperCase()}
            </Text>
          </Card>
        )}

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e3e3e3",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0a0a0a",
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
  statusCard: {
    alignItems: "center",
    paddingVertical: 32,
    marginBottom: 16,
  },
  statusHeader: {
    marginBottom: 16,
  },
  statusIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0a0a0a",
    marginBottom: 8,
    textTransform: "capitalize",
  },
  statusSubtitle: {
    fontSize: 14,
    color: "#6a6a6a",
    textAlign: "center",
  },
  infoCard: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6a6a6a",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0a0a0a",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f0f0f",
  },
  totalCurrency: {
    fontSize: 12,
    color: "#6a6a6a",
  },
  divider: {
    height: 1,
    backgroundColor: "#e3e3e3",
  },
  trackingCard: {
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
  trackingInfo: {
    marginBottom: 12,
  },
  trackingLabel: {
    fontSize: 12,
    color: "#6a6a6a",
    marginBottom: 4,
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0a0a0a",
    fontFamily: "monospace",
  },
  trackingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#f6f6f6",
    padding: 12,
    borderRadius: 8,
  },
  trackingButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f0f0f",
  },
  addressCard: {
    marginBottom: 16,
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
  addressPhone: {
    fontSize: 14,
    color: "#0f0f0f",
    marginTop: 4,
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
  summarySection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e3e3e3",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6a6a6a",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0a0a0a",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 12,
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
  transactionCard: {
    marginBottom: 16,
  },
  transactionLabel: {
    fontSize: 12,
    color: "#6a6a6a",
    marginBottom: 4,
  },
  transactionHash: {
    fontSize: 12,
    fontWeight: "500",
    color: "#0a0a0a",
    fontFamily: "monospace",
    marginBottom: 8,
  },
  transactionNetwork: {
    fontSize: 12,
    color: "#6a6a6a",
  },
});
