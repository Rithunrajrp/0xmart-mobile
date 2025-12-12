import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { NetworkType, StablecoinType } from "../../types";
import { NETWORK_DISPLAY_NAMES } from "../../api";
import api from "../../api";
import { useUserStore } from "../../store/user-store";
import { useAuthStore } from "../../store/auth-store";
import {
  L2_NETWORKS,
  NETWORK_CONFIG,
  isStablecoinSupportedOnNetwork,
  getStablecoinsForNetwork,
  getAllStablecoins,
} from "../../utils/network-config";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mobile apps can ONLY create wallets on L2 networks (lower gas fees)
const NETWORKS: NetworkType[] = L2_NETWORKS;
const STABLECOINS: StablecoinType[] = getAllStablecoins();

export default function CreateWalletScreen() {
  const router = useRouter();
  const { fetchWallets } = useUserStore();
  const { logout } = useAuthStore();
  const [selectedStablecoin, setSelectedStablecoin] = useState<StablecoinType>("USDT");
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>("POLYGON");
  const [creating, setCreating] = useState(false);

  // Debug function to check auth status
  const checkAuthStatus = async () => {
    const accessToken = await AsyncStorage.getItem("accessToken");
    const refreshToken = await AsyncStorage.getItem("refreshToken");
    console.log("=== AUTH DEBUG ===");
    console.log("Access Token exists:", !!accessToken);
    console.log("Refresh Token exists:", !!refreshToken);
    Alert.alert(
      "Auth Status",
      `Access Token: ${accessToken ? "✓ Exists" : "✗ Missing"}\nRefresh Token: ${refreshToken ? "✓ Exists" : "✗ Missing"}`
    );
  };

  // Check if selected stablecoin is supported on selected network
  const isCurrentSelectionValid = isStablecoinSupportedOnNetwork(
    selectedStablecoin,
    selectedNetwork
  );

  // Get available stablecoins for current network
  const availableStablecoins = getStablecoinsForNetwork(selectedNetwork);

  // Auto-adjust stablecoin when network changes if current coin not supported
  const handleNetworkChange = (network: NetworkType) => {
    setSelectedNetwork(network);
    const available = getStablecoinsForNetwork(network);
    if (!available.includes(selectedStablecoin)) {
      setSelectedStablecoin(available[0] || "USDT");
    }
  };

  const handleCreateWallet = async () => {
    // Validate before proceeding
    if (!isCurrentSelectionValid) {
      Alert.alert(
        "Invalid Selection",
        `${selectedStablecoin} is not supported on ${NETWORK_CONFIG[selectedNetwork].name}. Please select a different combination.`
      );
      return;
    }
    Alert.alert(
      "Create Wallet",
      `Create a new ${selectedStablecoin} wallet on ${NETWORK_DISPLAY_NAMES[selectedNetwork]}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Create",
          onPress: async () => {
            try {
              setCreating(true);
              console.log("Creating wallet:", selectedStablecoin, selectedNetwork);
              await api.createWallet(selectedStablecoin, selectedNetwork);
              console.log("Wallet created successfully");

              // Refresh wallets list
              await fetchWallets();
              console.log("Wallets refreshed");

              Alert.alert("Success", "Wallet created successfully", [
                {
                  text: "OK",
                  onPress: () => router.back(),
                },
              ]);
            } catch (error: any) {
              console.error("Error creating wallet:", error);
              console.error("Error response:", error.response?.data);

              // Handle 401 specifically
              if (error.response?.status === 401) {
                Alert.alert(
                  "Session Expired",
                  "Your session has expired. Please log in again.",
                  [
                    {
                      text: "Check Auth",
                      onPress: checkAuthStatus,
                    },
                    {
                      text: "Re-login",
                      onPress: async () => {
                        await logout();
                        router.replace("/auth/login");
                      },
                    },
                  ]
                );
              } else {
                Alert.alert(
                  "Error",
                  error.response?.data?.message || error.message || "Failed to create wallet"
                );
              }
            } finally {
              setCreating(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Wallet</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color="#8b5cf6" />
            <Text style={styles.infoTitle}>Create a New Wallet</Text>
          </View>
          <Text style={styles.infoText}>
            Select a stablecoin and network to create a new wallet. You can create
            multiple wallets for different stablecoins and networks.
          </Text>
        </Card>

        {/* Stablecoin Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Stablecoin</Text>
          <View style={styles.optionsGrid}>
            {STABLECOINS.map((coin) => {
              const isSupported = availableStablecoins.includes(coin);
              return (
                <TouchableOpacity
                  key={coin}
                  style={[
                    styles.optionCard,
                    selectedStablecoin === coin && styles.optionCardSelected,
                    !isSupported && styles.optionCardDisabled,
                  ]}
                  onPress={() => isSupported && setSelectedStablecoin(coin)}
                  disabled={!isSupported}
                >
                  <View style={styles.optionContent}>
                    {selectedStablecoin === coin && isSupported && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#8b5cf6"
                        style={styles.optionCheck}
                      />
                    )}
                    <View style={[styles.coinIcon, !isSupported && styles.coinIconDisabled]}>
                      <Text style={styles.coinIconText}>{coin[0]}</Text>
                    </View>
                    <Text style={[styles.optionText, !isSupported && styles.optionTextDisabled]}>
                      {coin}
                    </Text>
                    {!isSupported && (
                      <Text style={styles.notSupportedText}>Not available</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Network Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Select Network</Text>
            <View style={styles.l2Badge}>
              <Text style={styles.l2BadgeText}>L2 ONLY</Text>
            </View>
          </View>
          <Card style={styles.l2InfoCard}>
            <Text style={styles.l2InfoText}>
              🚀 Mobile wallets are limited to Layer 2 (L2) networks for faster transactions and
              lower fees
            </Text>
          </Card>
          <View style={styles.networkList}>
            {NETWORKS.map((network) => (
              <TouchableOpacity
                key={network}
                style={[
                  styles.networkCard,
                  selectedNetwork === network && styles.networkCardSelected,
                ]}
                onPress={() => handleNetworkChange(network)}
              >
                <View style={styles.networkContent}>
                  <View style={styles.networkInfo}>
                    <Ionicons
                      name="git-network"
                      size={20}
                      color={selectedNetwork === network ? "#8b5cf6" : "#6a6a6a"}
                    />
                    <View>
                      <Text
                        style={[
                          styles.networkName,
                          selectedNetwork === network && styles.networkNameSelected,
                        ]}
                      >
                        {NETWORK_CONFIG[network].name}
                      </Text>
                      <Text style={styles.networkDescription}>
                        {NETWORK_CONFIG[network].description}
                      </Text>
                    </View>
                  </View>
                  {selectedNetwork === network && (
                    <Ionicons name="checkmark-circle" size={24} color="#8b5cf6" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Wallet Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Stablecoin</Text>
            <Text style={styles.summaryValue}>{selectedStablecoin}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Network</Text>
            <Text style={styles.summaryValue}>
              {NETWORK_DISPLAY_NAMES[selectedNetwork] || selectedNetwork}
            </Text>
          </View>
        </Card>

        {/* Important Notes */}
        <Card style={styles.notesCard}>
          <View style={styles.notesHeader}>
            <Ionicons name="shield-checkmark" size={20} color="#22c55e" />
            <Text style={styles.notesTitle}>Important</Text>
          </View>
          <Text style={styles.noteText}>
            • Your wallet will be generated securely
          </Text>
          <Text style={styles.noteText}>
            • Keep your private keys safe and never share them
          </Text>
          <Text style={styles.noteText}>
            • You can deposit funds immediately after creation
          </Text>
          <Text style={styles.noteText}>
            • Wallet creation is free, you only pay network fees for transactions
          </Text>
        </Card>

        {/* Create Button */}
        <Button
          title="Create Wallet"
          onPress={handleCreateWallet}
          loading={creating}
          disabled={creating}
          icon={<Ionicons name="add-circle" size={20} color="#ffffff" />}
          style={styles.createButton}
        />

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
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    marginBottom: 24,
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  infoText: {
    fontSize: 14,
    color: "#a0a0a0",
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  l2Badge: {
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  l2BadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  l2InfoCard: {
    marginBottom: 12,
    backgroundColor: "#1e1e3e",
    borderWidth: 1,
    borderColor: "#8b5cf6",
  },
  l2InfoText: {
    fontSize: 12,
    color: "#c4b5fd",
    lineHeight: 18,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  optionCard: {
    width: "48%",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#2a2a2a",
  },
  optionCardSelected: {
    borderColor: "#8b5cf6",
    backgroundColor: "#1e1e1e",
  },
  optionCardDisabled: {
    opacity: 0.4,
    backgroundColor: "#1a1a1a",
  },
  optionContent: {
    alignItems: "center",
    position: "relative",
  },
  optionCheck: {
    position: "absolute",
    top: -8,
    right: -8,
  },
  coinIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#8b5cf6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  coinIconText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  coinIconDisabled: {
    backgroundColor: "#4a4a4a",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  optionTextDisabled: {
    color: "#6a6a6a",
  },
  notSupportedText: {
    fontSize: 10,
    color: "#6a6a6a",
    marginTop: 4,
  },
  networkList: {
    gap: 8,
  },
  networkCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#2a2a2a",
  },
  networkCardSelected: {
    borderColor: "#8b5cf6",
    backgroundColor: "#1e1e1e",
  },
  networkContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  networkInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  networkName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  networkNameSelected: {
    color: "#ffffff",
  },
  networkDescription: {
    fontSize: 12,
    color: "#6a6a6a",
    marginTop: 2,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#a0a0a0",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  divider: {
    height: 1,
    backgroundColor: "#2a2a2a",
    marginVertical: 8,
  },
  notesCard: {
    marginBottom: 16,
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  noteText: {
    fontSize: 12,
    color: "#a0a0a0",
    marginBottom: 6,
    lineHeight: 18,
  },
  createButton: {
    marginBottom: 16,
  },
});
