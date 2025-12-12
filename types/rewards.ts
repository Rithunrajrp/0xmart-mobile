// Rewards System Types

export enum MembershipTier {
  NODE_RUNNER = 'NODE_RUNNER',
  MASTER_NODE = 'MASTER_NODE',
  WHALE = 'WHALE',
  SUPERNOVA = 'SUPERNOVA',
  GENESIS = 'GENESIS',
}

export interface TierConfig {
  id: MembershipTier;
  name: string;
  minSpend: number;
  color: {
    primary: string;
    secondary: string;
    gradient: string[];
  };
  pointMultiplier: number;
  benefits: string[];
  exclusiveDrops: boolean;
}

export interface UserRewards {
  currentTier: MembershipTier;
  totalSpent: number;
  currentPoints: number;
  tokenCredits: number;
  purchaseRewards: PurchaseRewardStats;
  referralRewards: ReferralRewardStats;
  subscriptionRewards: SubscriptionRewardStats;
  mysteryBoxes: MysteryBox[];
  exclusiveDrops: ExclusiveDrop[];
}

export interface PurchaseRewardStats {
  totalPurchases: number;
  pointsEarned: number;
  currentMultiplier: number;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  reward: string;
  unlocked: boolean;
}

export interface ReferralRewardStats {
  totalReferrals: number;
  successfulReferrals: number;
  pointsEarned: number;
  currentStreak: number;
  referralCode: string;
  leaderboardRank?: number;
  streakBonuses: StreakBonus[];
}

export interface StreakBonus {
  level: number;
  referralsNeeded: number;
  bonusMultiplier: number;
  unlocked: boolean;
}

export interface SubscriptionRewardStats {
  isSubscribed: boolean;
  subscriptionTier?: 'BASIC' | 'PREMIUM' | 'ULTIMATE';
  bonusPoints: number;
  multiplier: number;
  tierProgressBoost: number;
}

export interface MysteryBox {
  id: string;
  title: string;
  requiredTier: MembershipTier;
  requiredPoints?: number;
  unlocked: boolean;
  opened: boolean;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  potentialRewards: string[];
}

export interface ExclusiveDrop {
  id: string;
  productId: string;
  name: string;
  imageUrl: string;
  requiredTier: MembershipTier;
  availableQuantity: number;
  totalQuantity: number;
  launchDate: Date;
  unlocked: boolean;
}

export interface TierUpgradeEvent {
  fromTier: MembershipTier;
  toTier: MembershipTier;
  totalSpent: number;
  bonusPoints: number;
  unlockedFeatures: string[];
}
