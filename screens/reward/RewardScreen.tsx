import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
  Share,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { TopBar } from "../../components/navigation/TopBar";
import { Card } from "../../components/ui/Card";
import { useRewardsStore } from "../../store/rewards-store";
import { TIER_CONFIGS, getProgressToNextTier, getNextTier } from "../../config/tier-config";
import { MembershipTier, TierUpgradeEvent } from "../../types/rewards";
import PurchaseRewardsTab from "../../components/rewards/PurchaseRewardsTab";
import ReferralRewardsTab from "../../components/rewards/ReferralRewardsTab";
import SubscriptionRewardsTab from "../../components/rewards/SubscriptionRewardsTab";

const { width } = Dimensions.get("window");

type TabType = "purchase" | "referral" | "subscription";

export default function RewardScreen() {
  const {
    rewards,
    loading,
    fetchRewards,
    showUpgradeModal,
    upgradeEvent,
    dismissUpgradeModal,
    openMysteryBox,
  } = useRewardsStore();

  const [activeTab, setActiveTab] = useState<TabType>("purchase");
  const [celebrationAnim] = useState(new Animated.Value(0));
  const [sparkleAnims] = useState(
    Array.from({ length: 12 }, () => new Animated.Value(0))
  );

  useEffect(() => {
    fetchRewards();
  }, []);

  useEffect(() => {
    if (showUpgradeModal && upgradeEvent) {
      triggerCelebrationAnimation();
    }
  }, [showUpgradeModal, upgradeEvent]);

  const triggerCelebrationAnimation = () => {
    // Main celebration pulse
    Animated.sequence([
      Animated.spring(celebrationAnim, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.delay(500),
      Animated.spring(celebrationAnim, {
        toValue: 0,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    // Sparkle animations
    sparkleAnims.forEach((anim, index) => {
      Animated.sequence([
        Animated.delay(index * 50),
        Animated.parallel([
          Animated.timing(anim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 400,
            delay: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (loading || !rewards) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <TopBar />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading rewards...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const tierConfig = TIER_CONFIGS[rewards.currentTier];
  const progress = getProgressToNextTier(rewards.totalSpent, rewards.currentTier);
  const nextTier = getNextTier(rewards.currentTier);
  const nextTierConfig = nextTier ? TIER_CONFIGS[nextTier] : null;

  const handleShareReferral = async () => {
    try {
      await Share.share({
        message: `Join 0xMart using my referral code ${rewards.referralRewards.referralCode} and get exclusive rewards! Download now: https://0xmart.app/ref/${rewards.referralRewards.referralCode}`,
        title: "Join 0xMart",
      });
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  const handleCopyReferralCode = async () => {
    await Clipboard.setStringAsync(rewards.referralRewards.referralCode);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Copied!", "Referral code copied to clipboard");
  };

  const handleOpenMysteryBox = async (boxId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await openMysteryBox(boxId);
    Alert.alert("Mystery Box Opened!", "Check your rewards for your prize!");
  };

  const scale = celebrationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  const opacity = celebrationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TopBar />
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Summary Section */}
        <View style={styles.summarySection}>
          {/* Tier Badge with Gradient */}
          <LinearGradient
            colors={tierConfig.color.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tierBadgeContainer}
          >
            <View style={styles.tierBadgeContent}>
              <View style={styles.tierIconContainer}>
                <Ionicons
                  name="diamond"
                  size={32}
                  color={tierConfig.color.primary === "#FFFFFF" ? "#FCD34D" : "#FFFFFF"}
                />
              </View>
              <Text style={styles.tierName}>{tierConfig.name}</Text>
              <Text style={styles.tierBadgeLabel}>CURRENT TIER</Text>
            </View>
          </LinearGradient>

          {/* Points Balance */}
          <Card style={styles.pointsCard}>
            <View style={styles.pointsRow}>
              <View style={styles.pointsColumn}>
                <Text style={styles.pointsLabel}>Points Balance</Text>
                <Text style={styles.pointsAmount}>
                  {rewards.currentPoints.toLocaleString()}
                </Text>
              </View>
              <View style={styles.pointsColumn}>
                <Text style={styles.pointsLabel}>Token Credits</Text>
                <Text style={styles.tokenCredits}>
                  {rewards.tokenCredits.toLocaleString()}
                </Text>
                <Text style={styles.tokenSubtext}>Converting to token soon</Text>
              </View>
            </View>
          </Card>

          {/* Progress to Next Tier */}
          {nextTierConfig && (
            <Card style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <View>
                  <Text style={styles.progressLabel}>Progress to {nextTierConfig.name}</Text>
                  <Text style={styles.progressAmount}>
                    ${progress.spendNeeded.toLocaleString()} remaining
                  </Text>
                </View>
                <Text style={styles.progressPercent}>
                  {Math.round(progress.progressPercent)}%
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <LinearGradient
                    colors={nextTierConfig.color.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.progressBarFill,
                      { width: `${progress.progressPercent}%` },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.progressInfo}>
                <Text style={styles.progressCurrent}>
                  ${rewards.totalSpent.toLocaleString()} spent
                </Text>
                <Text style={styles.progressTarget}>
                  ${nextTierConfig.minSpend.toLocaleString()} target
                </Text>
              </View>
            </Card>
          )}

          {/* Tier Multiplier */}
          <Card style={styles.multiplierCard}>
            <View style={styles.multiplierContent}>
              <Ionicons name="flash" size={24} color={tierConfig.color.primary} />
              <View style={styles.multiplierInfo}>
                <Text style={styles.multiplierLabel}>Point Multiplier</Text>
                <Text style={[styles.multiplierValue, { color: tierConfig.color.primary }]}>
                  {tierConfig.pointMultiplier}x
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Rewards Breakdown Tabs */}
        <View style={styles.tabsSection}>
          <View style={styles.tabButtons}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "purchase" && styles.tabButtonActive]}
              onPress={() => {
                setActiveTab("purchase");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Ionicons
                name="cart"
                size={20}
                color={activeTab === "purchase" ? tierConfig.color.primary : "#6a6a6a"}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === "purchase" && { color: tierConfig.color.primary },
                ]}
              >
                Purchase
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === "referral" && styles.tabButtonActive]}
              onPress={() => {
                setActiveTab("referral");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Ionicons
                name="people"
                size={20}
                color={activeTab === "referral" ? tierConfig.color.primary : "#6a6a6a"}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === "referral" && { color: tierConfig.color.primary },
                ]}
              >
                Referral
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "subscription" && styles.tabButtonActive,
              ]}
              onPress={() => {
                setActiveTab("subscription");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Ionicons
                name="star"
                size={20}
                color={activeTab === "subscription" ? tierConfig.color.primary : "#6a6a6a"}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === "subscription" && { color: tierConfig.color.primary },
                ]}
              >
                Subscription
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === "purchase" && (
              <PurchaseRewardsTab
                stats={rewards.purchaseRewards}
                currentMultiplier={tierConfig.pointMultiplier}
              />
            )}
            {activeTab === "referral" && <ReferralRewardsTab stats={rewards.referralRewards} />}
            {activeTab === "subscription" && (
              <SubscriptionRewardsTab
                stats={rewards.subscriptionRewards}
                currentTier={rewards.currentTier}
              />
            )}
          </View>
        </View>

        {/* Special Rewards Area */}
        <View style={styles.specialRewardsSection}>
          <Text style={styles.sectionTitle}>Special Rewards</Text>

          {/* Mystery Boxes */}
          <View style={styles.mysteryBoxesContainer}>
            <View style={styles.mysteryBoxHeader}>
              <Text style={styles.subsectionTitle}>Mystery Boxes</Text>
              <Ionicons name="gift" size={24} color="#8b5cf6" />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.mysteryBoxesScroll}
              contentContainerStyle={styles.mysteryBoxesContent}
            >
              {rewards.mysteryBoxes.map((box) => {
                const boxTierConfig = TIER_CONFIGS[box.requiredTier];
                const canOpen = box.unlocked && !box.opened;
                const isLocked = !box.unlocked;

                return (
                  <TouchableOpacity
                    key={box.id}
                    style={styles.mysteryBoxCard}
                    onPress={() => canOpen && handleOpenMysteryBox(box.id)}
                    disabled={isLocked || box.opened}
                    activeOpacity={canOpen ? 0.7 : 1}
                  >
                    <LinearGradient
                      colors={
                        isLocked
                          ? ["#2a2a2a", "#1a1a1a"]
                          : box.opened
                          ? ["#3a3a3a", "#2a2a2a"]
                          : boxTierConfig.color.gradient
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.mysteryBoxGradient}
                    >
                      {/* Decorative corners */}
                      {canOpen && (
                        <>
                          <View style={[styles.boxCorner, styles.boxCornerTL]} />
                          <View style={[styles.boxCorner, styles.boxCornerTR]} />
                          <View style={[styles.boxCorner, styles.boxCornerBL]} />
                          <View style={[styles.boxCorner, styles.boxCornerBR]} />
                        </>
                      )}

                      {/* Locked State */}
                      {isLocked && (
                        <View style={styles.lockedOverlay}>
                          <View style={styles.lockIconContainer}>
                            <Ionicons name="lock-closed" size={40} color="#6a6a6a" />
                          </View>
                          <Text style={styles.lockedText}>
                            Requires{"\n"}{boxTierConfig.name}
                          </Text>
                        </View>
                      )}

                      {/* Opened State */}
                      {box.opened && (
                        <View style={styles.openedOverlay}>
                          <Ionicons name="checkmark-circle" size={40} color="#22c55e" />
                          <Text style={styles.openedText}>Claimed!</Text>
                        </View>
                      )}

                      {/* Box Content */}
                      <View style={styles.mysteryBoxContent}>
                        <View style={styles.mysteryBoxIcon}>
                          <Ionicons
                            name={isLocked ? "cube-outline" : box.opened ? "gift-outline" : "gift"}
                            size={56}
                            color={isLocked ? "#6a6a6a" : "#ffffff"}
                          />
                        </View>

                        <View style={styles.mysteryBoxInfo}>
                          <Text style={styles.mysteryBoxTitle}>{box.title}</Text>
                          <View style={styles.rarityBadge}>
                            <Ionicons name="star" size={12} color={isLocked ? "#6a6a6a" : "#FCD34D"} />
                            <Text style={[
                              styles.rarityBadgeText,
                              isLocked && { color: "#6a6a6a" }
                            ]}>
                              {box.rarity}
                            </Text>
                          </View>
                        </View>

                        {canOpen && (
                          <TouchableOpacity
                            style={styles.openButton}
                            onPress={() => handleOpenMysteryBox(box.id)}
                          >
                            <Ionicons name="open-outline" size={18} color="#ffffff" />
                            <Text style={styles.openButtonText}>Open</Text>
                          </TouchableOpacity>
                        )}

                        {!canOpen && !box.opened && isLocked && (
                          <View style={styles.tierRequirement}>
                            <Text style={styles.tierRequirementText}>
                              Unlock at {boxTierConfig.name}
                            </Text>
                          </View>
                        )}
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Exclusive Drops */}
          {rewards.exclusiveDrops.length > 0 && (
            <View style={styles.exclusiveDropsContainer}>
              <Text style={styles.subsectionTitle}>Exclusive Product Drops</Text>
              {rewards.exclusiveDrops.map((drop) => {
                const dropTierConfig = TIER_CONFIGS[drop.requiredTier];
                const isUnlocked = drop.unlocked;

                return (
                  <Card key={drop.id} style={styles.exclusiveDropCard}>
                    <View style={styles.exclusiveDropContent}>
                      <View style={styles.exclusiveDropImageContainer}>
                        <Ionicons
                          name={isUnlocked ? "gift" : "lock-closed"}
                          size={40}
                          color={isUnlocked ? dropTierConfig.color.primary : "#6a6a6a"}
                        />
                      </View>
                      <View style={styles.exclusiveDropInfo}>
                        <Text style={styles.exclusiveDropName}>{drop.name}</Text>
                        <Text style={styles.exclusiveDropTier}>
                          {isUnlocked ? "Available" : `Requires ${dropTierConfig.name}`}
                        </Text>
                        <Text style={styles.exclusiveDropQuantity}>
                          {drop.availableQuantity} / {drop.totalQuantity} remaining
                        </Text>
                      </View>
                      {isUnlocked && (
                        <TouchableOpacity style={styles.viewDropButton}>
                          <Text style={styles.viewDropButtonText}>View</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </Card>
                );
              })}
            </View>
          )}

          {/* Token Pre-Launch Teaser */}
          <Card style={styles.tokenTeaserCard}>
            <LinearGradient
              colors={["#FBBF24", "#F97316", "#EA580C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tokenTeaserGradient}
            >
              <View style={styles.tokenTeaserContent}>
                <Ionicons name="rocket" size={48} color="#FFFFFF" />
                <Text style={styles.tokenTeaserTitle}>Token Launch Coming Soon</Text>
                <Text style={styles.tokenTeaserText}>
                  Your {rewards.tokenCredits.toLocaleString()} credits will convert to tokens at
                  launch
                </Text>
                <Text style={styles.tokenTeaserSubtext}>
                  Higher tiers = Better conversion rate
                </Text>
              </View>
            </LinearGradient>
          </Card>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Tier Upgrade Celebration Modal */}
      <Modal
        visible={showUpgradeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={dismissUpgradeModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ scale }],
                opacity,
              },
            ]}
          >
            {upgradeEvent && (
              <>
                <LinearGradient
                  colors={TIER_CONFIGS[upgradeEvent.toTier].color.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.upgradeModalGradient}
                >
                  {/* Sparkles */}
                  {sparkleAnims.map((anim, index) => {
                    const angle = (index * 360) / sparkleAnims.length;
                    const radius = 120;
                    const x = Math.cos((angle * Math.PI) / 180) * radius;
                    const y = Math.sin((angle * Math.PI) / 180) * radius;

                    const sparkleOpacity = anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    });

                    const sparkleScale = anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1.5],
                    });

                    return (
                      <Animated.View
                        key={index}
                        style={[
                          styles.sparkle,
                          {
                            transform: [
                              { translateX: x },
                              { translateY: y },
                              { scale: sparkleScale },
                            ],
                            opacity: sparkleOpacity,
                          },
                        ]}
                      >
                        <Ionicons name="star" size={16} color="#FCD34D" />
                      </Animated.View>
                    );
                  })}

                  <View style={styles.upgradeModalContent}>
                    <Ionicons name="trophy" size={64} color="#FFFFFF" />
                    <Text style={styles.upgradeModalTitle}>Tier Upgraded!</Text>
                    <Text style={styles.upgradeModalSubtitle}>
                      {TIER_CONFIGS[upgradeEvent.fromTier].name} →{" "}
                      {TIER_CONFIGS[upgradeEvent.toTier].name}
                    </Text>

                    <View style={styles.upgradeRewards}>
                      <View style={styles.upgradeRewardItem}>
                        <Ionicons name="star" size={24} color="#FCD34D" />
                        <Text style={styles.upgradeRewardText}>
                          +{upgradeEvent.bonusPoints.toLocaleString()} Bonus Points
                        </Text>
                      </View>

                      <Text style={styles.unlockedFeaturesTitle}>Unlocked Features:</Text>
                      {upgradeEvent.unlockedFeatures.map((feature, index) => (
                        <View key={index} style={styles.unlockedFeatureItem}>
                          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                          <Text style={styles.unlockedFeatureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>

                    <TouchableOpacity
                      style={styles.upgradeModalButton}
                      onPress={dismissUpgradeModal}
                    >
                      <Text style={styles.upgradeModalButtonText}>Awesome!</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
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
  scrollContent: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 16,
  },
  summarySection: {
    padding: 16,
  },
  tierBadgeContainer: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  tierBadgeContent: {
    alignItems: "center",
  },
  tierIconContainer: {
    marginBottom: 12,
  },
  tierName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  tierBadgeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    letterSpacing: 2,
  },
  pointsCard: {
    marginBottom: 16,
  },
  pointsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  pointsColumn: {
    alignItems: "center",
  },
  pointsLabel: {
    fontSize: 12,
    color: "#a0a0a0",
    marginBottom: 8,
  },
  pointsAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
  },
  tokenCredits: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FBBF24",
    marginBottom: 4,
  },
  tokenSubtext: {
    fontSize: 10,
    color: "#a0a0a0",
    fontStyle: "italic",
  },
  progressCard: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    color: "#a0a0a0",
    marginBottom: 4,
  },
  progressAmount: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: "700",
    color: "#8b5cf6",
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: "#2a2a2a",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressCurrent: {
    fontSize: 12,
    color: "#a0a0a0",
  },
  progressTarget: {
    fontSize: 12,
    color: "#a0a0a0",
  },
  multiplierCard: {
    marginBottom: 16,
  },
  multiplierContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  multiplierInfo: {
    flex: 1,
  },
  multiplierLabel: {
    fontSize: 14,
    color: "#a0a0a0",
    marginBottom: 4,
  },
  multiplierValue: {
    fontSize: 28,
    fontWeight: "700",
  },
  tabsSection: {
    marginTop: 8,
  },
  tabButtons: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    gap: 8,
  },
  tabButtonActive: {
    borderColor: "#8b5cf6",
    backgroundColor: "#8b5cf610",
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6a6a6a",
  },
  tabContent: {
    paddingHorizontal: 16,
  },
  specialRewardsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 12,
  },
  mysteryBoxesContainer: {
    marginBottom: 24,
  },
  mysteryBoxesScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  mysteryBoxCard: {
    width: 160,
    marginRight: 12,
  },
  mysteryBoxGradient: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    minHeight: 200,
    justifyContent: "center",
  },
  lockedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  lockedText: {
    color: "#6a6a6a",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  openedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  openedText: {
    color: "#22c55e",
    fontSize: 12,
    marginTop: 8,
    fontWeight: "600",
  },
  mysteryBoxTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },
  mysteryBoxRarity: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    marginTop: 4,
    textTransform: "uppercase",
  },
  openButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  openButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  mysteryBoxHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  mysteryBoxesContent: {
    paddingRight: 16,
  },
  boxCorner: {
    position: "absolute",
    width: 12,
    height: 12,
    borderColor: "#ffffff",
    borderWidth: 2,
  },
  boxCornerTL: {
    top: 8,
    left: 8,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  boxCornerTR: {
    top: 8,
    right: 8,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  boxCornerBL: {
    bottom: 8,
    left: 8,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  boxCornerBR: {
    bottom: 8,
    right: 8,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  lockIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  mysteryBoxContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  mysteryBoxIcon: {
    marginBottom: 16,
  },
  mysteryBoxInfo: {
    alignItems: "center",
    marginBottom: 12,
  },
  rarityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  rarityBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#ffffff",
    textTransform: "uppercase",
  },
  openButtonContainer: {
    marginTop: 12,
    width: "100%",
    alignItems: "center",
  },
  openButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  openButtonInnerText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
  },
  tierRequirement: {
    marginTop: 8,
    paddingHorizontal: 8,
  },
  tierRequirementText: {
    fontSize: 11,
    color: "#a0a0a0",
    textAlign: "center",
    lineHeight: 16,
  },
  exclusiveDropsContainer: {
    marginBottom: 24,
  },
  exclusiveDropCard: {
    marginBottom: 12,
  },
  exclusiveDropContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  exclusiveDropImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
  },
  exclusiveDropInfo: {
    flex: 1,
  },
  exclusiveDropName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  exclusiveDropTier: {
    fontSize: 12,
    color: "#a0a0a0",
    marginBottom: 4,
  },
  exclusiveDropQuantity: {
    fontSize: 12,
    color: "#8b5cf6",
  },
  viewDropButton: {
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewDropButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  tokenTeaserCard: {
    marginBottom: 16,
    overflow: "hidden",
  },
  tokenTeaserGradient: {
    padding: 24,
    alignItems: "center",
  },
  tokenTeaserContent: {
    alignItems: "center",
  },
  tokenTeaserTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
  },
  tokenTeaserText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 4,
  },
  tokenTeaserSubtext: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: width - 40,
    maxWidth: 400,
    borderRadius: 24,
    overflow: "hidden",
  },
  upgradeModalGradient: {
    padding: 32,
    alignItems: "center",
    position: "relative",
  },
  sparkle: {
    position: "absolute",
    top: "50%",
    left: "50%",
  },
  upgradeModalContent: {
    alignItems: "center",
    zIndex: 1,
  },
  upgradeModalTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
  },
  upgradeModalSubtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 24,
  },
  upgradeRewards: {
    width: "100%",
    marginTop: 16,
  },
  upgradeRewardItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 12,
  },
  upgradeRewardText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  unlockedFeaturesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
    textAlign: "center",
  },
  unlockedFeatureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  unlockedFeatureText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  upgradeModalButton: {
    marginTop: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  upgradeModalButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
