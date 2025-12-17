import { Ionicons } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import React, { useState } from "react";
import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useCartStore } from "../../store/cart-store";

interface TopBarProps {
  hideSearch?: boolean;
}

export function TopBar({ hideSearch }: TopBarProps) {
  const router = useRouter();
  const segments = useSegments();
  const { getItemCount } = useCartStore();
  const [searchQuery, setSearchQuery] = useState("");
  const cartItemCount = getItemCount();

  // Auto-detect if we should hide search based on current route
  const currentRoute = segments[segments.length - 1];
  const shouldHideSearch = hideSearch ||
    currentRoute === 'profile' ||
    currentRoute === 'reward' ||
    currentRoute === 'rewards' ||
    segments[0] === 'auth' ||
    segments[0] === 'orders' ||
    segments[0] === 'wallets' ||
    segments[0] === 'addresses' ||
    currentRoute === 'checkout';

  // const handleSearch = () => {
  //   if (searchQuery.trim()) {
  //     // Navigate to search results or trigger search
  //     console.log("Search:", searchQuery);
  //     setSearchVisible(false);
  //   }
  // };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <View style={styles.container}>
        {/* Logo */}
        <TouchableOpacity onPress={() => router.push("/")}>
          <Image
            source={{
              uri: "https://ik.imagekit.io/bgvtzewqf/0xmart/OXMART-3.png",
            }}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Right Icons */}
        <View style={styles.rightIcons}>
          {/* Search
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setSearchVisible(true)}
          >
            <Ionicons name="search" size={24} color="#ffffff" />
          </TouchableOpacity> */}

          {/* Favorites */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/favorites")}
          >
            <Ionicons name="heart-outline" size={24} color="#ffffff" />
          </TouchableOpacity>

          {/* Cart */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/cart")}
          >
            <Ionicons name="cart-outline" size={24} color="#ffffff" />
            {cartItemCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      {/* Search Bar - Only show on shop-related screens */}
      {!shouldHideSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#4B5563" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#4B5563" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Search Modal */}
      {/* <Modal
        visible={searchVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSearchVisible(false)}
      >
        <View style={styles.searchModal}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#a0a0a0" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#6a6a6a"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              autoFocus
            />
            <TouchableOpacity onPress={() => setSearchVisible(false)}>
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal> */}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#111827", // Charcoal Black for Logo visibility
    borderBottomWidth: 0, // Semantic header
    // borderBottomColor: "#2a2a2a",
  },
  logo: {
    width: 100,
    height: 32,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconButton: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: "#111827", // Match header bg
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
  searchModal: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "flex-start",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827", // Dark Text
    fontFamily: 'Inter-Regular',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20, // Increased space below search bar
    backgroundColor: "#FFFFFF", // White background for the search strip
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6", // Light Gray input
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
});
