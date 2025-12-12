# 0xMart Mobile Application

A comprehensive React Native mobile application for 0xMart - a multi-currency stablecoin commerce platform.

## Features

### Core Shopping Experience
- **Product Browsing**: Search, filter by category, and browse products
- **Product Details**: Image gallery, reviews, stock info, add to cart
- **Shopping Cart**: Cart management with quantity updates, stablecoin selection
- **Favorites/Wishlist**: Save favorite products for later
- **Guest Browsing**: No login required for browsing products

### Authentication
- **OTP-Based Login**: Email/phone + OTP verification
- **Auto Token Refresh**: Seamless authentication with AsyncStorage persistence
- **Protected Routes**: Cart and favorites require authentication

### Wallet Management
- **Multi-Stablecoin Support**: USDT, USDC, DAI, BUSD
- **Multi-Network**: Ethereum, Polygon, BSC, Arbitrum, Optimism, Avalanche, Base
- **Create Wallets**: Generate new wallets for different coins and networks
- **Deposit**: QR code and address for receiving funds
- **Withdraw**: Send funds to external addresses
- **Transaction History**: View all wallet transactions

### Orders
- **Checkout Flow**: Address selection, payment method, order summary
- **Order Confirmation**: Success screen with order details
- **Order History**: Filter by status, view tracking info
- **Order Details**: Complete order information with tracking

### Address Management
- **GPS Integration**: Auto-fill addresses using current location
- **CRUD Operations**: Add, edit, delete shipping/billing addresses
- **Default Address**: Set default for quick checkout

### User Profile
- **Profile Info**: View user details, KYC status
- **Quick Access**: Links to wallets, addresses, orders, favorites
- **Settings**: Notifications, security, help & support
- **Logout**: Secure logout with confirmation

## Tech Stack

