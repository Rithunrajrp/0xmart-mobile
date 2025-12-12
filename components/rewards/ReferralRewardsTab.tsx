import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { ReferralRewardStats } from "../../types/rewards";
import { Card } from "../ui/Card";

interface Props {
  stats: ReferralRewardStats;
}

export default function ReferralRewardsTab({ stats }: Props) {
  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(stats.referralCode);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Copied!", "Referral code copied to clipboard");
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join 0xMart using my referral code ${stats.referralCode} and get exclusive rewards! Download now: https://0xmart.app/ref/${stats.referralCode}`,
        title: "Join 0xMart",
      });
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  return (
    <View>
      {/* Referral Code Card */}
      <LinearGradient
        colors={["#7C3AED", "#A855F7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.referralCodeCard}
      >
        <Text style={styles.referralCodeLabel}>Your Referral Code</Text>
        <View style={styles.referralCodeRow}>
          <Text style={styles.referralCodeText}>{stats.referralCode}</Text>
          <TouchableOpacity onPress={handleCopyCode} style={styles.copyButton}>
            <Ionicons name="copy" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Share Button */}
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-social" size={20} color="#7C3AED" />
          <Text style={styles.shareButtonText}>Share with Friends</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Ionicons name="people" size={24} color="#A855F7" />
          <Text style={styles.statLabel}>Successful</Text>
          <Text style={styles.statValue}>{stats.successfulReferrals}</Text>
        </Card>

        <Card style={styles.statCard}>
          <Ionicons name="flame" size={24} color="#F97316" />
          <Text style={styles.statLabel}>Streak</Text>
          <Text style={styles.statValue}>{stats.currentStreak}</Text>
        </Card>

        <Card style={styles.statCard}>
          <Ionicons name="star" size={24} color="#FBBF24" />
          <Text style={styles.statLabel}>Points</Text>
          <Text style={styles.statValue}>{stats.pointsEarned}</Text>
        </Card>
      </View>

      {/* Leaderboard Rank */}
      {stats.leaderboardRank && (
        <LinearGradient
          colors={["rgba(234, 179, 8, 0.2)", "rgba(249, 115, 22, 0.2)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.leaderboardCard}
        >
          <View style={styles.leaderboardContent}>
            <View>
              <Text style={styles.leaderboardLabel}>Leaderboard Rank</Text>
              <Text style={styles.leaderboardRank}>#{stats.leaderboardRank}</Text>
            </View>
            <View style={styles.leaderboardIconContainer}>
              <Ionicons name="trophy" size={32} color="#FBBF24" />
            </View>
          </View>
          <TouchableOpacity style={styles.leaderboardButton}>
            <Text style={styles.leaderboardButtonText}>View Full Leaderboard</Text>
          </TouchableOpacity>
        </LinearGradient>
      )}

      {/* Streak Bonuses */}
      <View style={styles.streakBonusesContainer}>
        <Text style={styles.streakBonusesTitle}>Streak Bonuses</Text>
        <Text style={styles.streakBonusesSubtitle}>
          Keep your referral streak alive to unlock multipliers!
        </Text>

        {stats.streakBonuses.map((bonus) => (
          <Card
            key={bonus.level}
            style={[
              styles.streakBonusCard,
              bonus.unlocked && styles.streakBonusCardUnlocked,
            ]}
          >
            <View style={styles.streakBonusContent}>
              <View style={styles.streakBonusLeft}>
                <View
                  style={[
                    styles.streakBonusIconContainer,
                    bonus.unlocked
                      ? styles.streakBonusIconUnlocked
                      : styles.streakBonusIconLocked,
                  ]}
                >
                  <Ionicons
                    name={bonus.unlocked ? "flame" : "lock-closed"}
                    size={20}
                    color="#FFF"
                  />
                </View>
                <View style={styles.streakBonusInfo}>
                  <Text style={styles.streakBonusLevel}>Level {bonus.level}</Text>
                  <Text style={styles.streakBonusDescription}>
                    {bonus.referralsNeeded} successful referrals
                  </Text>
                </View>
              </View>
              <View style={styles.streakBonusMultiplier}>
                <Text style={styles.streakBonusMultiplierText}>
                  {bonus.bonusMultiplier}x
                </Text>
              </View>
            </View>
          </Card>
        ))}
      </View>

      {/* How It Works */}
      <Card style={styles.howItWorksCard}>
        <Text style={styles.howItWorksTitle}>How Referrals Work</Text>

        <View style={styles.stepsContainer}>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepText}>
                Share your unique referral code with friends
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepText}>
                They sign up and make their first purchase
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepText}>
                You both earn bonus points and rewards!
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  referralCodeCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(168, 85, 247, 0.3)",
  },
  referralCodeLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  referralCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  referralCodeText: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 4,
  },
  copyButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 999,
    padding: 12,
  },
  shareButton: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  shareButtonText: {
    color: "#7C3AED",
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
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
  },
  statValue: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 4,
  },
  leaderboardCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  leaderboardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  leaderboardLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  leaderboardRank: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "700",
  },
  leaderboardIconContainer: {
    backgroundColor: "rgba(251, 191, 36, 0.2)",
    borderRadius: 999,
    padding: 16,
  },
  leaderboardButton: {
    backgroundColor: "#FBBF24",
    borderRadius: 12,
    paddingVertical: 8,
  },
  leaderboardButtonText: {
    color: "#0a0a0a",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 14,
  },
  streakBonusesContainer: {
    marginBottom: 16,
  },
  streakBonusesTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  streakBonusesSubtitle: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
    marginBottom: 16,
  },
  streakBonusCard: {
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  streakBonusCardUnlocked: {
    borderColor: "rgba(249, 115, 22, 0.5)",
  },
  streakBonusContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  streakBonusLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  streakBonusIconContainer: {
    borderRadius: 999,
    padding: 8,
    marginRight: 12,
  },
  streakBonusIconUnlocked: {
    backgroundColor: "#F97316",
  },
  streakBonusIconLocked: {
    backgroundColor: "#2a2a2a",
  },
  streakBonusInfo: {
    flex: 1,
  },
  streakBonusLevel: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  streakBonusDescription: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    marginTop: 4,
  },
  streakBonusMultiplier: {
    backgroundColor: "rgba(249, 115, 22, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  streakBonusMultiplierText: {
    color: "#F97316",
    fontWeight: "700",
    fontSize: 14,
  },
  howItWorksCard: {
    marginTop: 8,
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
    marginBottom: 12,
  },
  stepNumber: {
    backgroundColor: "#7C3AED",
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
  stepText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
  },
});
