import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import api, { NETWORK_DISPLAY_NAMES } from "../../api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Wallet } from "../../types";

export default function DepositScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadWallet();
    }
  }, [id]);

  const loadWallet = async () => {
    try {
      const wallets = await api.getWallets();
      const foundWallet = wallets.find((w: Wallet) => w.id === id);
      setWallet(foundWallet || null);
    } catch (error) {
      console.error("Error loading wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = async (address: string) => {
    await Clipboard.setStringAsync(address);
    Alert.alert("Success", "Address copied to clipboard");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Deposit</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
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
          <Text style={styles.headerTitle}>Deposit</Text>
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
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deposit {wallet.stablecoinType}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Instructions Card */}
        <Card style={styles.instructionsCard}>
          <View style={styles.instructionHeader}>
            <Ionicons name="information-circle" size={24} color="#166534" />
            <Text style={styles.instructionTitle}>How to Deposit</Text>
          </View>
          <Text style={styles.instructionText}>
            1. Copy your wallet address below
          </Text>
          <Text style={styles.instructionText}>
            2. Send {wallet.stablecoinType} from your external wallet
          </Text>
          <Text style={styles.instructionText}>
            3. Funds will appear after network confirmation
          </Text>
        </Card>

        {/* Network Info */}
        <Card style={styles.networkCard}>
          <Text style={styles.networkLabel}>Network</Text>
          <View style={styles.networkBadge}>
            <Ionicons name="git-network" size={16} color="#111827" />
            <Text style={styles.networkText}>
              {NETWORK_DISPLAY_NAMES[wallet.network] || wallet.network}
            </Text>
          </View>
          <Text style={styles.networkWarning}>
            ⚠️ Only send {wallet.stablecoinType} on {NETWORK_DISPLAY_NAMES[wallet.network]} network
          </Text>
        </Card>

        {/* QR Code Card */}
        <Card style={styles.qrCard}>
          <Text style={styles.qrLabel}>Scan QR Code</Text>
          <View style={styles.qrContainer}>
            <QRCode value={wallet.depositAddress} size={200} backgroundColor="#ffffff" />
          </View>
        </Card>

        {/* Address Card */}
        <Card style={styles.addressCard}>
          <Text style={styles.addressLabel}>Your Deposit Address</Text>
          <View style={styles.addressBox}>
            <Text style={styles.addressText} selectable>
              {wallet.depositAddress}
            </Text>
          </View>
          <Button
            title="Copy Address"
            onPress={() => handleCopyAddress(wallet.depositAddress)}
            variant="outline"
            icon={<Ionicons name="copy-outline" size={20} color="#8b5cf6" />}
          />
        </Card>

        {/* Warning Card */}
        <Card style={styles.warningCard}>
          <View style={styles.warningHeader}>
            <Ionicons name="warning" size={20} color="#f59e0b" />
            <Text style={styles.warningTitle}>Important</Text>
          </View>
          <Text style={styles.warningText}>
            • Only send {wallet.stablecoinType} to this address
          </Text>
          <Text style={styles.warningText}>
            • Sending other tokens may result in permanent loss
          </Text>
          <Text style={styles.warningText}>
            • Always verify the network before sending
          </Text>
          <Text style={styles.warningText}>
            • Deposits are automatically detected and credited
          </Text>
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
    fontSize: 18,
    fontWeight: "700",
    color: "#111827", // Charcoal
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    color: "#111827",
    marginTop: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  instructionsCard: {
    marginBottom: 16,
    backgroundColor: "#F0FDF4", // Green 50
    borderWidth: 1,
    borderColor: "#86EFAC", // Green 300
    borderRadius: 12,
    padding: 16,
  },
  instructionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#166534", // Green 800
  },
  instructionText: {
    fontSize: 14,
    color: "#15803D", // Green 700
    marginBottom: 8,
  },
  networkCard: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
  },
  networkLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  networkBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  networkText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  networkWarning: {
    fontSize: 12,
    color: "#F59E0B", // Amber 500
    fontWeight: "600",
  },
  qrCard: {
    marginBottom: 16,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
  },
  qrLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  addressCard: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  addressBox: {
    backgroundColor: "#F9FAFB", // Light Gray
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  addressText: {
    fontSize: 12,
    color: "#111827",
    fontFamily: "monospace",
    lineHeight: 18,
  },
  warningCard: {
    marginBottom: 16,
    backgroundColor: "#FFFBEB", // Amber 50
    borderWidth: 1,
    borderColor: "#FCD34D", // Amber 300
    borderRadius: 12,
    padding: 16,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#B45309", // Amber 700
  },
  warningText: {
    fontSize: 12,
    color: "#92400E", // Amber 800
    marginBottom: 6,
    lineHeight: 18,
  },
});
