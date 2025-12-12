import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useUserStore } from "../../store/user-store";
import { useAuthStore } from "../../store/auth-store";
import { Wallet } from "../../types";
import { NETWORK_DISPLAY_NAMES } from "../../api";
import * as Clipboard from "expo-clipboard";

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
        <Text style={styles.headerTitle}>My Wallets</Text>
        <TouchableOpacity onPress={() => router.push("/wallets/create")}>
          <Ionicons name="add-circle" size={28} color="#8b5cf6" />
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
            <Ionicons name="wallet-outline" size={64} color="#6a6a6a" />
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
                        <Ionicons name="wallet" size={24} color="#ffffff" />
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
                          <Ionicons name="copy-outline" size={20} color="#8b5cf6" />
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
            <Ionicons name="information-circle" size={20} color="#8b5cf6" />
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
  },
  content: {
    flex: 1,
  },
  balanceCard: {
    margin: 16,
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#8b5cf6",
  },
  balanceLabel: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.9,
  },
  walletsList: {
    padding: 16,
    gap: 16,
  },
  walletCard: {
    marginBottom: 0,
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
    backgroundColor: "#8b5cf6",
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
    color: "#ffffff",
    marginBottom: 2,
  },
  walletNetwork: {
    fontSize: 14,
    color: "#a0a0a0",
  },
  walletBalance: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
  },
  lockedBalance: {
    fontSize: 12,
    color: "#a0a0a0",
    marginTop: 4,
  },
  availableBadge: {
    backgroundColor: "#1e1e1e",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "flex-end",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  availableText: {
    fontSize: 12,
    color: "#a0a0a0",
    marginBottom: 2,
  },
  availableAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  addressContainer: {
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 12,
    color: "#a0a0a0",
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121212",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "monospace",
    color: "#ffffff",
    marginRight: 8,
  },
  walletActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
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
    backgroundColor: "#2a2a2a",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
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
  emptyWallets: {
    alignItems: "center",
    padding: 48,
  },
  emptyWalletsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 16,
  },
  emptyWalletsSubtitle: {
    fontSize: 14,
    color: "#a0a0a0",
    marginTop: 8,
    textAlign: "center",
  },
  createButton: {
    marginTop: 24,
  },
  createNewButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  infoCard: {
    marginHorizontal: 16,
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#a0a0a0",
    lineHeight: 18,
  },
});
