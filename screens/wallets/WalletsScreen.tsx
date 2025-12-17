import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NETWORK_DISPLAY_NAMES } from "../../api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useAuthStore } from "../../store/auth-store";
import { useUserStore } from "../../store/user-store";
import { Wallet } from "../../types";

export default function WalletsScreen() {
  const router = useRouter();
  const { wallets, fetchWallets, isLoading } = useUserStore();
  const { isAuthenticated } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadWallets();
    }
  }, [isAuthenticated]);

  // Refresh wallets when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated) {
        loadWallets();
      }
    }, [isAuthenticated])
  );

  // Log wallet count whenever it changes
  useEffect(() => {
    console.log("Wallets state updated. Count:", wallets.length);
  }, [wallets]);

  const loadWallets = async () => {
    try {
      console.log("Loading wallets...");
      await fetchWallets();
    } catch (error) {
      console.error("Error loading wallets:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWallets();
    setRefreshing(false);
  };

  const handleCopyAddress = async (address: string) => {
    await Clipboard.setStringAsync(address);
    Alert.alert("Success", "Address copied to clipboard");
  };

  const handleWalletPress = (wallet: Wallet) => {
    router.push(`/wallets/${wallet.id}`);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wallets</Text>
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons name="wallet-outline" size={80} color="#6a6a6a" />
          <Text style={styles.emptyTitle}>Login to view wallets</Text>
          <Text style={styles.emptySubtitle}>
            Manage your stablecoin wallets securely
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
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity onPress={() => router.back()} style={{marginRight: 10}}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Wallets</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/wallets/create")}>
          <Ionicons name="add-circle" size={28} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Total Balance Card */}
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceValue}>
            ${wallets
              .reduce(
                (sum, w) =>
                  sum +
                  parseFloat(w.balance) -
                  parseFloat(w.lockedBalance || "0"),
                0
              )
              .toFixed(2)}
          </Text>
          <Text style={styles.balanceSubtext}>
            Across {wallets.length} {wallets.length === 1 ? "wallet" : "wallets"}
          </Text>
        </Card>

        {/* Wallets List */}
        {wallets.length === 0 ? (
          <View style={styles.emptyWallets}>
            <Ionicons name="wallet-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyWalletsTitle}>No wallets yet</Text>
            <Text style={styles.emptyWalletsSubtitle}>
              Create your first wallet to start shopping
            </Text>
            <Button
              title="Create Wallet"
              onPress={() => router.push("/wallets/create")}
              style={styles.createButton}
              icon={<Ionicons name="add" size={20} color="#ffffff" />}
            />
          </View>
        ) : (
          <View style={styles.walletsList}>
            {wallets.map((wallet) => {
              const availableBalance =
                parseFloat(wallet.balance) -
                parseFloat(wallet.lockedBalance || "0");

              return (
                <TouchableOpacity
                  key={wallet.id}
                  onPress={() => handleWalletPress(wallet)}
                  activeOpacity={0.7}
                >
                  <Card style={styles.walletCard}>
                    {/* Header */}
                    <View style={styles.walletHeader}>
                      <View style={styles.walletIcon}>
                        <Ionicons name="wallet" size={24} color="#111827" />
                      </View>
                      <View style={styles.walletInfo}>
                        <Text style={styles.walletCoin}>
                          {wallet.stablecoinType}
                        </Text>
                        <Text style={styles.walletNetwork}>
                          {NETWORK_DISPLAY_NAMES[wallet.network]}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={24}
                        color="#6a6a6a"
                      />
                    </View>

                    {/* Balance */}
                    <View style={styles.walletBalance}>
                      <View>
                        <Text style={styles.balanceAmount}>
                          ${parseFloat(wallet.balance).toFixed(2)}
                        </Text>
                        {parseFloat(wallet.lockedBalance || "0") > 0 && (
                          <Text style={styles.lockedBalance}>
                            ${parseFloat(wallet.lockedBalance).toFixed(2)} locked
                          </Text>
                        )}
                      </View>
                      <View style={styles.availableBadge}>
                        <Text style={styles.availableText}>Available</Text>
                        <Text style={styles.availableAmount}>
                          ${availableBalance.toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    {/* Address */}
                    <View style={styles.addressContainer}>
                      <Text style={styles.addressLabel}>Deposit Address</Text>
                      <View style={styles.addressRow}>
                        <Text style={styles.addressText} numberOfLines={1}>
                          {wallet.depositAddress}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleCopyAddress(wallet.depositAddress)}
                        >
                          <Ionicons name="copy-outline" size={20} color="#111827" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Action */}
                    <View style={styles.walletActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => router.push(`/wallets/${wallet.id}/deposit`)}
                      >
                        <Ionicons name="arrow-down" size={20} color="#22c55e" />
                        <Text style={styles.actionText}>Deposit</Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Create Wallet Button */}
        {wallets.length > 0 && (
          <Button
            title="Create New Wallet"
            onPress={() => router.push("/wallets/create")}
            variant="outline"
            style={styles.createNewButton}
            icon={<Ionicons name="add" size={20} color="#8b5cf6" />}
          />
        )}

        {/* Info */}
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle" size={20} color="#6B7280" />
            <Text style={styles.infoText}>
              Your wallets are securely generated and managed. Each wallet has a
              unique deposit address for the selected network.
            </Text>
          </View>
        </Card>

        <View style={{ height: 32 }} />
      </ScrollView>
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
  },
  content: {
    flex: 1,
  },
  balanceCard: {
    margin: 16,
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#111827", // Charcoal
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#9CA3AF", // Gray 400
    opacity: 0.9,
    marginBottom: 8,
    fontFamily: 'Inter-Medium',
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
    fontFamily: 'PlayfairDisplay-Bold',
  },
  balanceSubtext: {
    fontSize: 14,
    color: "#D1D5DB", // Gray 300
    opacity: 0.9,
  },
  walletsList: {
    padding: 16,
    gap: 16,
  },
  walletCard: {
    marginBottom: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6", // Light Gray
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    padding: 16,
  },
  walletHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6", // Light Gray
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  walletInfo: {
    flex: 1,
  },
  walletCoin: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827", // Charcoal
    marginBottom: 2,
  },
  walletNetwork: {
    fontSize: 14,
    color: "#6B7280", // Gray
  },
  walletBalance: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827", // Charcoal
  },
  lockedBalance: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  availableBadge: {
    backgroundColor: "#F9FAFB", // Very Light Gray
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "flex-end",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  availableText: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  availableAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827", // Charcoal
  },
  addressContainer: {
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "monospace",
    color: "#111827",
    marginRight: 8,
  },
  walletActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionDivider: {
    width: 1,
    backgroundColor: "#E5E7EB",
  },
  actionText: {
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
    color: "#6B7280", // Gray
    marginTop: 8,
    textAlign: "center",
  },
  emptyWallets: {
    alignItems: "center",
    padding: 48,
  },
  emptyWalletsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 16,
  },
  emptyWalletsSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  createButton: {
    marginTop: 24,
    backgroundColor: "#111827",
  },
  createNewButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  infoCard: {
    marginHorizontal: 16,
    backgroundColor: "#F9FAFB", // Light Gray
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
  },
});
