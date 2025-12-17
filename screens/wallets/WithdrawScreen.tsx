import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api, { NETWORK_DISPLAY_NAMES } from "../../api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Wallet } from "../../types";

export default function WithdrawScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleWithdraw = async () => {
    if (!address || !amount) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
        // Implement withdraw API call here
        setIsSubmitting(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        Alert.alert("Success", "Withdrawal initiated successfully", [
            { text: "OK", onPress: () => router.back() }
        ]);
    } catch (error) {
        Alert.alert("Error", "Failed to initiate withdrawal");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Withdraw</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#111827" />
        </View>
      </SafeAreaView>
    );
  }

  if (!wallet) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Withdraw</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyText}>Wallet not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Withdraw {wallet.stablecoinType}</Text>
            <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content}>
            {/* Balance Card */}
            <Card style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceValue}>
                    {parseFloat(wallet.balance).toFixed(2)} {wallet.stablecoinType}
                </Text>
                <View style={styles.networkBadge}>
                    <Ionicons name="git-network" size={16} color="#4B5563" />
                    <Text style={styles.networkText}>
                        {NETWORK_DISPLAY_NAMES[wallet.network] || wallet.network}
                    </Text>
                </View>
            </Card>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Recipient Address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter wallet address"
                        placeholderTextColor="#9CA3AF"
                        value={address}
                        onChangeText={setAddress}
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Amount</Text>
                    <View style={styles.amountInputContainer}>
                        <TextInput
                            style={styles.amountInput}
                            placeholder="0.00"
                            placeholderTextColor="#9CA3AF"
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="decimal-pad"
                        />
                        <Text style={styles.currencySuffix}>{wallet.stablecoinType}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setAmount(wallet.balance)}>
                        <Text style={styles.maxText}>Max: {parseFloat(wallet.balance)}</Text>
                    </TouchableOpacity>
                </View>

                <Card style={styles.warningCard}>
                    <View style={styles.warningHeader}>
                        <Ionicons name="warning" size={20} color="#F59E0B" />
                        <Text style={styles.warningTitle}>Important</Text>
                    </View>
                    <Text style={styles.warningText}>
                        • Ensure the recipient address is correct. Transactions cannot be reversed.
                    </Text>
                    <Text style={styles.warningText}>
                        • Only available for {NETWORK_DISPLAY_NAMES[wallet.network]} network.
                    </Text>
                </Card>

                <Button
                    title="Preview Withdrawal"
                    onPress={handleWithdraw}
                    loading={isSubmitting}
                    style={styles.withdrawButton}
                />
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
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
  balanceCard: {
    padding: 16,
    marginBottom: 24,
    backgroundColor: "#F3F4F6", // Light Gray
    borderWidth: 0,
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  networkBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  networkText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#111827",
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  currencySuffix: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
    marginLeft: 8,
  },
  maxText: {
    fontSize: 12,
    color: "#8B5CF6", // Primary Purple
    fontWeight: "600",
    alignSelf: "flex-end",
  },
  warningCard: {
    backgroundColor: "#FFFBEB", // Amber 50
    borderColor: "#FCD34D", // Amber 300
    marginTop: 8,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#B45309",
  },
  warningText: {
    fontSize: 12,
    color: "#92400E",
    marginBottom: 4,
    lineHeight: 18,
  },
  withdrawButton: {
    marginTop: 8,
  },
});