- **Framework**: React Native with Expo SDK v54
- **Navigation**: Expo Router v6 (file-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: Zustand v5 with AsyncStorage persistence
- **HTTP Client**: Axios with token refresh interceptors
- **Location**: Expo Location with geocoding
- **UI Components**: Custom shadcn-style components

## Project Structure

```
0xmart-mobile/
├── app/                          # Expo Router routes
│   ├── (tabs)/                   # Bottom tab navigation
│   │   ├── _layout.tsx           # Tab layout configuration
│   │   ├── index.tsx             # Home/Shop tab
│   │   ├── favorites.tsx         # Favorites tab
│   │   ├── cart.tsx              # Cart tab
│   │   ├── orders.tsx            # Orders tab
│   │   └── profile.tsx           # Profile tab
│   ├── auth/
│   │   └── login.tsx             # Login screen
│   ├── product/
│   │   └── [id].tsx              # Product detail screen
│   ├── orders/
│   │   ├── [id].tsx              # Order detail screen
│   │   └── [id]/
│   │       └── confirmation.tsx  # Order confirmation
│   ├── wallets/
│   │   ├── [id].tsx              # Wallet detail screen
│   │   ├── [id]/
│   │   │   ├── deposit.tsx       # Deposit screen
│   │   │   └── withdraw.tsx      # Withdraw screen
│   │   └── create.tsx            # Create wallet screen
│   ├── addresses.tsx             # Address management
│   ├── checkout.tsx              # Checkout screen
│   └── _layout.tsx               # Root layout
├── screens/                      # Screen components
│   ├── auth/
│   │   └── LoginScreen.tsx
│   ├── shop/
│   │   ├── HomeScreen.tsx
│   │   ├── ProductDetailScreen.tsx
│   │   └── FavoritesScreen.tsx
│   ├── cart/
│   │   ├── CartScreen.tsx
│   │   └── CheckoutScreen.tsx
│   ├── order/
│   │   ├── OrdersScreen.tsx
│   │   ├── OrderDetailScreen.tsx
│   │   └── OrderConfirmationScreen.tsx
│   ├── wallets/
│   │   ├── WalletsScreen.tsx
│   │   ├── WalletDetailScreen.tsx
│   │   ├── DepositScreen.tsx
│   │   ├── WithdrawScreen.tsx
│   │   └── CreateWalletScreen.tsx
│   └── profile/
│       ├── ProfileScreen.tsx
│       └── AddressesScreen.tsx
├── components/                   # Reusable components
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   └── product/
│       ├── ProductCard.tsx
│       └── ProductGrid.tsx
├── store/                        # Zustand stores
│   ├── auth-store.ts             # Authentication state
│   ├── cart-store.ts             # Shopping cart state
│   ├── favorites-store.ts        # Favorites state
│   └── user-store.ts             # User profile, addresses, wallets
├── utils/
│   └── location.ts               # GPS and geocoding utilities
├── api/
│   └── index.ts                  # API client with auth interceptors
├── types/
│   └── index.ts                  # TypeScript type definitions
├── tailwind.config.js            # Tailwind configuration
├── babel.config.js               # Babel configuration
├── app.json                      # Expo configuration
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator
- Backend API running at http://localhost:8000

### Installation

1. Install dependencies:
```bash
cd 0xmart-mobile
npm install
```

2. Set up environment variables:
Update `app.json` extra.apiUrl if needed:
```json
"extra": {
  "apiUrl": "http://localhost:8000/api/v1"
}
```

3. Start the development server:
```bash
npm start
```

4. Run on a platform:
```bash
npm run android    # Android emulator
npm run ios        # iOS simulator (Mac only)
npm run web        # Web browser
```

## Key Features Implementation

### Authentication Flow
1. User browses products as guest
2. When adding to cart/favorites, login prompt appears
3. OTP sent to email/phone
4. User enters OTP to complete login
5. JWT tokens stored in AsyncStorage
6. Auto token refresh on 401 responses

### Shopping Flow
1. Browse products on home screen
2. Search and filter by category
3. View product details
4. Add to cart (login required)
5. Review cart and select stablecoin
6. Proceed to checkout
7. Select/add shipping address (GPS auto-fill available)
8. Select payment wallet
9. Confirm order
10. View order confirmation

### Wallet Operations
1. Create wallet for stablecoin + network
2. View wallet balance and address
3. Deposit: Show QR code and address
4. Withdraw: Enter address and amount
5. View transaction history

### GPS Address Auto-Fill
1. User taps "Use Current Location"
2. App requests location permission
3. Gets GPS coordinates
4. Reverse geocodes to address
5. Pre-fills address form

## State Management

### Auth Store
- User info, tokens, authentication status
- Persisted to AsyncStorage
- Auto-rehydrates on app launch

### Cart Store
- Cart items with quantities
- Selected stablecoin
- Persisted to AsyncStorage
- Calculates totals

### Favorites Store
- Favorite product IDs
- Syncs with backend API
- Toggle favorite status

### User Store
- Profile information
- Addresses list
- Wallets list
- Statistics

## API Integration

The app communicates with the NestJS backend at `http://localhost:8000/api/v1`.

### Endpoints Used:
- **Auth**: `/auth/login`, `/auth/verify-otp`, `/auth/refresh-token`
- **Products**: `/products`, `/products/:id`
- **Cart**: `/cart`, `/cart/items`
- **Orders**: `/orders`, `/orders/:id`
- **Wallets**: `/wallets`, `/wallets/create`
- **Favorites**: `/favorites`, `/favorites/:productId`
- **Addresses**: `/addresses`
- **Users**: `/users/me`, `/users/profile`

### Auto Token Refresh
The API client automatically refreshes expired access tokens using the refresh token stored in AsyncStorage.

## Styling

The app uses NativeWind (Tailwind CSS for React Native) with a custom color palette:

- **Primary**: `#0ea5e9` (Sky blue)
- **Success**: `#22c55e` (Green)
- **Danger**: `#ef4444` (Red)
- **Warning**: `#f59e0b` (Amber)
- **Dark**: `#111827` (Gray-900)

## Permissions

### iOS
- **Location**: For GPS address auto-fill
- **Camera**: For QR code scanning (future feature)

### Android
- **ACCESS_FINE_LOCATION**: For GPS
- **ACCESS_COARSE_LOCATION**: For GPS
- **CAMERA**: For QR codes (future feature)

## Development Tips

### Hot Reload
Changes to code trigger instant reload in Expo Go app.

### Debugging
- Shake device/press Cmd+D (iOS) or Cmd+M (Android)
- Enable Remote JS Debugging
- Use React Native Debugger

### State Inspection
Add console logs in stores to track state changes:
```typescript
useAuthStore.subscribe((state) => {
  console.log('Auth state:', state);
});
```

### Clear AsyncStorage
To reset app state during development:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.clear();
```

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

### EAS Build (Recommended)
```bash
eas build --platform ios
eas build --platform android
```

## Troubleshooting

### Network Error / API Connection Failed
**See [NETWORK_SETUP.md](./NETWORK_SETUP.md) for detailed network troubleshooting guide.**

Quick fixes:
- Verify backend is running at http://localhost:8000
- If testing on physical device, update API URL to your computer's IP
- For Android emulator, use `http://10.0.2.2:8000/api/v1`
- Check firewall settings
- Ensure device and computer are on same WiFi

### SafeAreaView Deprecation Warning
The app uses `react-native-safe-area-context` instead of the deprecated SafeAreaView. If you see warnings:
```bash
npm install react-native-safe-area-context
npm start -- --clear
```

### Location Not Working
- Check permissions in device settings
- Ensure location services enabled
- Test on physical device (simulators may have issues)

### AsyncStorage Errors
- Clear AsyncStorage: `AsyncStorage.clear()`
- Reinstall app

### Navigation Issues
- Delete `.expo` folder
- Run `expo start --clear`

## Next Steps

1. **Install required packages**:
```bash
npm install expo-location @react-native-async-storage/async-storage expo-clipboard react-native-qrcode-svg react-native-svg
```

2. **Test the app**: Run `npm start` and test all flows
3. **Backend integration**: Ensure backend is running and accessible
4. **Add images**: Replace placeholder images in assets folder
5. **Test payments**: Test wallet deposits and withdrawals
6. **Test GPS**: Test address auto-fill on physical device

## Support

For issues or questions:
- Check backend logs at http://localhost:8000/api/v1/docs
- Review API client in `api/index.ts`
- Check Zustand store states
- Clear AsyncStorage and re-login

## License

Proprietary - 0xMart
