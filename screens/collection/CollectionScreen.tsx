import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../api";
import { TopBar } from "../../components/navigation/TopBar";

interface Collection {
  category: string;
  productCount: number;
  thumbnail?: string;
}

export default function CollectionScreen() {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const categories = await api.getCategories();

      // Transform categories into collections
      const collectionsData = categories.map((cat: string) => ({
        category: cat,
        productCount: 0, // Will be populated when we fetch products
        thumbnail: undefined,
      }));

      setCollections(collectionsData);
    } catch (error) {
      console.error("Error loading collections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCollectionPress = (category: string) => {
    router.push(`/collection/${encodeURIComponent(category)}`);
  };

  const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    const lowerCat = category.toLowerCase();
    if (lowerCat.includes('electronic') || lowerCat.includes('tech')) return 'hardware-chip-outline';
    if (lowerCat.includes('cloth') || lowerCat.includes('fashion') || lowerCat.includes('wear')) return 'shirt-outline';
    if (lowerCat.includes('home') || lowerCat.includes('living')) return 'home-outline';
    if (lowerCat.includes('beauty') || lowerCat.includes('health')) return 'sparkles-outline';
    if (lowerCat.includes('sport') || lowerCat.includes('fitness')) return 'basketball-outline';
    if (lowerCat.includes('toy') || lowerCat.includes('game')) return 'game-controller-outline';
    if (lowerCat.includes('book') || lowerCat.includes('read')) return 'book-outline';
    if (lowerCat.includes('watch') || lowerCat.includes('jewel')) return 'watch-outline';
    if (lowerCat.includes('bag') || lowerCat.includes('luggage')) return 'briefcase-outline';
    if (lowerCat.includes('shoe') || lowerCat.includes('footwear')) return 'footsteps-outline';
    return 'grid-outline';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <TopBar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#111827" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Collections</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.subtitle}>
            Browse products by category
          </Text>
        </View>

        <View style={styles.grid}>
          {collections.map((collection) => (
            <TouchableOpacity
              key={collection.category}
              style={styles.collectionCard}
              onPress={() => handleCollectionPress(collection.category)}
              activeOpacity={0.7}
            >
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <Ionicons name={getCategoryIcon(collection.category)} size={28} color="#111827" />
                </View>
                <Text style={styles.collectionName}>{collection.category}</Text>
                <View style={styles.arrowContainer}>
                  <Ionicons name="arrow-forward" size={20} color="#111827" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    fontFamily: 'PlayfairDisplay-Bold',
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    fontFamily: 'Inter-Regular',
  },
  grid: {
    padding: 24,
    paddingTop: 8,
    gap: 16,
  },
  collectionCard: {
    marginBottom: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  collectionName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textTransform: "capitalize",
    fontFamily: 'Inter-SemiBold',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
  },
});
