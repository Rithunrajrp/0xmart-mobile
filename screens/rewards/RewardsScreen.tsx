import ExclusiveDropsSection from '@/components/rewards/ExclusiveDropsSection';
import MysteryBoxGrid from '@/components/rewards/MysteryBoxGrid';
import PurchaseRewardsTab from '@/components/rewards/PurchaseRewardsTab';
import ReferralRewardsTab from '@/components/rewards/ReferralRewardsTab';
import SubscriptionRewardsTab from '@/components/rewards/SubscriptionRewardsTab';
import TierUpgradeModal from '@/components/rewards/TierUpgradeModal';
import { TIER_CONFIGS, getProgressToNextTier } from '@/config/tier-config';
import { useRewardsStore } from '@/store/rewards-store';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

type TabType = 'purchase' | 'referral' | 'subscription';

export default function RewardsScreen() {
  const {
    rewards,
    loading,
    fetchRewards,
    showUpgradeModal,
    upgradeEvent,
    dismissUpgradeModal,
  } = useRewardsStore();

  const [activeTab, setActiveTab] = useState<TabType>('purchase');
  const [glowAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchRewards();

    // Pulsing glow animation for tier badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  if (loading || !rewards) {
    return (
      <View className="flex-1 bg-gray-950 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-white mt-4">Loading rewards...</Text>
      </View>
    );
  }

  const tierConfig = TIER_CONFIGS[rewards.currentTier];
  const progress = getProgressToNextTier(rewards.totalSpent, rewards.currentTier);

  const handleTabPress = (tab: TabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header with Tier Badge */}
        <LinearGradient
          colors={tierConfig.color.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="pt-16 pb-8 px-6 rounded-b-3xl"
        >
          {/* Tier Name & Badge */}
          <View className="items-center mb-6">
            <Animated.View
              style={{
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.6, 1],
                }),
                transform: [
                  {
                    scale: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.05],
                    }),
                  },
                ],
              }}
            >
              <View className="bg-white/20 backdrop-blur-lg rounded-full px-8 py-4 border-2 border-white/40">
                <Text className="text-white text-2xl font-bold tracking-wider font-PlayfairDisplay-Bold">
                  {tierConfig.name}
                </Text>
              </View>
            </Animated.View>

            <Text className="text-white/90 text-sm mt-2 font-medium font-Inter-Medium">
              Your Current Membership Tier
            </Text>
          </View>

          {/* Points & Credits Row */}
          <View className="flex-row justify-around mb-6">
            <View className="items-center">
              <View className="bg-white/20 backdrop-blur-lg rounded-2xl px-6 py-3 border border-white/30">
                <Text className="text-white/80 text-xs font-semibold mb-1 font-Inter-SemiBold">POINTS</Text>
                <Text className="text-white text-2xl font-bold font-Inter-Bold">
                  {rewards.currentPoints.toLocaleString()}
                </Text>
              </View>
            </View>

            <View className="items-center">
              <View className="bg-white/20 backdrop-blur-lg rounded-2xl px-6 py-3 border border-white/30">
                <Text className="text-white/80 text-xs font-semibold mb-1 font-Inter-SemiBold">CREDITS</Text>
                <Text className="text-white text-2xl font-bold font-Inter-Bold">
                  {rewards.tokenCredits.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Token Launch Teaser */}
          <View className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 mb-6">
            <View className="flex-row items-center">
              <Ionicons name="flash" size={20} color="#FCD34D" />
              <Text className="text-white text-sm font-semibold ml-2 font-Inter-SemiBold">
                Credits converting to token soon!
              </Text>
            </View>
            <Text className="text-white/80 text-xs mt-1 font-Inter-Regular">
              Your credits will convert to 0xMart tokens at launch
            </Text>
          </View>

          {/* Progress to Next Tier */}
          {progress.nextTier && (
            <View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-white/90 text-sm font-semibold font-Inter-SemiBold">
                  Progress to {TIER_CONFIGS[progress.nextTier].name}
                </Text>
                <Text className="text-white/80 text-xs font-Inter-Regular">
                  ${progress.spendNeeded.toLocaleString()} to go
                </Text>
              </View>

              {/* Progress Bar */}
              <View className="bg-white/20 h-3 rounded-full overflow-hidden backdrop-blur-sm">
                <View
                  className="bg-white h-full rounded-full"
                  style={{ width: `${progress.progressPercent}%` }}
                />
              </View>

              <Text className="text-white/70 text-xs mt-1 text-right font-Inter-Regular">
                {progress.progressPercent.toFixed(0)}% complete
              </Text>
            </View>
          )}

          {progress.nextTier === null && (
            <View className="bg-white/20 backdrop-blur-lg rounded-2xl p-4 border border-white/40">
              <View className="flex-row items-center justify-center">
                <Ionicons name="trophy" size={24} color="#FCD34D" />
                <Text className="text-white text-base font-bold ml-2 font-Inter-Bold">
                  Maximum Tier Reached! 🎉
                </Text>
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Tab Selector */}
        <View className="px-6 mt-6">
          <View className="bg-gray-100 rounded-2xl p-1 flex-row border border-gray-200">
            <TouchableOpacity
              onPress={() => handleTabPress('purchase')}
              className={`flex-1 py-3 rounded-xl ${
                activeTab === 'purchase' ? 'bg-white shadow-sm' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-center font-semibold text-sm font-Inter-Medium ${
                  activeTab === 'purchase' ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                Purchases
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleTabPress('referral')}
              className={`flex-1 py-3 rounded-xl ${
                activeTab === 'referral' ? 'bg-white shadow-sm' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-center font-semibold text-sm font-Inter-Medium ${
                  activeTab === 'referral' ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                Referrals
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleTabPress('subscription')}
              className={`flex-1 py-3 rounded-xl ${
                activeTab === 'subscription' ? 'bg-white shadow-sm' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-center font-semibold text-sm font-Inter-Medium ${
                  activeTab === 'subscription' ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                Subscription
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Content */}
        <View className="px-6 mt-6">
          {activeTab === 'purchase' && (
            <PurchaseRewardsTab
              stats={rewards.purchaseRewards}
              currentMultiplier={tierConfig.pointMultiplier}
            />
          )}
          {activeTab === 'referral' && (
            <ReferralRewardsTab stats={rewards.referralRewards} />
          )}
          {activeTab === 'subscription' && (
            <SubscriptionRewardsTab
              stats={rewards.subscriptionRewards}
              currentTier={rewards.currentTier}
            />
          )}
        </View>

        {/* Mystery Boxes */}
        <View className="px-6 mt-8">
          <Text className="text-gray-900 text-xl font-bold mb-4 font-PlayfairDisplay-Bold">Mystery Boxes</Text>
          <MysteryBoxGrid boxes={rewards.mysteryBoxes} currentTier={rewards.currentTier} />
        </View>

        {/* Exclusive Drops */}
        {tierConfig.exclusiveDrops && (
          <View className="px-6 mt-8">
            <Text className="text-gray-900 text-xl font-bold mb-4 font-PlayfairDisplay-Bold">Exclusive Drops</Text>
            <ExclusiveDropsSection
              drops={rewards.exclusiveDrops}
              currentTier={rewards.currentTier}
            />
          </View>
        )}

        {/* Tier Benefits */}
        <View className="px-6 mt-8 mb-6">
          <Text className="text-gray-900 text-xl font-bold mb-4 font-PlayfairDisplay-Bold">Your Benefits</Text>
          <View className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            {tierConfig.benefits.map((benefit, index) => (
              <View key={index} className="flex-row items-start mb-3">
                <Ionicons name="checkmark-circle" size={20} color={tierConfig.color.primary} />
                <Text className="text-gray-700 text-sm ml-3 flex-1 font-Inter-Regular">{benefit}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Tier Upgrade Modal */}
      {showUpgradeModal && upgradeEvent && (
        <TierUpgradeModal
          visible={showUpgradeModal}
          upgradeEvent={upgradeEvent}
          onClose={dismissUpgradeModal}
        />
      )}
    </View>
  );
}
