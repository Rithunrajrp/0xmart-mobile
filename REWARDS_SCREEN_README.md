# 🎁 Rewards Screen - Complete Documentation

## Overview

The Rewards Screen is a premium, crypto-themed rewards system for the 0xMart mobile application. It features a comprehensive membership tier system with auto-upgrades, multiple reward mechanisms, and a futuristic Web3 aesthetic.

## 🏆 Membership Tiers

The system uses 5 crypto-inspired membership tiers that automatically upgrade based on total spending:

| Tier | Min Spend | Color Theme | Point Multiplier | Key Benefits |
|------|-----------|-------------|------------------|--------------|
| **Node Runner** | $0 | Blue | 1.0x | Basic rewards, monthly newsletter |
| **Master Node** | $1,000 | Purple | 1.5x | Priority support, early sale access, quarterly mystery box |
| **Whale** | $5,000 | Teal | 2.0x | VIP support, exclusive drops, free express shipping, monthly mystery box |
| **Supernova** | $15,000 | Neon Orange/Gold | 3.0x | Concierge service, limited editions, free overnight shipping, weekly mystery boxes |
| **Genesis** | $50,000 | White/Gold | 5.0x | Dedicated account manager, all exclusive drops, daily mystery boxes, lifetime VIP |

## 📁 File Structure

```
0xmart-mobile/
├── types/
│   └── rewards.ts                    # TypeScript types for rewards system
├── config/
│   └── tier-config.ts                # Tier configurations and helper functions
├── store/
│   └── rewards-store.ts              # Zustand state management
├── screens/
│   └── rewards/
│       └── RewardsScreen.tsx         # Main rewards screen component
├── components/
│   └── rewards/
│       ├── PurchaseRewardsTab.tsx    # Purchase rewards tab
│       ├── ReferralRewardsTab.tsx    # Referral rewards tab
│       ├── SubscriptionRewardsTab.tsx # Subscription rewards tab
│       ├── MysteryBoxGrid.tsx        # Mystery boxes display
│       ├── ExclusiveDropsSection.tsx # Exclusive product drops
│       └── TierUpgradeModal.tsx      # Tier upgrade celebration modal
└── app/
    └── rewards.tsx                    # Route file
```

## 🎨 Features

### 1. Top Summary Section
- **Dynamic Tier Badge**: Displays current tier with pulsing glow animation
- **Tier-Themed Colors**: Glassmorphism design with tier-specific gradient colors
- **Points Balance**: Shows current reward points
- **Token Credits**: Pre-launch token balance with conversion teaser
- **Progress Bar**: Visual progress to next tier with spending requirement

### 2. Rewards Breakdown Tabs

#### A. Purchase Rewards Tab
- **Stats Cards**: Total purchases and points earned
- **Current Multiplier**: Large display of tier-based multiplier
- **How It Works**: Step-by-step explanation
- **Purchase Milestones**: Progress bars for spending milestones
- **Milestone Rewards**: Mystery boxes and bonus points

#### B. Referral Rewards Tab
- **Referral Code Card**: Large, easy-to-copy referral code
- **Share Button**: Native share sheet integration
- **Stats Display**: Successful referrals, streak, and points earned
- **Leaderboard Rank**: Optional ranking display with CTA
- **Streak Bonuses**: Unlockable multiplier levels
- **Referral Instructions**: Clear explanation of the referral process

#### C. Subscription Rewards Tab
- **Active Subscription View**: For subscribed users showing benefits
- **Subscription Tiers**: Three subscription options (Basic, Premium, Ultimate)
- **Instant Bonus Points**: Rewards upon subscription
- **Multiplier Boost**: Additional point multipliers
- **Tier Progress Boost**: Faster tier advancement
- **Why Subscribe Section**: Benefits explanation

### 3. Special Rewards Area

#### Mystery Boxes
- **Rarity System**: Common, Rare, Epic, Legendary
- **Lock/Unlock States**: Visual feedback for availability
- **Tier Requirements**: Shows required tier for each box
- **Potential Rewards**: List of possible items
- **Open Animation**: Celebratory popup when opened
- **Rarity Colors**: Unique gradients for each rarity level

#### Exclusive Drops
- **Limited Products**: Tier-locked exclusive items
- **Stock Tracking**: Real-time availability with progress bar
- **Launch Dates**: Countdown to product release
- **Product Images**: Visual preview with lock overlay
- **Tier Badges**: Shows required tier for access

### 4. Auto-Upgrade Logic

```typescript
// Automatic tier upgrade flow:
1. User makes purchase → addPurchase() called
2. Total spending updated
3. getTierFromSpend() calculates new tier
4. If tier changed → checkTierUpgrade() triggered
5. TierUpgradeModal displays with celebration
6. Bonus points awarded
7. New benefits unlocked
```

**Upgrade Celebration Features:**
- Full-screen modal with tier-colored gradient
- Rotating diamond badge animation
- Confetti particles falling
- Haptic feedback
- Bonus points display
- Unlocked features list
- New benefits preview

## 🔧 State Management

### Zustand Store (`rewards-store.ts`)

```typescript
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
  subscribeToTier: (tier: string) => Promise<void>;
}
```

## 🎯 Key Functions

### Tier Calculation
```typescript
getTierFromSpend(totalSpend: number): MembershipTier
```
Returns the appropriate tier based on total spending.

### Progress Tracking
```typescript
getProgressToNextTier(currentSpend, currentTier): {
  spendNeeded: number;
  progressPercent: number;
  nextTier: MembershipTier | null;
}
```
Calculates progress percentage and spending needed for next tier.

