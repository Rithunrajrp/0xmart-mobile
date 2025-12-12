import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { SubscriptionRewardStats, MembershipTier } from "../../types/rewards";
import { useRewardsStore } from "../../store/rewards-store";
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
            colors={tier.color}
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
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  activeSubscriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  activeSubscriptionLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontWeight: "500",
  },
  activeSubscriptionTier: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 4,
  },
  activeSubscriptionIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 999,
    padding: 12,
  },
  activeSubscriptionStats: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 12,
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
  },
  activeSubscriptionStatValue: {
    color: "#ffffff",
    fontWeight: "700",
  },
  benefitsCard: {
    padding: 20,
  },
  benefitsTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  benefitText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginLeft: 12,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
  },
  tierCardContainer: {
    marginBottom: 16,
  },
  tierCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  popularBadge: {
    backgroundColor: "#FBBF24",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  popularBadgeText: {
    color: "#0a0a0a",
    fontSize: 12,
    fontWeight: "700",
  },
  tierCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  tierCardName: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },
  tierCardPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 4,
  },
  tierCardPrice: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "700",
  },
  tierCardPriceUnit: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    marginLeft: 4,
  },
  instantBonusContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  instantBonusText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  featuresList: {
    gap: 8,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
  },
  subscribeButton: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 12,
  },
  subscribeButtonText: {
    color: "#0a0a0a",
    fontWeight: "700",
    textAlign: "center",
  },
  whySubscribeCard: {
    marginTop: 8,
    padding: 20,
  },
  whySubscribeTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  whySubscribeList: {
    gap: 12,
  },
  whySubscribeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  whySubscribeIconContainer: {
    backgroundColor: "#14B8A6",
    borderRadius: 999,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  whySubscribeContent: {
    flex: 1,
  },
  whySubscribeItemTitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    fontWeight: "600",
  },
  whySubscribeItemDescription: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    marginTop: 4,
  },
});
