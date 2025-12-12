import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Wallet } from "../../types";
import { NETWORK_DISPLAY_NAMES } from "../../api";
import api from "../../api";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";

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
          <Ionicons name="arrow-back" size={24} color="#0a0a0a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deposit {wallet.stablecoinType}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Instructions Card */}
        <Card style={styles.instructionsCard}>
          <View style={styles.instructionHeader}>
            <Ionicons name="information-circle" size={24} color="#8b5cf6" />
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
            <Ionicons name="git-network" size={16} color="#a0a0a0" />
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
    padding: 16,
  },
  instructionsCard: {
    marginBottom: 16,
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#2a2a2a",
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
    color: "#ffffff",
  },
  instructionText: {
    fontSize: 14,
    color: "#a0a0a0",
    marginBottom: 8,
  },
  networkCard: {
    marginBottom: 16,
  },
  networkLabel: {
    fontSize: 14,
    color: "#6a6a6a",
    marginBottom: 8,
  },
  networkBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1e1e1e",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  networkText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#a0a0a0",
  },
  networkWarning: {
    fontSize: 12,
    color: "#f59e0b",
    fontWeight: "600",
  },
  qrCard: {
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
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 12,
  },
  addressBox: {
    backgroundColor: "#121212",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  addressText: {
    fontSize: 12,
    color: "#ffffff",
    fontFamily: "monospace",
    lineHeight: 18,
  },
  warningCard: {
    marginBottom: 16,
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#f59e0b",
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
    color: "#ffffff",
  },
  warningText: {
    fontSize: 12,
    color: "#a0a0a0",
    marginBottom: 6,
    lineHeight: 18,
  },
});