### Tier Upgrade Check
```typescript
checkTierUpgrade(): TierUpgradeEvent | null
```
Determines if user qualifies for tier upgrade and returns upgrade event data.

## 🎭 Animations

1. **Tier Badge Glow**: Continuous pulsing animation using Animated.loop
2. **Progress Bar**: Smooth width transitions
3. **Modal Entrance**: Spring animation with scale and fade
4. **Badge Rotation**: 360° continuous rotation
5. **Confetti**: Falling particles with random trajectories
6. **Tab Switch**: Haptic feedback on selection

## 🎨 Design System

### Color Scheme
- **Background**: Gray-950 (#030712)
- **Cards**: Gray-900 (#111827) with gray-800 borders
- **Text**: White with varying opacity (100%, 90%, 80%, 60%)
- **Glassmorphism**: White/20 with backdrop-blur

### Typography
- **Tier Names**: 2xl, bold, tracking-wider
- **Headers**: xl-2xl, bold
- **Body**: sm-base, regular
- **Stats**: 2xl-4xl, bold

### Components
- **Rounded Corners**: 2xl (16px) for cards, xl (12px) for buttons
- **Borders**: 1-2px with low opacity
- **Shadows**: Minimal, relying on borders for depth
- **Gradients**: Linear gradients for tier-themed sections

## 🔗 Integration Points

### Backend API Endpoints (To be implemented)
```typescript
GET  /api/v1/rewards/me              // Fetch user rewards
POST /api/v1/rewards/mystery-boxes/:id/open  // Open mystery box
POST /api/v1/rewards/referrals/claim // Claim referral reward
POST /api/v1/rewards/subscribe       // Subscribe to tier
```

### Usage in App
```typescript
import { useRewardsStore } from '@/store/rewards-store';

const { rewards, fetchRewards, addPurchase } = useRewardsStore();

// Fetch rewards on mount
useEffect(() => {
  fetchRewards();
}, []);

// After purchase completion
addPurchase(purchaseAmount, pointsEarned);
```

## 📱 User Experience Flow

### First Time User
1. Opens Rewards Screen → Sees Node Runner tier
2. Views "How It Works" sections
3. Checks referral code and shares
4. Explores locked mystery boxes and drops
5. Makes purchases to earn points

### Tier Upgrade Experience
1. User completes purchase pushing total over threshold
2. Auto-upgrade logic triggers
3. Celebration modal appears with confetti
4. User sees new tier badge and bonus points
5. Unlocked features are highlighted
6. Modal dismissed, new benefits immediately active

### Active User
1. Checks current points and progress daily
2. Views purchase milestones
3. Tracks referral streak
4. Opens available mystery boxes
5. Accesses exclusive drops
6. Considers subscription for boost

## 🚀 Performance Optimizations

- **Lazy Loading**: Tabs render content only when active
- **Memoization**: Heavy components wrapped in React.memo
- **Animated Values**: useNativeDriver: true for 60fps animations
- **Image Optimization**: Proper resizeMode for product images
- **Efficient State**: Zustand with selective subscriptions

## 🧪 Testing Recommendations

### Unit Tests
- Tier calculation logic
- Progress bar percentage calculations
- Point multiplier applications
- Referral code generation

### Integration Tests
- Purchase flow → tier upgrade trigger
- Mystery box opening
- Referral sharing
- Subscription flow

### UI Tests
- Tab switching
- Modal animations
- Progress bar updates
- Responsive layouts

## 🔐 Security Considerations

1. **API Key Authentication**: All rewards API calls require authentication
2. **Rate Limiting**: Prevent abuse of referral system
3. **Server-Side Validation**: Tier upgrades calculated on backend
4. **Idempotency**: Mystery box openings with unique transaction IDs
5. **Encrypted Codes**: Referral codes generated server-side

## 📊 Analytics Events

Recommended tracking events:
- `rewards_screen_viewed`
- `rewards_tab_switched` (tab_name)
- `tier_upgraded` (from_tier, to_tier, total_spent)
- `mystery_box_opened` (box_id, rarity, rewards)
- `referral_code_shared` (method)
- `subscription_started` (tier)
- `exclusive_drop_viewed` (product_id)

## 🎯 Future Enhancements

1. **Leaderboard Page**: Full leaderboard with filters and prizes
2. **Reward History**: Transaction log of all points earned
3. **NFT Badges**: Blockchain-based tier badges
4. **Social Features**: Share achievements to social media
5. **Gamification**: Challenges and quests for bonus points
6. **Token Swap**: Convert points to tokens at launch
7. **Push Notifications**: Tier upgrade alerts, new drops, expiring boxes
8. **AR Experience**: View mystery box contents in AR

## 📝 Notes

- All mock data in store should be replaced with actual API calls
- Mystery box opening needs backend integration for fair randomization
- Subscription payments require Stripe/payment gateway integration
- Token credits are placeholder for future token launch
- Exclusive drops should sync with product inventory system

## 🤝 Contributing

When adding new features:
1. Add types to `types/rewards.ts`
2. Update store actions in `rewards-store.ts`
3. Create new components in `components/rewards/`
4. Update this README with new features
5. Maintain consistent design system

---

**Built with**: React Native, Expo, TypeScript, Zustand, NativeWind, React Native Reanimated

**Design Style**: Premium Web3 Aesthetic, Glassmorphism, Crypto-inspired, Futuristic
