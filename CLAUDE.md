# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**0xMart Mobile** is a React Native mobile application for the 0xMart multi-currency stablecoin commerce platform. It enables users to browse and purchase products using stablecoins (USDT, USDC, DAI, BUSD) across 9 blockchain networks, with integrated wallet management, OTP authentication, GPS-based address auto-fill, and a rewards/points system.

## Commands

### Development
```bash
npm install                # Install dependencies
npm start                  # Start Expo dev server
npm run android            # Run on Android emulator
npm run ios                # Run on iOS simulator
npm run web                # Run web version
npm run lint               # ESLint
```

### Clear Cache
```bash
npm start -- --clear       # Start with cleared cache
```

### Reset AsyncStorage (Development)
If you need to reset app state during development, add this code temporarily:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.clear();
```

## Architecture

### Tech Stack
- **Framework**: Expo SDK v54 with React Native 0.81
- **React**: React 19.1.0 (latest) with React DOM 19.1.0
- **Navigation**: Expo Router v6 (file-based routing)
- **Styling**: NativeWind v4 (Tailwind CSS for React Native)
- **State Management**: Zustand v5 with AsyncStorage persistence
- **Forms**: React Hook Form + Zod v4 validation
- **HTTP**: Axios with auto token refresh
- **Location**: Expo Location with reverse geocoding
- **Experiments**: React Compiler and Typed Routes enabled
- **Architecture**: React Native New Architecture enabled

### Backend Integration
The mobile app communicates with the NestJS backend at:
- **Development**: Configured via `app.json` extra.apiUrl (default: `http://localhost:8000/api/v1`)
- **Production**: `https://api.0xmart.com/api/v1`

The API URL is configured in `api/index.ts` using:
1. `Constants.expoConfig?.extra?.apiUrl` (from app.json)
2. `process.env.EXPO_PUBLIC_API_URL` (from .env)
3. Fallback to localhost (dev) or production URL

**Network Setup**: See [NETWORK_SETUP.md](./NETWORK_SETUP.md) for connecting physical devices to local backend.

### File-Based Routing
Expo Router uses the file system for navigation. Routes are defined in the `app/` directory:

**Tab Navigation** (`app/(tabs)/`):
- `index.tsx` → Shop/Home screen
- `collection.tsx` → Collections/Categories screen
- `exclusive.tsx` → Exclusive products screen
- `reward.tsx` → Rewards/Points screen
- `profile.tsx` → Profile screen

**Stack Navigation**:
- `auth/login.tsx` → Login screen
- `product/[id].tsx` → Product detail (dynamic route)
- `collection/[category].tsx` → Category products (dynamic route)
- `checkout.tsx` → Checkout screen
- `orders.tsx` → Order history
- `orders/[id].tsx` → Order detail
- `orders/[id]/confirmation.tsx` → Order confirmation
- `wallets/index.tsx` → Wallets list screen
- `wallets/[id].tsx` → Wallet detail
- `wallets/[id]/deposit.tsx` → Deposit screen
- `wallets/[id]/withdraw.tsx` → Withdraw screen
- `wallets/create.tsx` → Create wallet
- `addresses.tsx` → Address management
- `cart.tsx` → Shopping cart
- `favorites.tsx` → Favorites/wishlist
- `search.tsx` → Product search
- `rewards.tsx` → Rewards details

Navigation between screens uses `router.push()`, `router.replace()`, or `<Link>` components from `expo-router`.

### State Management Pattern

**Zustand Stores** (located in `store/`):

1. **auth-store.ts**: Authentication state with AsyncStorage persistence
   - User data, tokens (access/refresh), authentication status
   - Actions: `login()`, `logout()`, `setTokens()`, `fetchUser()`
   - Automatically persists to AsyncStorage
   - Used by API client for auth headers

2. **cart-store.ts**: Shopping cart state
   - Cart items, quantities, selected stablecoin
   - Persisted to AsyncStorage
   - Actions: `addItem()`, `removeItem()`, `updateQuantity()`, `setStablecoin()`, `clearCart()`

3. **favorites-store.ts**: Favorite products
   - Syncs with backend API
   - Toggle favorite status
   - Used to display heart icons on product cards

4. **user-store.ts**: User profile data
   - Profile information, addresses, wallets, statistics
   - Actions: `fetchProfile()`, `fetchAddresses()`, `fetchWallets()`

5. **rewards-store.ts**: Rewards/points system
   - User points balance, transaction history, redemption options
   - Actions: `fetchRewards()`, `redeemPoints()`, `fetchTransactions()`

