import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { useAuthStore } from "../../store/auth-store";
import { useUserStore } from "../../store/user-store";
import { AddressType, UserAddress } from "../../types";
import { locationService } from "../../utils/location";

export default function AddressesScreen() {
  const router = useRouter();
  const { addresses, fetchAddresses, deleteAddress, setDefaultAddress, isLoading } =
    useUserStore();
  const { isAuthenticated } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

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

  const handleDelete = (id: string, fullName: string) => {
    Alert.alert(
      "Delete Address",
      `Delete ${fullName}'s address?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAddress(id);
              Alert.alert("Success", "Address deleted");
            } catch (error) {
              Alert.alert("Error", "Failed to delete address");
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
      Alert.alert("Success", "Default address updated");
    } catch (error) {
      Alert.alert("Error", "Failed to update default address");
    }
  };

  const handleEdit = (address: UserAddress) => {
    setEditingAddress(address);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setShowModal(true);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Addresses</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons name="location-outline" size={80} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>Login to manage addresses</Text>
          <Button
            title="Login"
            onPress={() => router.push("/auth/login")}
            style={styles.actionButton}
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
        <Text style={styles.headerTitle}>My Addresses</Text>
        <TouchableOpacity onPress={handleAddNew}>
          <Ionicons name="add-circle" size={28} color="#8b5cf6" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {addresses.length === 0 ? (
          <View style={styles.emptyAddresses}>
            <Ionicons name="location-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyAddressesTitle}>No addresses yet</Text>
            <Text style={styles.emptyAddressesSubtitle}>
              Add your shipping and billing addresses
            </Text>
            <Button
              title="Add Address"
              onPress={handleAddNew}
              style={styles.addButton}
              icon={<Ionicons name="add" size={20} color="#ffffff" />}
            />
          </View>
        ) : (
          <View style={styles.addressesList}>
            {addresses.map((address) => (
              <Card key={address.id} style={styles.addressCard}>
                {/* Header */}
                <View style={styles.addressHeader}>
                  <View style={styles.addressType}>
                    <Ionicons
                      name={
                        address.type === "SHIPPING"
                          ? "home"
                          : "card"
                      }
                      size={20}
                      color={address.type === "SHIPPING" ? "#8b5cf6" : "#3b82f6"}
                    />
                    <Text style={styles.typeText}>
                      {address.type}
                    </Text>
                  </View>

                  {address.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Ionicons name="star" size={14} color="#ffffff" />
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>

                {/* Details */}
                <View style={styles.addressDetails}>
                  <Text style={styles.fullName}>{address.fullName}</Text>
                  <Text style={styles.addressLine}>{address.addressLine1}</Text>
                  {address.addressLine2 && (
                    <Text style={styles.addressLine}>{address.addressLine2}</Text>
                  )}
                  <Text style={styles.addressLine}>
                    {address.city}
                    {address.state && `, ${address.state}`} {address.postalCode}
                  </Text>
                  <Text style={styles.addressLine}>{address.country}</Text>

                  <View style={styles.phoneRow}>
                    <Ionicons name="call" size={16} color="#6B7280" />
                    <Text style={styles.phone}>{address.phone}</Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.addressActions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleEdit(address)}
                  >
                    <Ionicons name="create-outline" size={20} color="#8b5cf6" />
                    <Text style={styles.actionBtnText}>Edit</Text>
                  </TouchableOpacity>

                  {!address.isDefault && (
                    <>
                      <View style={styles.actionDivider} />
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleSetDefault(address.id)}
                      >
                        <Ionicons name="star-outline" size={20} color="#fbbf24" />
                        <Text style={styles.actionBtnText}>Set Default</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  <View style={styles.actionDivider} />
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleDelete(address.id, address.fullName)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    <Text style={[styles.actionBtnText, { color: "#ef4444" }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}

        {addresses.length > 0 && (
          <Button
            title="Add New Address"
            onPress={handleAddNew}
            variant="outline"
            style={styles.addNewButton}
            icon={<Ionicons name="add" size={20} color="#111827" />}
          />
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Address Modal */}
      {showModal && (
        <AddressModal
          address={editingAddress}
          onClose={() => {
            setShowModal(false);
            setEditingAddress(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingAddress(null);
            loadAddresses();
          }}
        />
      )}
    </SafeAreaView>
  );
}

// Address Form Modal Component
function AddressModal({
  address,
  onClose,
  onSuccess,
}: {
  address: UserAddress | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { addAddress, updateAddress } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [loadingGPS, setLoadingGPS] = useState(false);

  const [formData, setFormData] = useState({
    type: (address?.type || "SHIPPING") as AddressType,
    fullName: address?.fullName || "",
    phone: address?.phone || "",
    addressLine1: address?.addressLine1 || "",
    addressLine2: address?.addressLine2 || "",
    city: address?.city || "",
    state: address?.state || "",
    postalCode: address?.postalCode || "",
    country: address?.country || "",
    isDefault: address?.isDefault || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleUseCurrentLocation = async () => {
    setLoadingGPS(true);
    try {
      const currentAddress = await locationService.getCurrentAddress();
      if (currentAddress) {
        setFormData({
          ...formData,
          addressLine1: currentAddress.street || formData.addressLine1,
          city: currentAddress.city || formData.city,
          state: currentAddress.state || formData.state,
          postalCode: currentAddress.postalCode || formData.postalCode,
          country: currentAddress.country || formData.country,
        });
        Alert.alert("Success", "Location detected successfully");
      } else {
        Alert.alert("Error", "Could not detect your location");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to get location");
    } finally {
      setLoadingGPS(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.addressLine1.trim())
      newErrors.addressLine1 = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.postalCode.trim())
      newErrors.postalCode = "Postal code is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      if (address) {
        await updateAddress(address.id, formData);
        Alert.alert("Success", "Address updated");
      } else {
        await addAddress(formData);
        Alert.alert("Success", "Address added");
      }
      onSuccess();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to save address"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {address ? "Edit Address" : "Add Address"}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalBody}>
          {/* GPS Button */}
          <Button
            title={loadingGPS ? "Detecting..." : "Use Current Location"}
            onPress={handleUseCurrentLocation}
            variant="outline"
            size="sm"
            loading={loadingGPS}
            icon={<Ionicons name="location" size={18} color="#8b5cf6" />}
            style={styles.gpsButton}
          />

          {/* Address Type */}
          <Text style={styles.label}>Address Type</Text>
          <View style={styles.typeButtons}>
            {(["SHIPPING", "BILLING"] as AddressType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  formData.type === type && styles.typeButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, type })}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    formData.type === type && styles.typeButtonTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Full Name"
            value={formData.fullName}
            onChangeText={(text) =>
              setFormData({ ...formData, fullName: text })
            }
            error={errors.fullName}
            placeholder="John Doe"
          />

          <Input
            label="Phone Number"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            error={errors.phone}
            placeholder="+1 234 567 8900"
            keyboardType="phone-pad"
          />

          <Input
            label="Address Line 1"
            value={formData.addressLine1}
            onChangeText={(text) =>
              setFormData({ ...formData, addressLine1: text })
            }
            error={errors.addressLine1}
            placeholder="123 Main Street"
          />

          <Input
            label="Address Line 2 (Optional)"
            value={formData.addressLine2}
            onChangeText={(text) =>
              setFormData({ ...formData, addressLine2: text })
            }
            placeholder="Apt, Suite, Building"
          />

          <Input
            label="City"
            value={formData.city}
            onChangeText={(text) => setFormData({ ...formData, city: text })}
            error={errors.city}
            placeholder="New York"
          />

          <Input
            label="State/Province (Optional)"
            value={formData.state}
            onChangeText={(text) => setFormData({ ...formData, state: text })}
            placeholder="NY"
          />

          <Input
            label="Postal Code"
            value={formData.postalCode}
            onChangeText={(text) =>
              setFormData({ ...formData, postalCode: text })
            }
            error={errors.postalCode}
            placeholder="10001"
          />

          <Input
            label="Country"
            value={formData.country}
            onChangeText={(text) =>
              setFormData({ ...formData, country: text })
            }
            error={errors.country}
            placeholder="United States"
          />
        </ScrollView>

        <View style={styles.modalFooter}>
          <Button
            title="Cancel"
            onPress={onClose}
            variant="outline"
            style={styles.modalButton}
          />
          <Button
            title={address ? "Update" : "Add"}
            onPress={handleSubmit}
            loading={loading}
            style={styles.modalButton}
          />
        </View>
      </View>
    </View>
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
  content: {
    flex: 1,
  },
  addressesList: {
    padding: 16,
    gap: 16,
  },
  addressCard: {
    marginBottom: 0,
    backgroundColor: "#FFFFFF",
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOpacity: 0.05,
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addressType: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    color: "#111827",
  },
  defaultBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  addressDetails: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  fullName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  addressLine: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  phone: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  addressActions: {
    flexDirection: "row",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  actionDivider: {
    width: 1,
    backgroundColor: "#E5E7EB",
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
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
  actionButton: {
    marginTop: 24,
  },
  emptyAddresses: {
    alignItems: "center",
    padding: 48,
  },
  emptyAddressesTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 16,
  },
  emptyAddressesSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  addButton: {
    marginTop: 24,
  },
  addNewButton: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  modalBody: {
    padding: 20,
  },
  gpsButton: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  typeButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  typeButtonActive: {
    backgroundColor: "#8b5cf6",
    borderColor: "#8b5cf6",
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  typeButtonTextActive: {
    color: "#ffffff",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
