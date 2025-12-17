import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopBar } from "../../components/navigation/TopBar";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useAuthStore } from "../../store/auth-store";
import { useUserStore } from "../../store/user-store";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { profile, fetchProfile, error: profileError, isLoading: profileLoading } = useUserStore();
  const [isHydrating, setIsHydrating] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for Zustand to hydrate from AsyncStorage
    const timer = setTimeout(() => {
      setIsHydrating(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated && !isHydrating) {
      loadProfileData();
    }
  }, [isAuthenticated, isHydrating]);

  const loadProfileData = async () => {
    try {
      setFetchError(null);
      await fetchProfile();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to load profile data";
      setFetchError(errorMsg);
      console.error("Profile fetch error:", error);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/");
        },
      },
    ]);
  };

  // Show loading while hydrating
  if (isHydrating) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <TopBar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#111827" />
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <TopBar />

        <View style={styles.emptyContainer}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={48} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>Not logged in</Text>
          <Text style={styles.emptySubtitle}>
            Login to access your profile and settings
          </Text>
          <Button
            title="Login"
            onPress={() => router.push("/auth/login")}
            style={styles.loginButton}
            icon={<Ionicons name="log-in" size={20} color="#ffffff" />}
          />
          <Button
            title="Browse as Guest"
            onPress={() => router.push("/")}
            variant="outline"
            style={styles.guestButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const displayUser = profile || user;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TopBar />

      {/* Show error message if profile fetch failed */}
      {fetchError && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning" size={20} color="#ef4444" />
          <Text style={styles.errorText}>{fetchError}</Text>
          <TouchableOpacity onPress={loadProfileData} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.content}>
        {/* Profile Info */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#111827" />
            </View>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {displayUser?.email?.split("@")[0] || "User"}
            </Text>
            <Text style={styles.userEmail}>{displayUser?.email}</Text>
            <Text style={styles.userPhone}>
              {displayUser?.countryCode} {displayUser?.phoneNumber}
            </Text>
          </View>

          {/* Status Badges */}
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Ionicons name="shield-checkmark" size={16} color="#22c55e" />
              <Text style={styles.badgeText}>{displayUser?.status}</Text>
            </View>
            {displayUser?.kycStatus && displayUser.kycStatus !== "NOT_STARTED" && (
              <View style={styles.badge}>
                <Ionicons name="document-text" size={16} color="#3b82f6" />
                <Text style={styles.badgeText}>
                  KYC: {displayUser.kycStatus}
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>

          <Card style={styles.menuCard}>
            <MenuItem
              icon="wallet-outline"
              title="My Wallets"
              subtitle="Manage your stablecoin wallets"
              onPress={() => router.push("/wallets")}
            />
            <Divider />
            <MenuItem
              icon="location-outline"
              title="Addresses"
              subtitle="Manage shipping & billing addresses"
              onPress={() => router.push("/addresses")}
            />
            <Divider />
            <MenuItem
              icon="receipt-outline"
              title="My Orders"
              subtitle="View order history and tracking"
              onPress={() => router.push("/orders")}
            />
            <Divider />
            <MenuItem
              icon="heart-outline"
              title="Favorites"
              subtitle="View your wishlist"
              onPress={() => router.push("/favorites")}
            />
          </Card>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <Card style={styles.menuCard}>
            <MenuItem
              icon="notifications-outline"
              title="Notifications"
              subtitle="Manage notification preferences"
              onPress={() => Alert.alert("Coming Soon", "Notification settings")}
            />
            <Divider />
            <MenuItem
              icon="shield-outline"
              title="Security"
              subtitle="Password and security settings"
              onPress={() => Alert.alert("Coming Soon", "Security settings")}
            />
            <Divider />
            <MenuItem
              icon="help-circle-outline"
              title="Help & Support"
              subtitle="Get help and contact support"
              onPress={() => Alert.alert("Coming Soon", "Help center")}
            />
            <Divider />
            <MenuItem
              icon="information-circle-outline"
              title="About"
              subtitle="App version and information"
              onPress={() =>
                Alert.alert("0xMart", "Version 1.0.0\n\nShop with Stablecoins")
              }
            />
          </Card>
        </View>

        {/* Logout Button */}
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          style={styles.logoutButton}
          icon={<Ionicons name="log-out-outline" size={20} color="#ffffff" />}
        />

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// MenuItem Component
function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={24} color="#111827" />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

// Divider Component
function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // White
  },
  content: {
    flex: 1,
  },
  profileCard: {
    margin: 16,
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1, // Softer shadow
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6", // Light Gray
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  userInfo: {
    alignItems: "center",
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827", // Charcoal
    marginBottom: 4,
    fontFamily: 'PlayfairDisplay-Bold',
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280", // Gray
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  userPhone: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: 'Inter-Regular',
  },
  badges: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F9FAFB", // Very Light Gray
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280", // Gray
    textTransform: "uppercase",
    marginLeft: 16,
    marginBottom: 12,
    fontFamily: 'Inter-Medium',
  },
  menuCard: {
    marginHorizontal: 16,
    padding: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6", // Light Gray
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827", // Charcoal
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginLeft: 68,
  },
  logoutButton: {
    marginHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: "#FFFFFF",
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  loginButton: {
    width: "100%",
    marginBottom: 12,
    backgroundColor: "#111827",
  },
  guestButton: {
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2", // Red 50
    borderLeftWidth: 3,
    borderLeftColor: "#EF4444",
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: "#B91C1C", // Red 700
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
  },
  retryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },
});
