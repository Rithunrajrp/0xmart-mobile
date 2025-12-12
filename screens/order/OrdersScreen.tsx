import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { TopBar } from "../../components/navigation/TopBar";
import { useAuthStore } from "../../store/auth-store";
import { Order, OrderStatus } from "../../types";
import api from "../../api";

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
              <Ionicons name="cube-outline" size={16} color="#a0a0a0" />
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
              <Ionicons name="chevron-forward" size={16} color="#8b5cf6" />
            </TouchableOpacity>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <TopBar />

        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color="#4a4a4a" />
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
      <TopBar />

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
          <Ionicons name="receipt-outline" size={64} color="#4a4a4a" />
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
    backgroundColor: "#0a0a0a",
  },
  filterContainer: {
    backgroundColor: "#121212",
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  filterList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#8b5cf6",
    borderColor: "#8b5cf6",
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#a0a0a0",
  },
  filterTextActive: {
    color: "#ffffff",
  },
  ordersList: {
    padding: 16,
  },
  orderCard: {
    marginBottom: 16,
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
    color: "#ffffff",
    marginBottom: 4,
    fontFamily: "monospace",
  },
  orderDate: {
    fontSize: 12,
    color: "#a0a0a0",
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
    borderColor: "#2a2a2a",
    marginBottom: 12,
  },
  itemsCount: {
    fontSize: 14,
    color: "#a0a0a0",
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: "700",
    color: "#8b5cf6",
  },
  trackingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  trackingText: {
    fontSize: 12,
    color: "#a0a0a0",
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
    color: "#8b5cf6",
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
  actionButton: {
    marginTop: 24,
  },
  emptyOrders: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
  },
  emptyOrdersTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 16,
  },
  emptyOrdersSubtitle: {
    fontSize: 14,
    color: "#a0a0a0",
    marginTop: 8,
    textAlign: "center",
  },
  browseButton: {
    marginTop: 24,
  },
});
