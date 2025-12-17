import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopBar } from "../../components/navigation/TopBar";

export default function ExclusiveScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TopBar />
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.centerContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="diamond-outline" size={56} color="#111827" />
          </View>
          <Text style={styles.title}>Exclusive Access</Text>
          <Text style={styles.subtitle}>
            Premium collection requires membership
          </Text>

          <View style={styles.card}>
            <View style={styles.lockIconContainer}>
              <Ionicons name="lock-closed-outline" size={32} color="#D4AF37" />
            </View>
            <Text style={styles.cardTitle}>Members Only</Text>
            <Text style={styles.cardText}>
              This section is exclusively available for premium members. Join now to unlock special prices and early access.
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>COMING SOON</Text>
            </View>
          </View>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  centerContent: {
    alignItems: "center",
    padding: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    fontFamily: 'PlayfairDisplay-Bold',
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 40,
    fontFamily: 'Inter-Regular',
  },
  card: {
    width: "100%",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  lockIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFBEB", // Light yellow/gold
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
    fontFamily: 'PlayfairDisplay-Bold',
  },
  cardText: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
  badge: {
    backgroundColor: "#111827",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 1,
    fontFamily: 'Inter-Bold',
  },
});
