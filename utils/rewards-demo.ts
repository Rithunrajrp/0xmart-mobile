/**
 * Demo utilities for testing the Rewards System
 * Use these functions in development to simulate user actions
 */

import { useRewardsStore } from '@/store/rewards-store';
import { MembershipTier } from '@/types/rewards';

/**
 * Simulate a purchase to test tier upgrades
 * @param amount Purchase amount in USD
 */
export const simulatePurchase = (amount: number) => {
  const { addPurchase } = useRewardsStore.getState();
  const points = Math.floor(amount * 10); // 10 points per dollar base rate
  addPurchase(amount, points);
  console.log(`✅ Simulated purchase: $${amount} → ${points} points`);
};

/**
 * Simulate multiple purchases to reach a specific tier
 * @param targetTier The tier to reach
 */
export const reachTier = (targetTier: MembershipTier) => {
  const tierSpendRequirements = {
    [MembershipTier.NODE_RUNNER]: 0,
    [MembershipTier.MASTER_NODE]: 1000,
    [MembershipTier.WHALE]: 5000,
    [MembershipTier.SUPERNOVA]: 15000,
    [MembershipTier.GENESIS]: 50000,
  };

  const { rewards, addPurchase } = useRewardsStore.getState();
  if (!rewards) {
    console.error('❌ Rewards not loaded');
    return;
  }

  const targetSpend = tierSpendRequirements[targetTier];
  const currentSpend = rewards.totalSpent;
  const spendNeeded = targetSpend - currentSpend;

  if (spendNeeded <= 0) {
    console.log(`✅ Already at or above ${targetTier} tier`);
    return;
  }

  // Simulate the purchase
  const points = Math.floor(spendNeeded * 10);
  addPurchase(spendNeeded, points);
  console.log(`✅ Advanced to ${targetTier} tier (+$${spendNeeded})`);
};

/**
 * Reset rewards to Node Runner tier
 */
export const resetToNodeRunner = () => {
  const { rewards } = useRewardsStore.getState();
  if (rewards) {
    useRewardsStore.setState({
      rewards: {
        ...rewards,
        totalSpent: 0,
        currentTier: MembershipTier.NODE_RUNNER,
        currentPoints: 0,
      },
    });
    console.log('✅ Reset to Node Runner tier');
  }
};

/**
 * Add bonus points for testing
 * @param points Number of points to add
 */
export const addBonusPoints = (points: number) => {
  const { rewards } = useRewardsStore.getState();
  if (rewards) {
    useRewardsStore.setState({
      rewards: {
        ...rewards,
        currentPoints: rewards.currentPoints + points,
      },
    });
    console.log(`✅ Added ${points} bonus points`);
  }
};

/**
 * Simulate referral success
 * @param count Number of successful referrals to add
 */
export const addReferrals = (count: number) => {
  const { rewards } = useRewardsStore.getState();
  if (rewards) {
    const pointsPerReferral = 100;
    useRewardsStore.setState({
      rewards: {
        ...rewards,
        currentPoints: rewards.currentPoints + count * pointsPerReferral,
        referralRewards: {
          ...rewards.referralRewards,
          successfulReferrals: rewards.referralRewards.successfulReferrals + count,
          pointsEarned: rewards.referralRewards.pointsEarned + count * pointsPerReferral,
          currentStreak: rewards.referralRewards.currentStreak + count,
        },
      },
    });
    console.log(`✅ Added ${count} successful referrals (+${count * pointsPerReferral} points)`);
  }
};

/**
 * Simulate opening all available mystery boxes
 */
export const openAllMysteryBoxes = () => {
  const { rewards, openMysteryBox } = useRewardsStore.getState();
  if (rewards) {
    const unlockedBoxes = rewards.mysteryBoxes.filter((box) => box.unlocked && !box.opened);
    unlockedBoxes.forEach((box) => {
      openMysteryBox(box.id);
    });
    console.log(`✅ Opened ${unlockedBoxes.length} mystery boxes`);
  }
};

/**
 * Print current rewards status to console
 */
export const logRewardsStatus = () => {
  const { rewards } = useRewardsStore.getState();
  if (!rewards) {
    console.log('❌ No rewards data loaded');
    return;
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Current Rewards Status');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🏆 Tier: ${rewards.currentTier}`);
  console.log(`💰 Total Spent: $${rewards.totalSpent.toLocaleString()}`);
  console.log(`⭐ Points: ${rewards.currentPoints.toLocaleString()}`);
  console.log(`🪙 Token Credits: ${rewards.tokenCredits.toLocaleString()}`);
  console.log(`📦 Purchases: ${rewards.purchaseRewards.totalPurchases}`);
  console.log(`👥 Referrals: ${rewards.referralRewards.successfulReferrals}`);
  console.log(`🔥 Streak: ${rewards.referralRewards.currentStreak}`);
  console.log(`📊 Subscribed: ${rewards.subscriptionRewards.isSubscribed ? 'Yes' : 'No'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
};

/**
 * Demo script: Run through all tiers
 */
export const demoAllTiers = async () => {
  console.log('🎬 Starting tier upgrade demo...\n');

  const tiers = [
    MembershipTier.MASTER_NODE,
    MembershipTier.WHALE,
    MembershipTier.SUPERNOVA,
    MembershipTier.GENESIS,
  ];

  for (const tier of tiers) {
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3s between upgrades
    console.log(`\n⬆️ Upgrading to ${tier}...`);
    reachTier(tier);
    logRewardsStatus();
  }

  console.log('\n🎉 Demo complete! You are now a Genesis member!');
};

/**
 * Quick test: Jump to Whale tier immediately
 */
export const quickTestWhale = () => {
  console.log('🚀 Quick test: Jumping to Whale tier...');
  reachTier(MembershipTier.WHALE);
  logRewardsStatus();
};

/**
 * Quick test: Jump to Genesis tier immediately
 */
export const quickTestGenesis = () => {
  console.log('🚀 Quick test: Jumping to Genesis tier...');
  reachTier(MembershipTier.GENESIS);
  addReferrals(10);
  logRewardsStatus();
};

// Export all functions for easy access
export const RewardsDemoUtils = {
  simulatePurchase,
  reachTier,
  resetToNodeRunner,
  addBonusPoints,
  addReferrals,
  openAllMysteryBoxes,
  logRewardsStatus,
  demoAllTiers,
  quickTestWhale,
  quickTestGenesis,
};

// Usage in React Native Debugger console:
// import { RewardsDemoUtils } from '@/utils/rewards-demo';
// RewardsDemoUtils.quickTestWhale();
// RewardsDemoUtils.logRewardsStatus();
