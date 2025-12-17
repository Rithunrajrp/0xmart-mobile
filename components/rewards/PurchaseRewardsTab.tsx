import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
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
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  statLabel: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 8,
    fontWeight: "500",
    fontFamily: "Inter-Medium",
  },
  statValue: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 4,
    fontFamily: "Inter-Bold",
  },
  multiplierCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
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
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    fontFamily: "Inter-SemiBold",
  },
  multiplierValue: {
    color: "#ffffff",
    fontSize: 40,
    fontWeight: "800",
    fontFamily: "Inter-ExtraBold",
  },
  multiplierSubtext: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 13,
    marginTop: 4,
    fontFamily: "Inter-Medium",
  },
  multiplierIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 24,
    padding: 16,
    backdropFilter: "blur(4px)",
  },
  howItWorksCard: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  howItWorksTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    fontFamily: "PlayfairDisplay-Bold",
  },
  stepsContainer: {
    gap: 16,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepNumber: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stepNumberText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Inter-Bold",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter-SemiBold",
    marginBottom: 2,
  },
  stepDescription: {
    color: "#4B5563",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter-Regular",
  },
  milestonesContainer: {
    marginTop: 8,
  },
  milestonesTitle: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    fontFamily: "PlayfairDisplay-Bold",
  },
  milestoneCard: {
    marginBottom: 12,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  milestoneCardUnlocked: {
    borderColor: "#22c55e",
    backgroundColor: "#F0FDF4",
  },
  milestoneHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  milestoneLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  milestoneIconContainer: {
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
  },
  milestoneIconUnlocked: {
    backgroundColor: "#22c55e",
  },
  milestoneIconLocked: {
    backgroundColor: "#F3F4F6",
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
  },
  milestoneDescription: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 2,
    fontFamily: "Inter-Regular",
  },
  milestoneProgressContainer: {
    marginTop: 8,
  },
  milestoneProgressBar: {
    backgroundColor: "#F3F4F6",
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
    alignItems: "center",
  },
  milestoneProgressText: {
    color: "#6B7280",
    fontSize: 12,
    fontFamily: "Inter-Medium",
  },
  milestoneReward: {
    color: "#3B82F6",
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "Inter-SemiBold",
  },
});
