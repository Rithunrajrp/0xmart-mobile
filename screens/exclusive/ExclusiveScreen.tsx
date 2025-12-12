import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { TopBar } from "../../components/navigation/TopBar";
import { Card } from "../../components/ui/Card";

export default function ExclusiveScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TopBar />
      <ScrollView style={styles.content}>
        <View style={styles.centerContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="diamond" size={64} color="#8b5cf6" />
          </View>
          <Text style={styles.title}>Exclusive</Text>
          <Text style={styles.subtitle}>
            Premium products for members only
          </Text>

          <Card style={styles.card}>
            <Ionicons name="lock-closed" size={48} color="#6a6a6a" />
            <Text style={styles.cardTitle}>Members Only</Text>
            <Text style={styles.cardText}>
              This section is exclusively available for premium members. Stay tuned for exciting offers!
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>COMING SOON</Text>
            </View>
          </Card>
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
  content: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#8b5cf6",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#a0a0a0",
    textAlign: "center",
    marginBottom: 32,
  },
  card: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 32,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    marginTop: 16,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: "#a0a0a0",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  badge: {
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
});
