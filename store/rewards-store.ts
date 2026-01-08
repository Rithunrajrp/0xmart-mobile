import { create } from 'zustand';
import {
  UserRewards,
  MembershipTier,
  TierUpgradeEvent,
  MysteryBox,
  ExclusiveDrop,
} from '@/types/rewards';
import { getTierFromSpend, TIER_CONFIGS, TIER_ORDER } from '@/config/tier-config';
import api from '@/api';

// Helper function to check if user tier meets requirement
function tierMeetsRequirement(userTier: MembershipTier, requiredTier: MembershipTier): boolean {
  const userTierIndex = TIER_ORDER.indexOf(userTier);
  const requiredTierIndex = TIER_ORDER.indexOf(requiredTier);
  return userTierIndex >= requiredTierIndex;
}

interface RewardsStore {
  rewards: UserRewards | null;
  loading: boolean;
  error: string | null;
  showUpgradeModal: boolean;
  upgradeEvent: TierUpgradeEvent | null;

  // Actions
  fetchRewards: () => Promise<void>;
  addPurchase: (amount: number, points: number) => void;
  checkTierUpgrade: () => TierUpgradeEvent | null;
  showUpgradeAnimation: (event: TierUpgradeEvent) => void;
  dismissUpgradeModal: () => void;
  openMysteryBox: (boxId: string) => Promise<void>;
  claimReferralReward: () => Promise<void>;
  subscribeToTier: (tier: 'BASIC' | 'PREMIUM' | 'ULTIMATE') => Promise<void>;
}

