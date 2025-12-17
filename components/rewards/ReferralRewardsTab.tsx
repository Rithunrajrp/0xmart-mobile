import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Alert, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  referralCodeLabel: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    fontFamily: "Inter-SemiBold",
    letterSpacing: 0.5,
  },
  referralCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  referralCodeText: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 2,
    fontFamily: "Inter-Bold",
  },
  copyButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 10,
  },
  shareButton: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  shareButtonText: {
    color: "#7C3AED",
    fontWeight: "700",
    fontSize: 16,
    fontFamily: "Inter-Bold",
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 24,
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
    fontFamily: "Inter-Medium",
  },
  statValue: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 4,
    fontFamily: "Inter-Bold",
  },
  leaderboardCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  leaderboardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  leaderboardLabel: {
    color: "#92400E",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    fontFamily: "Inter-SemiBold",
  },
  leaderboardRank: {
    color: "#B45309",
    fontSize: 40,
    fontWeight: "800",
    fontFamily: "Inter-ExtraBold",
  },
  leaderboardIconContainer: {
    backgroundColor: "#FFFBEB",
    borderRadius: 24,
    padding: 16,
  },
  leaderboardButton: {
    backgroundColor: "#F59E0B",
    borderRadius: 12,
    paddingVertical: 12,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  leaderboardButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Inter-Bold",
  },
  streakBonusesContainer: {
    marginBottom: 24,
  },
  streakBonusesTitle: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
    fontFamily: "PlayfairDisplay-Bold",
  },
  streakBonusesSubtitle: {
    color: "#6B7280",
    fontSize: 14,
    marginBottom: 16,
    fontFamily: "Inter-Regular",
  },
  streakBonusCard: {
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
  streakBonusCardUnlocked: {
    borderColor: "#F97316",
    backgroundColor: "#FFF7ED",
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
    borderRadius: 12,
    padding: 10,
    marginRight: 12,
  },
  streakBonusIconUnlocked: {
    backgroundColor: "#F97316",
  },
  streakBonusIconLocked: {
    backgroundColor: "#F3F4F6",
  },
  streakBonusInfo: {
    flex: 1,
  },
  streakBonusLevel: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
  },
  streakBonusDescription: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 2,
    fontFamily: "Inter-Regular",
  },
  streakBonusMultiplier: {
    backgroundColor: "#FFEDD5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  streakBonusMultiplierText: {
    color: "#C2410C",
    fontWeight: "700",
    fontSize: 14,
    fontFamily: "Inter-Bold",
  },
  howItWorksCard: {
    marginTop: 8,
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
    marginBottom: 4,
  },
  stepNumber: {
    backgroundColor: "#7C3AED",
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
    justifyContent: "center",
  },
  stepText: {
    color: "#4B5563",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Inter-Medium",
  },
});
