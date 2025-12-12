# 🚀 Rewards Screen - Quick Start Guide

## Access the Rewards Screen

Navigate to `/rewards` in your app:
```typescript
import { router } from 'expo-router';

router.push('/rewards');
```

## Test the Features

### 1. View Basic Rewards Screen
```bash
npm start
# Navigate to /rewards in the app
```

### 2. Test Tier Upgrades (React Native Debugger)
```javascript
// Open React Native Debugger Console
import { RewardsDemoUtils } from '@/utils/rewards-demo';

// Quick jump to Whale tier
RewardsDemoUtils.quickTestWhale();

// Quick jump to Genesis tier
RewardsDemoUtils.quickTestGenesis();

// Check current status
RewardsDemoUtils.logRewardsStatus();

// Reset to start
RewardsDemoUtils.resetToNodeRunner();
```

### 3. Test Individual Features
```javascript
// Simulate purchases
RewardsDemoUtils.simulatePurchase(500); // $500 purchase

// Add referrals
RewardsDemoUtils.addReferrals(5); // 5 successful referrals

// Add bonus points
RewardsDemoUtils.addBonusPoints(1000);

// Run full demo (all tier upgrades)
RewardsDemoUtils.demoAllTiers();
```

## Key Components

### Main Screen
```typescript
import RewardsScreen from '@/screens/rewards/RewardsScreen';
```

### State Management
```typescript
import { useRewardsStore } from '@/store/rewards-store';

const {
  rewards,
  loading,
  fetchRewards,
  addPurchase,
  checkTierUpgrade,
} = useRewardsStore();
```

### Tier Config
```typescript
import { TIER_CONFIGS, getTierFromSpend, getProgressToNextTier } from '@/config/tier-config';
```

## Membership Tiers Quick Reference

| Tier | Spend Required | Multiplier |
|------|----------------|------------|
| Node Runner | $0 | 1.0x |
| Master Node | $1,000 | 1.5x |
| Whale | $5,000 | 2.0x |
| Supernova | $15,000 | 3.0x |
| Genesis | $50,000 | 5.0x |

## Features to Explore

✅ **Top Summary**
- Current tier badge with glow animation
- Points and token credits display
- Progress bar to next tier

✅ **Purchase Rewards Tab**
- Current multiplier display
- Purchase milestones
- Points earned statistics

✅ **Referral Rewards Tab**
- Shareable referral code
- Streak bonuses
- Leaderboard rank

✅ **Subscription Tab**
- 3 subscription tiers
- Instant bonus points
- Multiplier boosts

✅ **Mystery Boxes**
- 4 rarity levels
- Tier-locked boxes
- Opening animations

✅ **Exclusive Drops**
- Limited edition products
- Stock tracking
- Launch dates

✅ **Tier Upgrade Modal**
- Celebration animation
- Confetti effects
- Bonus points reward
- Unlocked features display

## Integration Checklist

### Backend Integration (TODO)
- [ ] Connect `fetchRewards()` to GET `/api/v1/rewards/me`
- [ ] Connect `openMysteryBox()` to POST `/api/v1/rewards/mystery-boxes/:id/open`
- [ ] Connect `claimReferralReward()` to POST `/api/v1/rewards/referrals/claim`
- [ ] Connect `subscribeToTier()` to POST `/api/v1/rewards/subscribe`
- [ ] Add payment gateway for subscriptions
- [ ] Implement tier upgrade webhooks
- [ ] Add analytics tracking

### Required Dependencies
All dependencies already installed:
- ✅ expo-linear-gradient
- ✅ expo-haptics
- ✅ expo-clipboard
- ✅ @expo/vector-icons
- ✅ zustand
- ✅ react-native-reanimated

### Testing
```bash
# Run the mobile app
cd 0xmart-mobile
npm start

# In another terminal, open React Native Debugger
# Use RewardsDemoUtils to test features
```

## Customization

### Change Tier Colors
Edit `config/tier-config.ts`:
```typescript
color: {
  primary: '#YOUR_COLOR',
  secondary: '#YOUR_COLOR',
  gradient: ['#COLOR1', '#COLOR2', '#COLOR3'],
}
```

### Modify Spend Thresholds
```typescript
minSpend: 1000, // Change to your desired amount
```

### Adjust Point Multipliers
```typescript
pointMultiplier: 1.5, // Change multiplier value
```

## Troubleshooting

### Rewards not loading?
- Check if `fetchRewards()` is called in useEffect
- Verify API endpoint configuration
- Check console for errors

### Animations not smooth?
- Ensure `useNativeDriver: true` in all Animated calls
- Test on physical device (animations slower in simulator)

### Tier not upgrading?
- Check `getTierFromSpend()` logic
- Verify `totalSpent` is updating correctly
- Use `RewardsDemoUtils.logRewardsStatus()` to debug

### Modal not showing?
- Check `showUpgradeModal` state in store
- Verify `checkTierUpgrade()` returns valid TierUpgradeEvent
- Test with `RewardsDemoUtils.reachTier()`

## Support

For issues or questions:
1. Check `REWARDS_SCREEN_README.md` for detailed documentation
2. Review type definitions in `types/rewards.ts`
3. Inspect store logic in `store/rewards-store.ts`
4. Use demo utilities in `utils/rewards-demo.ts` for testing

---

**Ready to test?** Run `npm start` and navigate to `/rewards`! 🎉
