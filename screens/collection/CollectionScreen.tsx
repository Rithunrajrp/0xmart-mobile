import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TopBar } from "../../components/navigation/TopBar";
import { Card } from "../../components/ui/Card";
import api from "../../api";

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <TopBar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Collections</Text>
        <View style={{ width: 24 }} />
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
              <Card style={styles.card}>
                <View style={styles.iconContainer}>
                  <Ionicons name="grid" size={40} color="#8b5cf6" />
                </View>
                <Text style={styles.collectionName}>{collection.category}</Text>
                <Ionicons name="arrow-forward" size={20} color="#a0a0a0" />
              </Card>
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
    backgroundColor: "#0a0a0a",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#121212",
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    flex: 1,
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#a0a0a0",
  },
  grid: {
    padding: 16,
    gap: 16,
  },
  collectionCard: {
    marginBottom: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#1e1e1e",
    alignItems: "center",
    justifyContent: "center",
  },
  collectionName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    textTransform: "capitalize",
  },
});
