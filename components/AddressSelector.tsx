import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { useUserStore } from "../store/user-store";
import { useAuthStore } from "../store/auth-store";
import { UserAddress } from "../types";

interface AddressSelectorProps {
  selectedAddressId?: string;
  onSelect: (address: UserAddress) => void;
  addressType?: "SHIPPING" | "BILLING";
  title?: string;
}

export function AddressSelector({
  selectedAddressId,
  onSelect,
  addressType,
  title = "Select Delivery Address",
}: AddressSelectorProps) {
  const router = useRouter();
  const { addresses, fetchAddresses, isLoading } = useUserStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      loadAddresses();
    }
  }, [isAuthenticated]);

  const loadAddresses = async () => {
    try {
      await fetchAddresses();
    } catch (error) {
      console.error("Error loading addresses:", error);
    }
  };

  // Filter addresses by type if specified
  const filteredAddresses = addressType
    ? addresses.filter((addr) => addr.type === addressType)
    : addresses;

  // Auto-select default address if no address selected
  useEffect(() => {
    if (filteredAddresses.length > 0 && !selectedAddressId) {
      const defaultAddress = filteredAddresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        onSelect(defaultAddress);
      } else {
        onSelect(filteredAddresses[0]);
      }
    }
  }, [filteredAddresses, selectedAddressId]);

  if (!isAuthenticated) {
    return (
      <Card style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="location-outline" size={48} color="#6a6a6a" />
          <Text style={styles.emptyTitle}>Login to continue</Text>
          <Text style={styles.emptySubtitle}>
            Please login to select a delivery address
          </Text>
          <Button
            title="Login"
            onPress={() => router.push("/auth/login")}
            style={styles.loginButton}
          />
        </View>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      </Card>
    );
  }

  if (filteredAddresses.length === 0) {
    return (
      <Card style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="location-outline" size={48} color="#6a6a6a" />
          <Text style={styles.emptyTitle}>No addresses found</Text>
          <Text style={styles.emptySubtitle}>
            Add a delivery address to continue
          </Text>
          <Button
            title="Add Address"
            onPress={() => router.push("/addresses")}
            icon={<Ionicons name="add" size={20} color="#ffffff" />}
            style={styles.addButton}
          />
        </View>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          onPress={() => router.push("/addresses")}
          style={styles.manageButton}
        >
          <Text style={styles.manageButtonText}>Manage</Text>
          <Ionicons name="chevron-forward" size={18} color="#8b5cf6" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredAddresses.map((address) => {
          const isSelected = address.id === selectedAddressId;
          return (
            <TouchableOpacity
              key={address.id}
              onPress={() => onSelect(address)}
              activeOpacity={0.7}
            >
              <Card
                style={[
                  styles.addressCard,
                  isSelected && styles.addressCardSelected,
                ]}
              >
                {/* Header */}
                <View style={styles.addressHeader}>
                  <View style={styles.addressType}>
                    <Ionicons
                      name={address.type === "SHIPPING" ? "home" : "card"}
                      size={16}
                      color={
                        isSelected
                          ? "#8b5cf6"
                          : address.type === "SHIPPING"
                          ? "#8b5cf6"
                          : "#3b82f6"
                      }
                    />
                    <Text
                      style={[
                        styles.typeText,
                        isSelected && styles.typeTextSelected,
                      ]}
                    >
                      {address.type}
                    </Text>
                  </View>

                  {address.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Ionicons name="star" size={12} color="#ffffff" />
                    </View>
                  )}

                  {isSelected && (
                    <View style={styles.selectedBadge}>
                      <Ionicons name="checkmark-circle" size={20} color="#8b5cf6" />
                    </View>
                  )}
                </View>

                {/* Details */}
                <View style={styles.addressDetails}>
                  <Text
                    style={[
                      styles.fullName,
                      isSelected && styles.fullNameSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {address.fullName}
                  </Text>
                  <Text
                    style={[
                      styles.addressLine,
                      isSelected && styles.addressLineSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {address.addressLine1}
                  </Text>
                  <Text
                    style={[
                      styles.addressLine,
                      isSelected && styles.addressLineSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {address.city}, {address.state} {address.postalCode}
                  </Text>
                  <View style={styles.phoneRow}>
                    <Ionicons
                      name="call"
                      size={12}
                      color={isSelected ? "#8b5cf6" : "#a0a0a0"}
                    />
                    <Text
                      style={[
                        styles.phone,
                        isSelected && styles.phoneSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {address.phone}
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  manageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8b5cf6",
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 12,
  },
  addressCard: {
    width: 260,
    padding: 16,
    backgroundColor: "#1a1a1a",
    borderWidth: 2,
    borderColor: "#2a2a2a",
  },
  addressCardSelected: {
    borderColor: "#8b5cf6",
    backgroundColor: "#1e1a2e",
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  addressType: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#a0a0a0",
    textTransform: "uppercase",
  },
  typeTextSelected: {
    color: "#8b5cf6",
  },
  defaultBadge: {
    backgroundColor: "#8b5cf6",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedBadge: {
    marginLeft: "auto",
  },
  addressDetails: {
    gap: 4,
  },
  fullName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  fullNameSelected: {
    color: "#ffffff",
  },
  addressLine: {
    fontSize: 13,
    color: "#a0a0a0",
  },
  addressLineSelected: {
    color: "#c7b9e3",
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  phone: {
    fontSize: 12,
    color: "#a0a0a0",
    fontWeight: "500",
  },
  phoneSelected: {
    color: "#8b5cf6",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#a0a0a0",
    marginTop: 8,
    textAlign: "center",
  },
  loginButton: {
    marginTop: 20,
  },
  addButton: {
    marginTop: 20,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#a0a0a0",
  },
});
