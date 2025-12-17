import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRewardsStore } from "../../store/rewards-store";
import { MembershipTier, SubscriptionRewardStats } from "../../types/rewards";
import { Card } from "../ui/Card";

interface Props {
  stats: SubscriptionRewardStats;
  currentTier: MembershipTier;
}

export default function SubscriptionRewardsTab({ stats, currentTier }: Props) {
  const { subscribeToTier } = useRewardsStore();

  const handleSubscribe = async (tier: "BASIC" | "PREMIUM" | "ULTIMATE") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await subscribeToTier(tier);
  };

  const subscriptionTiers = [
    {
      id: "BASIC" as const,
      name: "Basic Subscriber",
      price: 9.99,
      bonusPoints: 500,
      multiplier: 1.2,
      tierBoost: 10,
      color: ["#3B82F6", "#60A5FA"],
      features: [
        "1.2x point multiplier",
        "500 instant bonus points",
        "10% faster tier progress",
        "Priority support",
        "Early sale access",
      ],
    },
    {
      id: "PREMIUM" as const,
      name: "Premium Subscriber",
      price: 19.99,
      bonusPoints: 1200,
      multiplier: 1.5,
      tierBoost: 25,
      color: ["#A855F7", "#C084FC"],
      features: [
        "1.5x point multiplier",
        "1,200 instant bonus points",
        "25% faster tier progress",
        "VIP support",
        "Exclusive drops access",
        "Free standard shipping",
        "Monthly mystery box",
      ],
      popular: true,
    },
    {
      id: "ULTIMATE" as const,
      name: "Ultimate Subscriber",
      price: 39.99,
      bonusPoints: 3000,
      multiplier: 2.0,
      tierBoost: 50,
      color: ["#F97316", "#FBBF24"],
      features: [
        "2x point multiplier",
        "3,000 instant bonus points",
        "50% faster tier progress",
        "Concierge service",
        "All exclusive drops",
        "Free express shipping",
        "Weekly mystery boxes",
        "Token launch priority",
      ],
    },
  ];

  if (stats.isSubscribed) {
    return (
      <View>
        {/* Active Subscription Card */}
        <LinearGradient
          colors={["#10B981", "#34D399"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.activeSubscriptionCard}
        >
          <View style={styles.activeSubscriptionHeader}>
            <View>
              <Text style={styles.activeSubscriptionLabel}>Active Subscription</Text>
              <Text style={styles.activeSubscriptionTier}>
                {stats.subscriptionTier?.replace("_", " ")}
              </Text>
            </View>
            <View style={styles.activeSubscriptionIconContainer}>
              <Ionicons name="checkmark-circle" size={32} color="#FFF" />
            </View>
          </View>

          <View style={styles.activeSubscriptionStats}>
            <View style={styles.activeSubscriptionStatRow}>
              <Text style={styles.activeSubscriptionStatLabel}>Point Multiplier</Text>
              <Text style={styles.activeSubscriptionStatValue}>{stats.multiplier}x</Text>
            </View>
            <View style={styles.activeSubscriptionStatRow}>
              <Text style={styles.activeSubscriptionStatLabel}>Bonus Points Earned</Text>
              <Text style={styles.activeSubscriptionStatValue}>{stats.bonusPoints}</Text>
            </View>
            <View style={styles.activeSubscriptionStatRow}>
              <Text style={styles.activeSubscriptionStatLabel}>Tier Progress Boost</Text>
              <Text style={styles.activeSubscriptionStatValue}>+{stats.tierProgressBoost}%</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Subscription Benefits */}
        <Card style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Your Subscription Benefits</Text>

          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="flash" size={20} color="#10B981" />
              <Text style={styles.benefitText}>
                {stats.multiplier}x points on all purchases
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="trending-up" size={20} color="#10B981" />
              <Text style={styles.benefitText}>
                {stats.tierProgressBoost}% faster tier progression
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="gift" size={20} color="#10B981" />
              <Text style={styles.benefitText}>
                Exclusive access to limited drops
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="cube" size={20} color="#10B981" />
              <Text style={styles.benefitText}>Regular mystery boxes</Text>
            </View>
          </View>
        </Card>
      </View>
    );
  }

  return (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upgrade Your Rewards</Text>
        <Text style={styles.headerSubtitle}>
          Subscribe to multiply your points, accelerate tier progress, and unlock exclusive perks
        </Text>
      </View>

      {/* Subscription Tier Cards */}
      {subscriptionTiers.map((tier) => (
        <View key={tier.id} style={styles.tierCardContainer}>
          <LinearGradient
            colors={tier.color as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tierCard}
          >
            {tier.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
              </View>
            )}

            <View style={styles.tierCardHeader}>
              <View>
                <Text style={styles.tierCardName}>{tier.name}</Text>
                <View style={styles.tierCardPriceRow}>
                  <Text style={styles.tierCardPrice}>${tier.price}</Text>
                  <Text style={styles.tierCardPriceUnit}>/month</Text>
                </View>
              </View>
            </View>

            {/* Instant Bonus */}
            <View style={styles.instantBonusContainer}>
              <Ionicons name="gift" size={20} color="#FFF" />
              <Text style={styles.instantBonusText}>
                {tier.bonusPoints.toLocaleString()} Instant Bonus Points
              </Text>
            </View>

            {/* Features */}
            <View style={styles.featuresList}>
              {tier.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            {/* Subscribe Button */}
            <TouchableOpacity
              onPress={() => handleSubscribe(tier.id)}
              style={styles.subscribeButton}
            >
              <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      ))}

      {/* Why Subscribe */}
      <Card style={styles.whySubscribeCard}>
        <Text style={styles.whySubscribeTitle}>Why Subscribe?</Text>

        <View style={styles.whySubscribeList}>
          <View style={styles.whySubscribeItem}>
            <View style={styles.whySubscribeIconContainer}>
              <Ionicons name="flash" size={14} color="#FFF" />
            </View>
            <View style={styles.whySubscribeContent}>
              <Text style={styles.whySubscribeItemTitle}>Multiply Your Earnings</Text>
              <Text style={styles.whySubscribeItemDescription}>
                Earn up to 2x more points on every purchase
              </Text>
            </View>
          </View>

          <View style={styles.whySubscribeItem}>
            <View style={styles.whySubscribeIconContainer}>
              <Ionicons name="rocket" size={14} color="#FFF" />
            </View>
            <View style={styles.whySubscribeContent}>
              <Text style={styles.whySubscribeItemTitle}>Reach Tiers Faster</Text>
              <Text style={styles.whySubscribeItemDescription}>
                Get up to 50% faster tier progression
              </Text>
            </View>
          </View>

          <View style={styles.whySubscribeItem}>
            <View style={styles.whySubscribeIconContainer}>
              <Ionicons name="diamond" size={14} color="#FFF" />
            </View>
            <View style={styles.whySubscribeContent}>
              <Text style={styles.whySubscribeItemTitle}>Exclusive Access</Text>
              <Text style={styles.whySubscribeItemDescription}>
                Get first access to limited edition drops and mystery boxes
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  activeSubscriptionCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  activeSubscriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  activeSubscriptionLabel: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter-SemiBold",
    letterSpacing: 0.5,
  },
  activeSubscriptionTier: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 4,
    fontFamily: "PlayfairDisplay-Bold",
  },
  activeSubscriptionIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 999,
    padding: 12,
    backdropFilter: "blur(4px)",
  },
  activeSubscriptionStats: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  activeSubscriptionStatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  activeSubscriptionStatLabel: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  activeSubscriptionStatValue: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
    fontFamily: "Inter-Bold",
  },
  benefitsCard: {
    padding: 20,
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  benefitsTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    fontFamily: "Inter-Bold",
  },
  benefitsList: {
    gap: 16,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  benefitText: {
    color: "#4B5563",
    fontSize: 14,
    marginLeft: 12,
    fontFamily: "Inter-Medium",
  },
  header: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    fontFamily: "PlayfairDisplay-Bold",
    textAlign: "center",
  },
  headerSubtitle: {
    color: "#6B7280",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    fontFamily: "Inter-Regular",
  },
  tierCardContainer: {
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  tierCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  popularBadge: {
    backgroundColor: "#FEF3C7",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  popularBadgeText: {
    color: "#D97706",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    fontFamily: "Inter-Bold",
  },
  tierCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  tierCardName: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "PlayfairDisplay-Bold",
  },
  tierCardPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 4,
  },
  tierCardPrice: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "700",
    fontFamily: "Inter-Bold",
  },
  tierCardPriceUnit: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginLeft: 4,
    fontFamily: "Inter-Medium",
  },
  instantBonusContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backdropFilter: "blur(4px)",
  },
  instantBonusText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
  },
  featuresList: {
    gap: 12,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    color: "rgba(255, 255, 255, 0.95)",
    fontSize: 15,
    fontFamily: "Inter-Medium",
  },
  subscribeButton: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  subscribeButtonText: {
    color: "#111827",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Inter-Bold",
  },
  whySubscribeCard: {
    marginTop: 8,
    padding: 24,
    backgroundColor: "#111827",
    borderRadius: 24,
  },
  whySubscribeTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 24,
    fontFamily: "PlayfairDisplay-Bold",
  },
  whySubscribeList: {
    gap: 20,
  },
  whySubscribeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  whySubscribeIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    marginTop: 2,
  },
  whySubscribeContent: {
    flex: 1,
  },
  whySubscribeItemTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter-SemiBold",
  },
  whySubscribeItemDescription: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 20,
    fontFamily: "Inter-Regular",
  },
});
