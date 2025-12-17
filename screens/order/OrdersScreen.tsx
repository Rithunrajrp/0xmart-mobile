import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useAuthStore } from "../../store/auth-store";
import { Order, OrderStatus } from "../../types";

export default function OrdersScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "ALL">("ALL");

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated, selectedStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.getOrders({
        status: selectedStatus === "ALL" ? undefined : selectedStatus,
      });
      setOrders(response.orders || response);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
      case "PAYMENT_PENDING":
        return { bg: "#f59e0b", text: "#ffffff" };
      case "PROCESSING":
      case "CONFIRMED":
        return { bg: "#3b82f6", text: "#ffffff" };
      case "SHIPPED":
        return { bg: "#8b5cf6", text: "#ffffff" };
      case "DELIVERED":
        return { bg: "#22c55e", text: "#ffffff" };
      case "CANCELLED":
      case "REFUNDED":
        return { bg: "#ef4444", text: "#ffffff" };
      default:
        return { bg: "#6a6a6a", text: "#ffffff" };
    }
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const statusColors = getStatusColor(item.status);

    return (
      <TouchableOpacity
        onPress={() => router.push(`/orders/${item.id}`)}
        activeOpacity={0.7}
      >
        <Card style={styles.orderCard}>
          {/* Header */}
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderNumber}>{item.orderNumber}</Text>
              <Text style={styles.orderDate}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View
              style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}
            >
              <Text style={[styles.statusText, { color: statusColors.text }]}>
                {item.status}
              </Text>
            </View>
          </View>

          {/* Items Summary */}
          <View style={styles.itemsSummary}>
            <Text style={styles.itemsCount}>
              {item.items.length} {item.items.length === 1 ? "item" : "items"}
            </Text>
            <Text style={styles.orderTotal}>
              ${parseFloat(item.total).toFixed(2)} {item.stablecoinType}
            </Text>
          </View>

          {/* Tracking */}
          {item.trackingNumber && (
            <View style={styles.trackingRow}>
              <Ionicons name="cube-outline" size={16} color="#6B7280" />
              <Text style={styles.trackingText}>
                Tracking: {item.trackingNumber}
              </Text>
            </View>
          )}

          {/* Footer */}
          <View style={styles.orderFooter}>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => router.push(`/orders/${item.id}`)}
            >
              <Text style={styles.viewButtonText}>View Details</Text>
              <Ionicons name="chevron-forward" size={16} color="#111827" />
            </TouchableOpacity>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Orders</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Login to view orders</Text>
          <Text style={styles.emptySubtitle}>
            Track your order history and status
          </Text>
          <Button
            title="Login"
            onPress={() => router.push("/auth/login")}
            style={styles.actionButton}
            icon={<Ionicons name="log-in" size={20} color="#ffffff" />}
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
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={["ALL", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedStatus === item && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedStatus(item)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedStatus === item && styles.filterTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Orders List */}
      {orders.length === 0 ? (
        <View style={styles.emptyOrders}>
          <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyOrdersTitle}>No orders found</Text>
          <Text style={styles.emptyOrdersSubtitle}>
            {selectedStatus === "ALL"
              ? "Start shopping to place your first order"
              : `No ${selectedStatus.toLowerCase()} orders`}
          </Text>
          {selectedStatus === "ALL" && (
            <Button
              title="Browse Products"
              onPress={() => router.push("/")}
              style={styles.browseButton}
              icon={<Ionicons name="storefront" size={20} color="#ffffff" />}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ordersList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
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
    // borderBottomColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    textAlign: "center",
  },
  filterContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  filterList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6", // Light Gray
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#111827", // Charcoal
    borderColor: "#111827",
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280", // Gray
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  ordersList: {
    padding: 16,
  },
  orderCard: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    padding: 16,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827", // Charcoal
    marginBottom: 4,
    fontFamily: "monospace",
  },
  orderDate: {
    fontSize: 12,
    color: "#6B7280", // Gray
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  itemsSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
    marginBottom: 12,
  },
  itemsCount: {
    fontSize: 14,
    color: "#6B7280",
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827", // Charcoal or Accent Color?
  },
  trackingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  trackingText: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "monospace",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827", // Charcoal
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
  actionButton: {
    marginTop: 24,
    backgroundColor: "#111827",
  },
  emptyOrders: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
    backgroundColor: "#FFFFFF",
  },
  emptyOrdersTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 16,
  },
  emptyOrdersSubtitle: {
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
