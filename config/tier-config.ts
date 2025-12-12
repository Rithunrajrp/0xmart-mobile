import { MembershipTier, TierConfig } from '@/types/rewards';

export const TIER_CONFIGS: Record<MembershipTier, TierConfig> = {
  [MembershipTier.NODE_RUNNER]: {
    id: MembershipTier.NODE_RUNNER,
    name: 'Node Runner',
    minSpend: 0,
    color: {
      primary: '#3B82F6', // Blue
      secondary: '#60A5FA',
      gradient: ['#1E40AF', '#3B82F6', '#60A5FA'],
    },
    pointMultiplier: 1.0,
    benefits: [
      'Earn 1x points on purchases',
      'Access to basic rewards',
      'Monthly newsletter',
    ],
    exclusiveDrops: false,
  },
  [MembershipTier.MASTER_NODE]: {
    id: MembershipTier.MASTER_NODE,
    name: 'Master Node',
    minSpend: 1000,
    color: {
      primary: '#A855F7', // Purple
      secondary: '#C084FC',
      gradient: ['#7C3AED', '#A855F7', '#C084FC'],
    },
    pointMultiplier: 1.5,
    benefits: [
      'Earn 1.5x points on purchases',
      'Priority customer support',
      'Early access to sales',
      'Quarterly mystery box',
    ],
    exclusiveDrops: false,
  },
  [MembershipTier.WHALE]: {
    id: MembershipTier.WHALE,
    name: 'Whale',
    minSpend: 5000,
    color: {
      primary: '#14B8A6', // Teal
      secondary: '#5EEAD4',
      gradient: ['#0D9488', '#14B8A6', '#5EEAD4'],
    },
    pointMultiplier: 2.0,
    benefits: [
      'Earn 2x points on purchases',
      'VIP customer support',
      'Exclusive product drops',
      'Free express shipping',
      'Monthly mystery box',
    ],
    exclusiveDrops: true,
  },
  [MembershipTier.SUPERNOVA]: {
    id: MembershipTier.SUPERNOVA,
    name: 'Supernova',
    minSpend: 15000,
    color: {
      primary: '#F97316', // Neon Orange
      secondary: '#FBBF24', // Gold
      gradient: ['#EA580C', '#F97316', '#FBBF24', '#FCD34D'],
    },
    pointMultiplier: 3.0,
    benefits: [
      'Earn 3x points on purchases',
      'Concierge service',
      'Limited edition drops',
      'Free overnight shipping',
      'Weekly mystery boxes',
      'Token launch priority',
    ],
    exclusiveDrops: true,
  },
  [MembershipTier.GENESIS]: {
    id: MembershipTier.GENESIS,
    name: 'Genesis',
    minSpend: 50000,
    color: {
      primary: '#FFFFFF', // White
      secondary: '#FCD34D', // Gold
      gradient: ['#F3F4F6', '#FFFFFF', '#FDE68A', '#FCD34D'],
    },
    pointMultiplier: 5.0,
    benefits: [
      'Earn 5x points on purchases',
      'Dedicated account manager',
      'Exclusive Genesis drops',
      'All shipping free',
      'Daily mystery boxes',
      'Maximum token allocation',
      'Private community access',
      'Lifetime VIP status',
    ],
    exclusiveDrops: true,
  },
};

export const TIER_ORDER = [
  MembershipTier.NODE_RUNNER,
  MembershipTier.MASTER_NODE,
  MembershipTier.WHALE,
  MembershipTier.SUPERNOVA,
  MembershipTier.GENESIS,
];

export function getTierFromSpend(totalSpend: number): MembershipTier {
  if (totalSpend >= TIER_CONFIGS[MembershipTier.GENESIS].minSpend) {
    return MembershipTier.GENESIS;
  }
  if (totalSpend >= TIER_CONFIGS[MembershipTier.SUPERNOVA].minSpend) {
    return MembershipTier.SUPERNOVA;
  }
  if (totalSpend >= TIER_CONFIGS[MembershipTier.WHALE].minSpend) {
    return MembershipTier.WHALE;
  }
  if (totalSpend >= TIER_CONFIGS[MembershipTier.MASTER_NODE].minSpend) {
    return MembershipTier.MASTER_NODE;
  }
  return MembershipTier.NODE_RUNNER;
}

export function getNextTier(currentTier: MembershipTier): MembershipTier | null {
  const currentIndex = TIER_ORDER.indexOf(currentTier);
  if (currentIndex === TIER_ORDER.length - 1) {
    return null; // Already at highest tier
  }
  return TIER_ORDER[currentIndex + 1];
}

export function getProgressToNextTier(
  currentSpend: number,
  currentTier: MembershipTier
): { spendNeeded: number; progressPercent: number; nextTier: MembershipTier | null } {
  const nextTier = getNextTier(currentTier);

  if (!nextTier) {
    return {
      spendNeeded: 0,
      progressPercent: 100,
      nextTier: null,
    };
  }

  const nextTierConfig = TIER_CONFIGS[nextTier];
  const currentTierConfig = TIER_CONFIGS[currentTier];

  const spendNeeded = nextTierConfig.minSpend - currentSpend;
  const totalRange = nextTierConfig.minSpend - currentTierConfig.minSpend;
  const currentProgress = currentSpend - currentTierConfig.minSpend;
  const progressPercent = Math.min(100, (currentProgress / totalRange) * 100);

  return {
    spendNeeded: Math.max(0, spendNeeded),
    progressPercent,
    nextTier,
  };
}