export const useRewardsStore = create<RewardsStore>((set, get) => ({
  rewards: null,
  loading: false,
  error: null,
  showUpgradeModal: false,
  upgradeEvent: null,

  fetchRewards: async () => {
    try {
      set({ loading: true, error: null });

      // Fetch user data, rewards, and statistics from backend
      const [userProfile, userStats, rewardsResponse, rewardStats] = await Promise.all([
        api.getUserProfile(), // This has totalSpent, totalReferrals, referralCode, subscriptionTier
        api.getUserStats(),   // This has balance, wallets, etc
        api.getMyRewards(),
        api.getRewardStatistics(),
      ]);

      // Calculate total spent from user profile
      const totalSpent = parseFloat(userProfile.totalSpent?.toString() || '0');

      // Determine tier based on total spend
      const currentTier = getTierFromSpend(totalSpent);

      // Calculate purchase rewards from backend data
      const purchaseRewards = rewardsResponse.rewards.filter((r: any) =>
        r.type === 'PURCHASE' || r.type === 'FIRST_PURCHASE'
      );
      const purchasePointsEarned = purchaseRewards.reduce((sum: number, r: any) => sum + r.points, 0);

      // Calculate referral rewards
      const referralRewards = rewardsResponse.rewards.filter((r: any) => r.type === 'REFERRAL');
      const referralPointsEarned = referralRewards.reduce((sum: number, r: any) => sum + r.points, 0);

      // Transform backend data to mobile app structure
      const transformedRewards: UserRewards = {
        currentTier,
        totalSpent,
        currentPoints: rewardsResponse.totalPoints || 0,
        tokenCredits: rewardStats.totalPoints || 0,
        purchaseRewards: {
          totalPurchases: purchaseRewards.length,
          pointsEarned: purchasePointsEarned,
          currentMultiplier: TIER_CONFIGS[currentTier]?.pointMultiplier || 1.0,
          milestones: [
            {
              id: 'm1',
              title: 'First Purchase',
              description: 'Complete your first purchase',
              targetAmount: 1,
              currentAmount: purchaseRewards.length,
              reward: '100 bonus points',
              unlocked: purchaseRewards.length >= 1,
            },
            {
              id: 'm2',
              title: 'Shopping Spree',
              description: 'Make 50 purchases',
              targetAmount: 50,
              currentAmount: purchaseRewards.length,
              reward: 'Mystery Box',
              unlocked: purchaseRewards.length >= 50,
            },
            {
              id: 'm3',
              title: 'Shopping Champion',
              description: 'Make 100 purchases',
              targetAmount: 100,
              currentAmount: purchaseRewards.length,
              reward: 'Exclusive Drop Access',
              unlocked: purchaseRewards.length >= 100,
            },
          ],
        },
        referralRewards: {
          totalReferrals: userProfile.totalReferrals || 0,
          successfulReferrals: Math.floor((userProfile.totalReferrals || 0) * 0.6), // Approximate successful referrals
          pointsEarned: referralPointsEarned,
          currentStreak: Math.min(userProfile.totalReferrals || 0, 5), // Max streak of 5
          referralCode: userProfile.referralCode || 'OXMART-XXXX',
          leaderboardRank: undefined,
          streakBonuses: [
            {
              level: 1,
              referralsNeeded: 3,
              bonusMultiplier: 1.2,
              unlocked: (userProfile.totalReferrals || 0) >= 3,
            },
            {
              level: 2,
              referralsNeeded: 5,
              bonusMultiplier: 1.5,
              unlocked: (userProfile.totalReferrals || 0) >= 5,
            },
            {
              level: 3,
              referralsNeeded: 10,
              bonusMultiplier: 2.0,
              unlocked: (userProfile.totalReferrals || 0) >= 10,
            },
          ],
        },
        subscriptionRewards: {
          isSubscribed: userProfile.subscriptionTier !== 'free',
          subscriptionTier: userProfile.subscriptionTier === 'free' ? undefined : userProfile.subscriptionTier?.toUpperCase() as 'BASIC' | 'PREMIUM' | 'ULTIMATE' | undefined,
          bonusPoints: userProfile.subscriptionTier === 'free' ? 0 : 500,
          multiplier: userProfile.subscriptionTier === 'free' ? 1.0 : 1.5,
          tierProgressBoost: userProfile.subscriptionTier === 'free' ? 0 : 20,
        },
        mysteryBoxes: [
          {
            id: 'box1',
            title: 'Starter Mystery Box',
            requiredTier: MembershipTier.NODE_RUNNER,
            requiredPoints: 500,
            unlocked: tierMeetsRequirement(currentTier, MembershipTier.NODE_RUNNER) && rewardsResponse.totalPoints >= 500,
            opened: false,
            rarity: 'COMMON',
            potentialRewards: ['100-500 points', 'Discount codes', 'Free shipping voucher'],
          },
          {
            id: 'box2',
            title: 'Master Node Box',
            requiredTier: MembershipTier.MASTER_NODE,
            requiredPoints: 2000,
            unlocked: tierMeetsRequirement(currentTier, MembershipTier.MASTER_NODE) && rewardsResponse.totalPoints >= 2000,
            opened: false,
            rarity: 'RARE',
            potentialRewards: ['500-1500 points', 'Exclusive products', 'Tier boost'],
          },
          {
            id: 'box3',
            title: 'Whale Treasure',
            requiredTier: MembershipTier.WHALE,
            requiredPoints: 5000,
            unlocked: tierMeetsRequirement(currentTier, MembershipTier.WHALE) && rewardsResponse.totalPoints >= 5000,
            opened: false,
            rarity: 'EPIC',
            potentialRewards: ['2000-5000 points', 'Limited drops', 'Token bonus'],
          },
          {
            id: 'box4',
            title: 'Supernova Vault',
            requiredTier: MembershipTier.SUPERNOVA,
            requiredPoints: 10000,
            unlocked: tierMeetsRequirement(currentTier, MembershipTier.SUPERNOVA) && rewardsResponse.totalPoints >= 10000,
            opened: false,
            rarity: 'LEGENDARY',
            potentialRewards: ['5000-15000 points', 'Rare collectibles', 'VIP access'],
          },
        ],
        exclusiveDrops: [], // Exclusive drops would be populated from a separate backend endpoint
      };

      set({ rewards: transformedRewards, loading: false });
    } catch (error: any) {
      console.error('[Rewards Store] Error fetching rewards:', error);
      console.error('[Rewards Store] Error details:', error.response?.data || error.message);
      set({ error: error.response?.data?.message || error.message || 'Failed to fetch rewards', loading: false });
    }
  },

  addPurchase: (amount: number, points: number) => {
    const { rewards } = get();
    if (!rewards) return;

    const newTotalSpent = rewards.totalSpent + amount;
    const oldTier = rewards.currentTier;
    const newTier = getTierFromSpend(newTotalSpent);

    // Check for tier upgrade before updating
    const tierUpgraded = newTier !== oldTier;
    let upgradeEvent: TierUpgradeEvent | null = null;

    if (tierUpgraded) {
      upgradeEvent = {
        fromTier: oldTier,
        toTier: newTier,
        totalSpent: newTotalSpent,
        bonusPoints: 1000, // Bonus points for tier upgrade
        unlockedFeatures: ['Higher point multiplier', 'New mystery boxes', 'Exclusive drops'],
      };
    }

    // Update rewards with new tier and purchase data
    const tierConfig = TIER_CONFIGS[newTier];
    
    // Update mystery boxes and exclusive drops based on new tier
    const updatedMysteryBoxes = rewards.mysteryBoxes.map((box) => ({
      ...box,
      unlocked: tierMeetsRequirement(newTier, box.requiredTier),
    }));

    const updatedExclusiveDrops = rewards.exclusiveDrops.map((drop) => ({
      ...drop,
      unlocked: tierMeetsRequirement(newTier, drop.requiredTier),
    }));

    set({
      rewards: {
        ...rewards,
        currentTier: newTier, // Update tier immediately
        totalSpent: newTotalSpent,
        currentPoints: rewards.currentPoints + points + (tierUpgraded ? upgradeEvent!.bonusPoints : 0),
        purchaseRewards: {
          ...rewards.purchaseRewards,
          totalPurchases: rewards.purchaseRewards.totalPurchases + 1,
          pointsEarned: rewards.purchaseRewards.pointsEarned + points,
          currentMultiplier: tierConfig.pointMultiplier,
        },
        mysteryBoxes: updatedMysteryBoxes,
        exclusiveDrops: updatedExclusiveDrops,
      },
    });

    // Show upgrade animation if tier upgraded
    if (tierUpgraded && upgradeEvent) {
      get().showUpgradeAnimation(upgradeEvent);
    }
  },

  checkTierUpgrade: () => {
    const { rewards } = get();
    if (!rewards) return null;

    const newTier = getTierFromSpend(rewards.totalSpent);
    if (newTier !== rewards.currentTier) {
      return {
        fromTier: rewards.currentTier,
        toTier: newTier,
        totalSpent: rewards.totalSpent,
        bonusPoints: 1000, // Bonus points for tier upgrade
        unlockedFeatures: ['Higher point multiplier', 'New mystery boxes', 'Exclusive drops'],
      };
    }
    return null;
  },

  showUpgradeAnimation: (event: TierUpgradeEvent) => {
    // Tier and points already updated in addPurchase, just show modal
    set({
      showUpgradeModal: true,
      upgradeEvent: event,
    });
  },

  dismissUpgradeModal: () => {
    set({ showUpgradeModal: false, upgradeEvent: null });
  },

  openMysteryBox: async (boxId: string) => {
    try {
      // TODO: API call to open mystery box
      // const response = await api.post(`/rewards/mystery-boxes/${boxId}/open`);

      const { rewards } = get();
      if (!rewards) return;

      const updatedBoxes = rewards.mysteryBoxes.map((box) =>
        box.id === boxId ? { ...box, opened: true } : box
      );

      set({
        rewards: {
          ...rewards,
          mysteryBoxes: updatedBoxes,
        },
      });
    } catch (error) {
      console.error('Failed to open mystery box:', error);
    }
  },

  claimReferralReward: async () => {
    try {
      // TODO: API call to claim referral reward
      // await api.post('/rewards/referrals/claim');
    } catch (error) {
      console.error('Failed to claim referral reward:', error);
    }
  },

  subscribeToTier: async (tier: 'BASIC' | 'PREMIUM' | 'ULTIMATE') => {
    try {
      // TODO: API call to subscribe
      // await api.post('/rewards/subscribe', { tier });

      const { rewards } = get();
      if (!rewards) return;

      const multipliers = {
        BASIC: { multiplier: 1.2, boost: 10 },
        PREMIUM: { multiplier: 1.5, boost: 25 },
        ULTIMATE: { multiplier: 2.0, boost: 50 },
      };

      const { multiplier, boost } = multipliers[tier];

      set({
        rewards: {
          ...rewards,
          subscriptionRewards: {
            isSubscribed: true,
            subscriptionTier: tier,
            bonusPoints: 500,
            multiplier,
            tierProgressBoost: boost,
          },
        },
      });
    } catch (error) {
      console.error('Failed to subscribe:', error);
    }
  },
}));
