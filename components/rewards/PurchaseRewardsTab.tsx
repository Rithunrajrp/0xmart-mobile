import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { PurchaseRewardStats } from "../../types/rewards";
import { Card } from "../ui/Card";

interface Props {
  stats: PurchaseRewardStats;
  currentMultiplier: number;
}

export default function PurchaseRewardsTab({ stats, currentMultiplier }: Props) {
  return (
    <View>
      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Ionicons name="cart" size={24} color="#3B82F6" />
          <Text style={styles.statLabel}>Total Purchases</Text>
          <Text style={styles.statValue}>{stats.totalPurchases}</Text>
        </Card>

        <Card style={styles.statCard}>
          <Ionicons name="star" size={24} color="#FBBF24" />
          <Text style={styles.statLabel}>Points Earned</Text>
          <Text style={styles.statValue}>{stats.pointsEarned.toLocaleString()}</Text>
        </Card>
      </View>

      {/* Current Multiplier */}
      <LinearGradient
        colors={["#1E40AF", "#3B82F6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.multiplierCard}
      >
        <View style={styles.multiplierContent}>
          <View style={styles.multiplierInfo}>
            <Text style={styles.multiplierLabel}>Current Multiplier</Text>
            <Text style={styles.multiplierValue}>{currentMultiplier}x</Text>
            <Text style={styles.multiplierSubtext}>
              Earn {currentMultiplier}x points on every purchase
            </Text>
          </View>
          <View style={styles.multiplierIconContainer}>
            <Ionicons name="flash" size={32} color="#FFF" />
          </View>
        </View>
      </LinearGradient>

      {/* How It Works */}
      <Card style={styles.howItWorksCard}>
        <Text style={styles.howItWorksTitle}>How Purchase Rewards Work</Text>

        <View style={styles.stepsContainer}>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Make a Purchase</Text>
              <Text style={styles.stepDescription}>
                Every dollar spent earns you base points
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Apply Multiplier</Text>
              <Text style={styles.stepDescription}>
                Your tier multiplier increases points earned
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Unlock Milestones</Text>
              <Text style={styles.stepDescription}>
                Reach spending thresholds for bonus rewards
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Milestones */}
      <View style={styles.milestonesContainer}>
        <Text style={styles.milestonesTitle}>Purchase Milestones</Text>
        {stats.milestones.map((milestone) => (
          <Card
            key={milestone.id}
            style={[
              styles.milestoneCard,
              milestone.unlocked && styles.milestoneCardUnlocked,
            ]}
          >
            <View style={styles.milestoneHeader}>
              <View style={styles.milestoneLeft}>
                <View
                  style={[
                    styles.milestoneIconContainer,
                    milestone.unlocked
                      ? styles.milestoneIconUnlocked
                      : styles.milestoneIconLocked,
                  ]}
                >
                  <Ionicons
                    name={milestone.unlocked ? "checkmark" : "lock-closed"}
                    size={16}
                    color="#FFF"
                  />
                </View>
                <View style={styles.milestoneInfo}>
                  <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                  <Text style={styles.milestoneDescription}>
                    {milestone.description}
                  </Text>
                </View>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.milestoneProgressContainer}>
              <View style={styles.milestoneProgressBar}>
                <View
                  style={[
                    styles.milestoneProgressFill,
                    milestone.unlocked
                      ? styles.milestoneProgressUnlocked
                      : styles.milestoneProgressLocked,
                    {
                      width: `${Math.min(
                        100,
                        (milestone.currentAmount / milestone.targetAmount) * 100
                      )}%`,
                    },
                  ]}
                />
              </View>
              <View style={styles.milestoneProgressInfo}>
                <Text style={styles.milestoneProgressText}>
                  {milestone.currentAmount} / {milestone.targetAmount}
                </Text>
                <Text style={styles.milestoneReward}>{milestone.reward}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    marginTop: 8,
    fontWeight: "500",
  },
  statValue: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 4,
  },
  multiplierCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  multiplierContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  multiplierInfo: {
    flex: 1,
  },
  multiplierLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  multiplierValue: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "700",
  },
  multiplierSubtext: {
    color: "rgba(187, 222, 255, 1)",
    fontSize: 12,
    marginTop: 4,
  },
  multiplierIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 999,
    padding: 16,
  },
  howItWorksCard: {
    marginBottom: 16,
    padding: 20,
  },
  howItWorksTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  stepsContainer: {
    gap: 12,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepNumber: {
    backgroundColor: "#2563EB",
    borderRadius: 999,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stepNumberText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    fontWeight: "600",
  },
  stepDescription: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    marginTop: 4,
  },
  milestonesContainer: {
    marginTop: 8,
  },
  milestonesTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  milestoneCard: {
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  milestoneCardUnlocked: {
    borderColor: "rgba(34, 197, 94, 0.5)",
  },
  milestoneHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  milestoneLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  milestoneIconContainer: {
    borderRadius: 999,
    padding: 8,
    marginRight: 12,
  },
  milestoneIconUnlocked: {
    backgroundColor: "#22c55e",
  },
  milestoneIconLocked: {
    backgroundColor: "#2a2a2a",
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  milestoneDescription: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    marginTop: 4,
  },
  milestoneProgressContainer: {
    marginTop: 12,
  },
  milestoneProgressBar: {
    backgroundColor: "#2a2a2a",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  milestoneProgressFill: {
    height: "100%",
    borderRadius: 4,
  },
  milestoneProgressUnlocked: {
    backgroundColor: "#22c55e",
  },
  milestoneProgressLocked: {
    backgroundColor: "#3B82F6",
  },
  milestoneProgressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  milestoneProgressText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
  },
  milestoneReward: {
    color: "#60A5FA",
    fontSize: 12,
    fontWeight: "600",
  },
});
