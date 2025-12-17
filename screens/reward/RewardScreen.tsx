import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    Modal,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PurchaseRewardsTab from "../../components/rewards/PurchaseRewardsTab";
import ReferralRewardsTab from "../../components/rewards/ReferralRewardsTab";
import SubscriptionRewardsTab from "../../components/rewards/SubscriptionRewardsTab";
import { Card } from "../../components/ui/Card";
import { TIER_CONFIGS, getNextTier, getProgressToNextTier } from "../../config/tier-config";
import { useRewardsStore } from "../../store/rewards-store";
import { MembershipTier } from "../../types/rewards";

const { width } = Dimensions.get("window");

type TabType = "purchase" | "referral" | "subscription";

export default function RewardScreen() {
  const router = useRouter();
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
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [newTier, setNewTier] = useState<MembershipTier | null>(null);
  const [celebrationAnim] = useState(new Animated.Value(0));
  const [sparkleAnims] = useState(
    Array.from({ length: 12 }, () => new Animated.Value(0))
  );

  // Animation values
  const progressAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rewards</Text>
          <View style={{ width: 24 }} />
        </View>
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rewards</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Summary Section */}
        <View style={styles.summarySection}>
          {/* Tier Badge with Gradient */}
          <LinearGradient
            colors={tierConfig.color.gradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tierBadgeContainer}
          >
            <View style={styles.tierTopRow}>
                <View style={styles.tierIconContainer}>
                    <Ionicons
                    name="diamond"
                    size={28}
                    color={tierConfig.color.primary === "#FFFFFF" ? "#FCD34D" : "#FFFFFF"}
                    />
                </View>
                <Text style={styles.tierNumber}>LVL {rewards.currentTier}</Text>
            </View>
            
            <View>
                <Text style={styles.tierName}>{tierConfig.name}</Text>
                <Text style={styles.tierBadgeLabel}>0XMART MEMBER</Text>
            </View>
          </LinearGradient>

          {/* Stats Row (Points & Credits) */}
          <View style={styles.statsRow}>
            {/* Points Stat */}
            <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total Points</Text>
                <View style={styles.statValueContainer}>
                    <Text style={styles.statValue}>
                        {rewards.currentPoints.toLocaleString()}
                    </Text>
                    <Ionicons name="sparkles" size={12} color="#FBBF24" />
                </View>
                <Text style={styles.statSubtext}>{tierConfig.pointMultiplier}x Multiplier Active</Text>
            </View>

            {/* Credits Stat */}
             <View style={styles.statCard}>
                <Text style={styles.statLabel}>Token Credits</Text>
                <View style={styles.statValueContainer}>
                    <Text style={styles.statValue}>
                        {rewards.tokenCredits.toLocaleString()}
                    </Text>
                </View>
                <Text style={styles.statSubtext}>Pre-launch Accrual</Text>
            </View>
          </View>

          {/* Progress to Next Tier */}
          {nextTierConfig && (
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <View>
                  <Text style={styles.progressLabel}>Next Tier: {nextTierConfig.name}</Text>
                  <Text style={styles.progressAmount}>
                    ${progress.spendNeeded.toLocaleString()} to go
                  </Text>
                </View>
                <Text style={styles.progressPercent}>
                  {Math.round(progress.progressPercent)}%
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <LinearGradient
                    colors={nextTierConfig.color.gradient as any}
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
                  ${rewards.totalSpent.toLocaleString()} / ${nextTierConfig.minSpend.toLocaleString()}
                </Text>
              </View>
            </View>
          )}
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
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === "purchase" && styles.activeTabText,
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
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === "referral" && styles.activeTabText,
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
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === "subscription" && styles.activeTabText,
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
                          : (boxTierConfig.color.gradient as any)
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
                  colors={TIER_CONFIGS[upgradeEvent.toTier].color.gradient as any}
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
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#6B7280",
    fontSize: 16,
    marginTop: 12,
    fontFamily: "Inter-Medium",
  },
  // New Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "700",
    color: "#111827",
    fontFamily: "PlayfairDisplay-Bold",
    letterSpacing: -0.5,
  },
  summarySection: {
    padding: 20,
  },
  // Premium Tier Card
  tierBadgeContainer: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    minHeight: 180,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  tierBadgeContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  tierTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
  },
  tierIconContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 10,
    borderRadius: 16,
    backdropFilter: "blur(10px)",
  },
  tierName: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "PlayfairDisplay-Bold",
    letterSpacing: 0.5,
  },
  tierBadgeLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
    fontFamily: "Inter-Medium",
    letterSpacing: 1,
  },
  tierNumber: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.6)",
    fontFamily: "Inter-Mono",
  },
  // Stats Row
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  statLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
    fontFamily: "Inter-Medium",
  },
  statValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    fontFamily: "Inter-Bold",
    letterSpacing: -0.5,
  },
  statSubtext: {
    fontSize: 11,
    color: "#10B981", // Green for positive/active feel
    fontWeight: "600",
  },
  // Progress Section
  progressCard: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 4,
    fontFamily: "Inter-Medium",
  },
  progressAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    fontFamily: "Inter-SemiBold",
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: "700",
    color: "#8B5CF6",
    fontFamily: "Inter-Bold",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressBarBackground: {
    flex: 1,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressCurrent: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Inter-Regular",
  },
  progressTarget: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  // Tabs
  tabsSection: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  tabButtons: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    fontFamily: "Inter-SemiBold",
  },
  tabContent: {
    marginTop: 24,
  },
  // Sections
  specialRewardsSection: {
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    paddingHorizontal: 20,
    marginBottom: 16,
    fontFamily: "PlayfairDisplay-Bold",
  },
  // Mystery Boxes
  mysteryBoxesContainer: {
    marginBottom: 32,
  },
  mysteryBoxHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    fontFamily: "PlayfairDisplay-Bold",
  },
  mysteryBoxesScroll: {
    paddingLeft: 20,
  },
  mysteryBoxesContent: {
    paddingRight: 20,
    gap: 16,
    paddingBottom: 24, // Space for shadow
  },
  mysteryBoxCard: {
    width: 180,
    height: 240,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  mysteryBoxGradient: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
  },
  // Overlay Styles
  boxCorner: {
    display: "none", // Removing decorative corners for minimal look
  },
  boxCornerTL: {},
  boxCornerTR: {},
  boxCornerBL: {},
  boxCornerBR: {},
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backdropFilter: "blur(4px)",
  },
  lockIconContainer: {
    marginBottom: 12,
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 999,
  },
  lockedText: {
    color: "#6B7280",
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter-Medium",
  },
  openedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  openedText: {
    color: "#10B981",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
    fontFamily: "PlayfairDisplay-Bold",
  },
  mysteryBoxContent: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  mysteryBoxIcon: {
    marginBottom: 16,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  mysteryBoxInfo: {
    alignItems: "center",
    width: "100%",
  },
  mysteryBoxTitle: {
    color: "#111827", // Dark text for minimal look
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "PlayfairDisplay-Bold",
  },
  rarityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7", // Light yellow bg
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  rarityBadgeText: {
    color: "#D97706", // Dark yellow text
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontFamily: "Inter-Bold",
  },
  openButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    marginTop: 12,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  openButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "Inter-Bold",
  },
  tierRequirement: {
    marginTop: 8,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierRequirementText: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Inter-Medium",
  },
  // Exclusive Drops
  exclusiveDropsContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  exclusiveDropCard: {
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    overflow: "hidden",
  },
  exclusiveDropContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  exclusiveDropImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  exclusiveDropInfo: {
    flex: 1,
  },
  exclusiveDropName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
    fontFamily: "Inter-SemiBold",
  },
  exclusiveDropTier: {
    fontSize: 13,
    color: "#8B5CF6",
    fontWeight: "600",
    marginBottom: 4,
    fontFamily: "Inter-Medium",
  },
  exclusiveDropQuantity: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Inter-Regular",
  },
  viewDropButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  viewDropButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "Inter-Bold",
  },
  tokenTeaserCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 32,
  },
  tokenTeaserGradient: {
    padding: 24,
  },
  tokenTeaserContent: {
    alignItems: "center",
    gap: 12,
  },
  tokenTeaserTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: "PlayfairDisplay-Bold",
  },
  tokenTeaserText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    fontFamily: "Inter-Medium",
  },
  tokenTeaserSubtext: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 13,
    textAlign: "center",
    fontFamily: "Inter-Regular",
    marginTop: 4,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  activeTabText: {
    color: "#111827", // Or your primary color
  },
  modalContent: {
    width: Dimensions.get("window").width * 0.85,
    maxWidth: 360,
    borderRadius: 32,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  upgradeModalGradient: {
    padding: 32,
    alignItems: "center",
  },
  sparkle: {
    position: "absolute",
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  upgradeModalContent: {
    alignItems: "center",
    width: "100%",
  },
  upgradeModalTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "PlayfairDisplay-ExtraBold",
  },
  upgradeModalSubtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 32,
    textAlign: "center",
    fontWeight: "600",
  },
  upgradeRewards: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  upgradeRewardItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  upgradeRewardText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  unlockedFeaturesTitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 12,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 1,
  },
  unlockedFeatureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  unlockedFeatureText: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  upgradeModalButton: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  upgradeModalButtonText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800",
  },
});
