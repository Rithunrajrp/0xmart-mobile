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

      // TODO: Replace with actual API call
      // const response = await api.get('/rewards/me');

      // Mock data for demo
      const mockRewards: UserRewards = {
        currentTier: MembershipTier.MASTER_NODE,
        totalSpent: 2500,
        currentPoints: 3750,
        tokenCredits: 12500,
        purchaseRewards: {
          totalPurchases: 47,
          pointsEarned: 3200,
          currentMultiplier: 1.5,
          milestones: [
            {
              id: 'm1',
              title: 'First Purchase',
              description: 'Complete your first purchase',
              targetAmount: 1,
              currentAmount: 47,
              reward: '100 bonus points',
              unlocked: true,
            },
            {
              id: 'm2',
              title: 'Shopping Spree',
              description: 'Make 50 purchases',
              targetAmount: 50,
              currentAmount: 47,
              reward: 'Mystery Box',
              unlocked: false,
            },
          ],
        },
        referralRewards: {
          totalReferrals: 8,
          successfulReferrals: 5,
          pointsEarned: 550,
          currentStreak: 3,
          referralCode: 'OXMART-2K9X',
          leaderboardRank: 42,
          streakBonuses: [
            {
              level: 1,
              referralsNeeded: 3,
              bonusMultiplier: 1.2,
              unlocked: true,
            },
            {
              level: 2,
              referralsNeeded: 5,
              bonusMultiplier: 1.5,
              unlocked: true,
            },
            {
              level: 3,
              referralsNeeded: 10,
              bonusMultiplier: 2.0,
              unlocked: false,
            },
          ],
        },
        subscriptionRewards: {
          isSubscribed: false,
          bonusPoints: 0,
          multiplier: 1.0,
          tierProgressBoost: 0,
        },
        mysteryBoxes: [
          {
            id: 'box1',
            title: 'Starter Mystery Box',
            requiredTier: MembershipTier.NODE_RUNNER,
            requiredPoints: 500,
            unlocked: true,
            opened: true,
            rarity: 'COMMON',
            potentialRewards: ['100-500 points', 'Discount codes', 'Free shipping voucher'],
          },
          {
            id: 'box2',
            title: 'Master Node Box',
            requiredTier: MembershipTier.MASTER_NODE,
            unlocked: true,
            opened: false,
            rarity: 'RARE',
            potentialRewards: ['500-1500 points', 'Exclusive products', 'Tier boost'],
          },
          {
            id: 'box3',
            title: 'Whale Treasure',
            requiredTier: MembershipTier.WHALE,
            unlocked: false,
            opened: false,
            rarity: 'EPIC',
            potentialRewards: ['2000-5000 points', 'Limited drops', 'Token bonus'],
          },
        ],
        exclusiveDrops: [
          {
            id: 'drop1',
            productId: 'prod123',
            name: 'Limited Edition Smart Watch',
            imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
            requiredTier: MembershipTier.WHALE,
            availableQuantity: 15,
            totalQuantity: 50,
            launchDate: new Date('2025-12-15'),
            unlocked: false,
          },
        ],
      };

      set({ rewards: mockRewards, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
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