6. **testnet-store.ts**: Global testnet mode state
   - Controls whether app uses testnet or mainnet networks
   - Persisted to AsyncStorage
   - Actions: `setTestnetMode()`, `toggleTestnetMode()`
   - Used throughout app for dynamic network/contract configuration
   - See [Testnet Mode](#testnet-mode) section below for details

**Important**: Stores are used throughout the app. Always import from `@/store/` and use the hook pattern:
```typescript
import { useAuthStore } from '@/store/auth-store';
const { user, isAuthenticated, login } = useAuthStore();
```

### API Client Architecture

**Location**: `api/index.ts`

The API client is a singleton Axios instance with two critical interceptors:

1. **Request Interceptor**: Automatically attaches JWT access token from AsyncStorage to all requests
2. **Response Interceptor**: Handles 401 errors by automatically refreshing the access token using the refresh token

**Key Pattern**: When a 401 occurs:
- Retrieves refresh token from AsyncStorage
- Calls `/auth/refresh` endpoint
- Saves new access and refresh tokens
- Retries the original request with new token
- If refresh fails, clears AsyncStorage (user must re-login)

**Important**: Never create multiple Axios instances. Always import from `api/index.ts`:
```typescript
import api from '@/api';
const products = await api.getProducts();
```

### Authentication Flow

1. User enters email/phone → `api.sendOTP()`
2. OTP sent to email/phone
3. User enters OTP → `api.verifyOTP()`
4. Backend returns `{ accessToken, refreshToken, expiresIn, user }`
5. Store saves tokens to AsyncStorage via `setTokens()`
6. User is authenticated, can access protected routes
7. On 401 errors, API client auto-refreshes token
8. On logout, AsyncStorage is cleared

**Protected Routes**: Cart, favorites, checkout, orders, wallets, profile all require authentication. The app checks `isAuthenticated` from auth store.

### Styling with NativeWind

NativeWind v4 uses Tailwind CSS classes directly on React Native components:

```typescript
<View className="bg-card p-4 rounded-lg">
  <Text className="text-lg font-bold text-text-primary">
    Product Name
  </Text>
</View>
```

**Dark Theme**: The app uses a comprehensive dark theme defined in `tailwind.config.js`:
- Primary color: Purple (#8b5cf6)
- Background: Dark grays (#0a0a0a, #121212, #1a1a1a)
- Text colors: White with varying opacity for hierarchy
- Accent colors: Blue, purple, pink, green

See [DARK_THEME_GUIDE.md](./DARK_THEME_GUIDE.md) for detailed theme documentation.

**Configuration**:
- `tailwind.config.js` → Theme configuration with dark mode colors (content paths for app/, screens/, components/)
- `global.css` → Global CSS imports
- `metro.config.js` → NativeWind v4 Metro plugin using `withNativeWind()` wrapper with `input: './global.css'`
- `babel.config.js` → NativeWind Babel preset (`nativewind/babel`) before reanimated
- `nativewind-env.d.ts` → TypeScript declarations

**Important**:
- Always use className prop, not style prop for Tailwind classes
- Reanimated plugin MUST be last in babel.config.js
- Babel preset order: `babel-preset-expo`, `nativewind/babel`, then plugins: `react-native-reanimated/plugin`

### Location & GPS Integration

**Location Service**: `utils/location.ts`

Provides GPS and geocoding utilities:
- `requestPermissions()`: Request location permissions
- `getCurrentLocation()`: Get GPS coordinates
- `reverseGeocode()`: Convert coordinates to address
- `getCurrentAddress()`: Get current address from GPS
- `searchAddress()`: Search for addresses

**Usage in Address Forms**:
```typescript
import { locationService } from '@/utils/location';

const address = await locationService.getCurrentAddress();
// Pre-fill form with address.street, address.city, etc.
```

**Permissions**: Configured in `app.json`:
- iOS: `NSLocationWhenInUseUsageDescription`
- Android: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`

### TypeScript Path Aliases

`tsconfig.json` defines `@/*` as root alias:
```typescript
import { useAuthStore } from '@/store/auth-store';
import api from '@/api';
import { Product } from '@/types';
import { locationService } from '@/utils/location';
```

### Supported Blockchain Networks

Defined in `api/index.ts`:
- Ethereum, Polygon, BSC (BNB Chain)
- Arbitrum, Optimism, Base
- Avalanche, Sui, TON

Each network supports multiple stablecoins (USDT, USDC, DAI, BUSD), though availability varies by network.

### Screen Component Pattern

**Two-Layer Architecture**:
1. **Route Files** (`app/` directory): Minimal route handlers that import screen components
2. **Screen Components** (`screens/` directory): Full screen implementations organized by feature

**Screen Directory Structure**:
```
screens/
├── auth/
│   └── LoginScreen.tsx
├── shop/
│   ├── HomeScreen.tsx
│   ├── ProductDetailScreen.tsx
│   ├── FavoritesScreen.tsx
│   └── SearchScreen.tsx
├── collection/
│   ├── CollectionScreen.tsx
│   └── CategoryProductsScreen.tsx
├── exclusive/
│   └── ExclusiveScreen.tsx
├── cart/
│   ├── CartScreen.tsx
│   └── CheckoutScreen.tsx
├── order/
│   ├── OrdersScreen.tsx
│   ├── OrderDetailScreen.tsx
│   └── OrderConfirmationScreen.tsx
├── wallets/
│   ├── WalletsScreen.tsx
│   ├── WalletDetailScreen.tsx
│   ├── CreateWalletScreen.tsx
│   ├── DepositScreen.tsx
│   └── WithdrawScreen.tsx
├── profile/
│   ├── ProfileScreen.tsx
│   └── AddressesScreen.tsx
├── reward/
│   └── RewardScreen.tsx
└── rewards/
    └── RewardsScreen.tsx
```

Example:
```typescript
// app/(tabs)/index.tsx
import HomeScreen from '@/screens/shop/HomeScreen';
export default function Page() {
  return <HomeScreen />;
}
```

This pattern keeps route definitions clean and screen logic separate, making it easier to locate and maintain feature-specific code.

### Tab Bar Navigation

The app uses a custom tab bar component (see [TAB_BAR_DESIGN.md](./TAB_BAR_DESIGN.md)) with 5 tabs:
1. Shop (Home)
2. Collection (Categories/Collections)
3. Exclusive (Featured/Premium products)
4. Reward (Points/Rewards system)
5. Profile (User account)

Tab icons use Expo Symbols for iOS and @expo/vector-icons for cross-platform fallback.

### Rewards System

The app includes a comprehensive rewards/points system (see [REWARDS_SCREEN_README.md](./REWARDS_SCREEN_README.md) and [REWARDS_QUICK_START.md](./REWARDS_QUICK_START.md)):
- Users earn points through purchases and activities
- Points can be redeemed for discounts or rewards
- Transaction history tracking
- Multiple reward tiers

### UI Components

**Location**: `components/ui/`

Base UI components include:
- `Button.tsx`: Primary, secondary, outline variants
- `Input.tsx`: Form input with validation support
- `Card.tsx`: Content container
- `CountryCodePicker.tsx`: Phone country code selector

These are shadcn-style components adapted for React Native with NativeWind.

**Product Components**: `components/product/`
- `ProductCard.tsx`: Grid item for product listings
- `ProductGrid.tsx`: Responsive grid layout

**Navigation Components**: `components/navigation/`
- Custom tab bar and navigation UI

**Rewards Components**: `components/rewards/`
- Rewards-specific UI elements

### Form Handling

Uses React Hook Form with Zod v4 validation:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  // ...
});

const { control, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});
```

**Note**: This project uses Zod v4 (latest version). Be aware of any breaking changes from v3 if referencing older documentation.

### Environment Configuration

**app.json** contains app configuration:
- `extra.apiUrl`: Backend API URL (can be accessed via `expo-constants`)
- `userInterfaceStyle`: Set to "dark" for dark mode
- `newArchEnabled`: true (React Native New Architecture enabled)
- Permissions, plugins, splash screen, icons

To access in code:
```typescript
import Constants from 'expo-constants';
const apiUrl = Constants.expoConfig?.extra?.apiUrl;
```

**Environment Variables**: Create a `.env` file in the root:
```
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000/api/v1
```

See `.env.example` for template.

### Key Development Patterns

**1. AsyncStorage Usage**: Always use for persistent data (tokens, cart, user preferences)

**2. Error Handling**: API errors should be caught and displayed to user via alerts or error messages

**3. Loading States**: Use loading spinners during async operations (API calls, location services)

**4. Navigation Guards**: Check `isAuthenticated` before allowing access to protected screens

**5. Token Refresh**: Never manually handle token refresh - the API client does it automatically

**6. Stablecoin Selection**: Users select stablecoin type (USDT/USDC/DAI/BUSD) at cart, saved in cart store

**7. Network Selection**: Users select blockchain network when creating wallets or making payments

**8. Dark Theme**: All UI components should use the dark theme color palette from tailwind.config.js

### Debugging Tips

**View Logs**:
- Use `console.log()` for debugging
- View logs in Expo Dev Tools or terminal

**Inspect AsyncStorage**:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
const keys = await AsyncStorage.getAllKeys();
const values = await AsyncStorage.multiGet(keys);
```

**Network Requests**:
- Check API calls in Network tab of React Native Debugger
- API client logs errors to console
- Base URL logged on app start in dev mode

**State Changes**:
```typescript
useAuthStore.subscribe((state) => {
  console.log('Auth state:', state);
});
```

**Clear All Data**: `AsyncStorage.clear()` - useful during development

### Testing on Physical Devices

**Expo Go App**: Install Expo Go on iOS/Android device and scan QR code from `npm start`

**Network Configuration**:
1. Ensure device and computer are on same WiFi network
2. Update `app.json` extra.apiUrl with your computer's IP address
3. Restart Expo server with `npm start -- --clear`
4. See [NETWORK_SETUP.md](./NETWORK_SETUP.md) for detailed instructions

**USB Connection**:
- iOS: `npm run ios -- --device`
- Android: Connect via USB and run `npm run android`

### Building for Production

**EAS Build** (Recommended):
```bash
npm install -g eas-cli
eas login
eas build --platform ios
eas build --platform android
```

Requires EAS account and configuration in `app.json` under `extra.eas.projectId`.

### Key Dependencies

**Core Expo & React Native**:
- `expo` (v54) - Expo SDK for React Native development
- `react` (v19.1.0) - Latest React with new features
- `react-native` (v0.81) - React Native with New Architecture
- `expo-router` (v6) - File-based routing with typed routes

**UI & Styling**:
- `nativewind` (v4) - Tailwind CSS for React Native
- `tailwindcss` (v3.4) - Tailwind CSS core
- `react-native-reanimated` (v4.1) - Smooth animations
- `@expo/vector-icons` - Icon library
- `expo-symbols` - iOS SF Symbols support
- `expo-linear-gradient` - Gradient backgrounds

**State & Forms**:
- `zustand` (v5) - State management with persistence
- `react-hook-form` (v7.66) - Form handling
- `zod` (v4.1) - Schema validation
- `@hookform/resolvers` - Form validation resolvers

**Data & Networking**:
- `axios` (v1.13) - HTTP client with interceptors
- `@react-native-async-storage/async-storage` - Persistent storage

**Location & Media**:
- `expo-location` - GPS and geocoding
- `expo-image` - Optimized image component
- `expo-image-picker` - Image selection
- `expo-clipboard` - Clipboard operations

**Lists & QR Codes**:
- `@shopify/flash-list` - High-performance lists
- `react-native-qrcode-svg` - QR code generation
- `react-native-svg` - SVG support

**UI Components**:
- `react-native-skeleton-placeholder` - Loading skeletons
- `react-native-safe-area-context` - Safe area handling

### Important Notes

- **React Native New Architecture**: Enabled via `newArchEnabled: true` in app.json
- **Babel Plugin Order**: `react-native-reanimated/plugin` must be last in babel.config.js
- **Metro Config**: Uses NativeWind Metro plugin for CSS processing
- **GPS Permissions**: Required for address auto-fill, must be requested at runtime
- **API Base URL**: Automatically switches between dev/prod based on config and `__DEV__` flag
- **Stablecoin Prices**: Products have multiple prices (one per stablecoin type)
- **Wallet Addresses**: Each user can have multiple wallets (different stablecoin + network combos)
- **Order Payment**: Users pay via wallet balance, deposits monitored by backend blockchain listeners
- **Dark Theme**: App uses dark mode throughout, configured in tailwind.config.js
- **React 19**: Using latest React features - ensure compatibility when adding new packages

### Troubleshooting

**"Unable to resolve module"**: Run `npm start -- --clear`

**"Network request failed"**:
- Check backend is running
- Verify API URL in app.json or .env
- See [NETWORK_SETUP.md](./NETWORK_SETUP.md)

**"Location permission denied"**: Check device settings, ensure permissions in app.json

**Navigation not working**: Check route file exists in `app/` directory with correct naming

**AsyncStorage errors**: Clear AsyncStorage via `AsyncStorage.clear()`

**Build errors**: Delete `node_modules`, `.expo`, and reinstall with `npm install`

**Styling issues**: Ensure NativeWind Babel preset is before reanimated plugin

## Testnet Mode

The mobile app includes a global testnet mode feature that allows switching between mainnet and testnet networks at runtime. This is useful for development, testing, and demonstrations without risking real funds.

### Overview

- **Testnet Store**: Located at `store/testnet-store.ts`
- **Network Config**: Located at `lib/network-config.ts`
- **Testnet Banner**: Visual indicator at `components/layout/TestnetBanner.tsx`
- **Persistence**: State saved to AsyncStorage and persists across app restarts

### Usage

**Accessing Testnet Mode**:
```typescript
import { useTestnetStore } from '@/store/testnet-store';

function MyComponent() {
  const { isTestnetMode, setTestnetMode, toggleTestnetMode } = useTestnetStore();

  return (
    <View>
      <Text>Current Mode: {isTestnetMode ? 'Testnet' : 'Mainnet'}</Text>
      <Button title="Toggle Mode" onPress={toggleTestnetMode} />
    </View>
  );
}
```

**Using Dynamic Network Configuration**:
```typescript
import { useTestnetStore } from '@/store/testnet-store';
import { getRpcUrl, getContractAddress, getNetworkDisplayName } from '@/lib/network-config';

function WalletScreen() {
  const { isTestnetMode } = useTestnetStore();

  // Get dynamic RPC URL
  const polygonRpc = getRpcUrl('POLYGON', isTestnetMode);
  // Mainnet: "https://polygon-mainnet.g.alchemy.com/..."
  // Testnet: "https://polygon-amoy.g.alchemy.com/..."

  // Get dynamic contract address
  const contractAddress = getContractAddress('POLYGON', isTestnetMode);
  // Mainnet: "0x0000..." (not deployed)
  // Testnet: "0xfFfD214731036E826A283d1600c967771fDdABAe"

  // Get display name
  const networkName = getNetworkDisplayName('POLYGON', isTestnetMode);
  // Mainnet: "Polygon"
  // Testnet: "Polygon Amoy"

  return <Text>Connected to {networkName}</Text>;
}
```

### Visual Indicator

When testnet mode is enabled, a blue banner appears at the top of the app:
- 20px height (equivalent to web's 5px in Tailwind)
- Blue gradient background (#2563eb to #3b82f6)
- Flask icon with text: "APPLICATION IS IN TEST MODE - USING TESTNET NETWORKS"
- Fixed position at top with z-index 9999

### Network Mappings

| Network | Mainnet | Testnet |
|---------|---------|---------|
| Ethereum | Ethereum Mainnet | Ethereum Sepolia |
| Polygon | Polygon | Polygon Amoy |
| BSC | BNB Chain | BSC Testnet |
| Arbitrum | Arbitrum One | Arbitrum Sepolia |
| Optimism | Optimism | Optimism Sepolia |
| Avalanche | Avalanche C-Chain | Avalanche Fuji |
| Base | Base | Base Sepolia |
| Sui | Sui Mainnet | Sui Testnet |
| TON | TON Mainnet | TON Testnet |
| Solana | Solana Mainnet | Solana Devnet |

### Testnet Contracts

Deployed testnet contracts (all EVM networks use the same address):
- **EVM Networks**: `0xfFfD214731036E826A283d1600c967771fDdABAe`
- **Sui Testnet**: `0xd3c5601b3110dad07821c27050dfc873a04f48e172463fba7cca5a5aa2b489cd`
- **TON Testnet**: `kQC4Gn_21IQVPj3ey44TKG3PA1ciL-XjeMmYbcO7jnAmKard`
- **Solana Devnet**: `Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS`

### Best Practices

1. **Always use testnet mode during development** to avoid spending real crypto
2. **Get free testnet tokens** from faucets (see backend API_TESTING_GUIDE.md)
3. **Use dynamic configuration functions** instead of hardcoded URLs
4. **Check if contracts are deployed** using `isNetworkDeployed()` before transactions
5. **Add testnet mode toggle** to app settings/profile screen for easy access

### Important Notes

- Testnet mode is **independent** between web and mobile apps
- State is persisted to AsyncStorage and survives app restarts
- When testnet mode is enabled, **all** blockchain interactions use testnet networks
- Super admin can toggle global testnet mode on web (affects web only, not mobile)
- To sync testnet mode between platforms, implement backend API or shared state service

### Code Conventions

- Use TypeScript for all files
- Import from `@/` path alias
- Use NativeWind className prop for styling
- Follow React Hooks rules (don't call hooks conditionally)
- Keep route files minimal, logic in screen components
- Use Zustand stores for shared state
- Handle errors gracefully with try/catch
- Show loading states during async operations
- Always request permissions before accessing device features
- Follow dark theme color palette from tailwind.config.js
