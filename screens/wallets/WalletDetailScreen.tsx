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
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Wallet, Transaction } from "../../types";
import { NETWORK_DISPLAY_NAMES } from "../../api";
import api from "../../api";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";

export default function WalletDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (id) {
      loadWalletData();
    }
  }, [id]);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      // Load wallet and transactions
      const wallets = await api.getWallets();
      const foundWallet = wallets.find((w: Wallet) => w.id === id);
      setWallet(foundWallet || null);

      // Load transactions for this wallet
      // const txs = await api.getTransactions({ walletId: id as string });
      // setTransactions(txs);
    } catch (error) {
      console.error("Error loading wallet:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadWalletData();
  };

  const handleCopyAddress = async (address: string) => {
    await Clipboard.setStringAsync(address);
    Alert.alert("Success", "Address copied to clipboard");
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "DEPOSIT":
        return { name: "arrow-down", color: "#22c55e" };
      case "WITHDRAWAL":
        return { name: "arrow-up", color: "#ef4444" };
      case "PAYMENT":
        return { name: "cart", color: "#8b5cf6" };
      default:
        return { name: "swap-horizontal", color: "#6a6a6a" };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "#22c55e";
      case "PENDING":
        return "#f59e0b";
      case "FAILED":
        return "#ef4444";
      default:
        return "#6a6a6a";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wallet Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!wallet) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wallet Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#a0a0a0" />
          <Text style={styles.emptyText}>Wallet not found</Text>
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
        <Text style={styles.headerTitle}>
          {wallet.stablecoinType} Wallet
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Balance Card */}
        <Card style={styles.balanceCard}>
          <View style={styles.networkBadge}>
            <Text style={styles.networkText}>
              {NETWORK_DISPLAY_NAMES[wallet.network] || wallet.network}
            </Text>
          </View>

          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceValue}>
              {(parseFloat(wallet.balance) - parseFloat(wallet.lockedBalance || "0")).toFixed(2)} {wallet.stablecoinType}
            </Text>
          </View>

          {parseFloat(wallet.lockedBalance) > 0 && (
            <View style={styles.lockedInfo}>
              <Ionicons name="lock-closed" size={16} color="#6a6a6a" />
              <Text style={styles.lockedText}>
                {parseFloat(wallet.lockedBalance).toFixed(2)} {wallet.stablecoinType} locked
              </Text>
            </View>
          )}
        </Card>

        {/* QR Code */}
        <Card style={styles.qrCard}>
          <Text style={styles.qrLabel}>Deposit Address QR Code</Text>
          <View style={styles.qrContainer}>
            <QRCode
              value={wallet.depositAddress}
              size={200}
              backgroundColor="#ffffff"
            />
          </View>
        </Card>

        {/* Wallet Address */}
        <Card style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <Text style={styles.addressLabel}>Deposit Address</Text>
            <TouchableOpacity
              onPress={() => handleCopyAddress(wallet.depositAddress)}
              style={styles.copyButton}
            >
              <Ionicons name="copy-outline" size={20} color="#8b5cf6" />
              <Text style={styles.copyText}>Copy</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.addressText} selectable>
            {wallet.depositAddress}
          </Text>
        </Card>

        {/* Action Button */}
        <View style={styles.actionsContainer}>
          <Button
            title="Deposit"
            onPress={() => router.push(`/wallets/${wallet.id}/deposit`)}
            style={styles.actionButton}
            icon={<Ionicons name="arrow-down" size={20} color="#ffffff" />}
          />
        </View>

        {/* Transactions List */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>

          {transactions.length === 0 ? (
            <Card style={styles.emptyTransactions}>
              <Ionicons name="receipt-outline" size={48} color="#d5d5d5" />
              <Text style={styles.emptyTransactionsText}>
                No transactions yet
              </Text>
            </Card>
          ) : (
            <Card style={styles.transactionsList}>
              {transactions.map((tx, index) => {
                const icon = getTransactionIcon(tx.type);
                return (
                  <View
                    key={tx.id}
                    style={[
                      styles.transactionItem,
                      index < transactions.length - 1 && styles.transactionBorder,
                    ]}
                  >
                    <View style={styles.transactionLeft}>
                      <View
                        style={[
                          styles.transactionIcon,
                          { backgroundColor: icon.color + "20" },
                        ]}
                      >
                        <Ionicons name={icon.name as any} size={20} color={icon.color} />
                      </View>
                      <View style={styles.transactionInfo}>
                        <Text style={styles.transactionType}>
                          {tx.type.replace(/_/g, " ")}
                        </Text>
                        <Text style={styles.transactionDate}>
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.transactionRight}>
                      <Text
                        style={[
                          styles.transactionAmount,
                          {
                            color:
                              tx.type === "DEPOSIT"
                                ? "#22c55e"
                                : tx.type === "WITHDRAWAL"
                                ? "#ef4444"
                                : "#ffffff",
                          },
                        ]}
                      >
                        {tx.type === "DEPOSIT" ? "+" : "-"}
                        {parseFloat(tx.amount).toFixed(2)}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(tx.status) + "20" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: getStatusColor(tx.status) },
                          ]}
                        >
                          {tx.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </Card>
          )}
        </View>

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
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#ffffff",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginTop: 16,
  },
  content: {
    flex: 1,
  },
  balanceCard: {
    margin: 16,
    paddingVertical: 24,
  },
  networkBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#1e1e1e",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  networkText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#a0a0a0",
    textTransform: "uppercase",
  },
  balanceInfo: {
    alignItems: "center",
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#6a6a6a",
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
  },
  lockedInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  lockedText: {
    fontSize: 12,
    color: "#6a6a6a",
  },
  qrCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  qrLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 16,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  addressCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  copyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8b5cf6",
  },
  addressText: {
    fontSize: 12,
    color: "#6a6a6a",
    fontFamily: "monospace",
    lineHeight: 18,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
  },
  transactionsSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 12,
  },
  emptyTransactions: {
    alignItems: "center",
    paddingVertical: 48,
    backgroundColor: "#1a1a1a",
  },
  emptyTransactionsText: {
    fontSize: 14,
    color: "#a0a0a0",
    marginTop: 12,
  },
  transactionsList: {
    padding: 0,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  transactionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 2,
    textTransform: "capitalize",
  },
  transactionDate: {
    fontSize: 12,
    color: "#6a6a6a",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
});
