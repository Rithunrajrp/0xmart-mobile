# 0xMart Mobile App - Testing Checklist

## Critical Bug Fixes Testing

### 1. Search Bar Visibility ✓

**Screens Where Search SHOULD Appear**:
- [ ] Home/Shop tab (index)
- [ ] Collection tab
- [ ] Exclusive tab
- [ ] Product detail screens
- [ ] Search results screen
- [ ] Favorites screen (browsing favorites)
- [ ] Cart screen (might add more items)

**Screens Where Search Should NOT Appear**:
- [ ] Profile tab
- [ ] Reward tab
- [ ] Login screen
- [ ] Orders list screen
- [ ] Order detail screen
- [ ] Checkout screen
- [ ] Wallet screens
- [ ] Address management screen

**Test Steps**:
1. Open app and navigate to each screen listed above
2. Verify search bar presence/absence matches expectations
3. On screens with search, verify search functionality works
4. Verify search input clears when navigating away

---

### 2. Profile Screen After Login ✓

**Test Scenario 1: Successful Profile Load**:
- [ ] Login with valid credentials
- [ ] Navigate to Profile tab
- [ ] Verify profile data loads (email, phone, name)
- [ ] Verify status badges display correctly
- [ ] Verify all menu items are clickable
- [ ] No error banners should appear

**Test Scenario 2: Profile API Failure**:
- [ ] Disconnect backend or block /users/me endpoint
- [ ] Login successfully (auth still works)
- [ ] Navigate to Profile tab
- [ ] Verify error banner appears with clear message
- [ ] Verify "Retry" button is present
- [ ] Click retry and verify it attempts to reload
- [ ] Verify fallback to auth store data works (limited data shown)

**Test Scenario 3: Profile During Loading**:
- [ ] Slow down network (Chrome DevTools → Throttling)
- [ ] Navigate to Profile tab
- [ ] Verify loading spinner appears
- [ ] Verify loading doesn't block other interactions
- [ ] Wait for load and verify data appears

---

### 3. Cart User-Scoping ✓

**Test Scenario 1: Single User Cart Persistence**:
- [ ] Login as User A (create test account if needed)
- [ ] Add 3 different products to cart
- [ ] Note cart count badge on header
- [ ] Close app completely (force quit)
- [ ] Reopen app
- [ ] Verify cart still has 3 items
- [ ] Verify cart count badge is correct

**Test Scenario 2: Multi-User Cart Isolation**:
- [ ] Login as User A
- [ ] Add Product X and Product Y to cart
- [ ] Note cart has 2 items
- [ ] Logout
- [ ] Login as User B (different account)
- [ ] Verify cart is empty (0 items)
- [ ] Add Product Z to cart
- [ ] Verify cart shows 1 item
- [ ] Logout
- [ ] Login as User A again
- [ ] Verify cart is empty (cart cleared on logout)
  - **Note**: Current implementation clears cart on logout for privacy

**Test Scenario 3: Guest to Authenticated Cart**:
- [ ] Browse as guest (skip login)
- [ ] Add items to cart as guest
- [ ] Login with credentials
- [ ] Verify cart is cleared (user-specific cart takes over)
  - **Expected behavior**: Guest cart is replaced with authenticated user cart

---

### 4. Favorites Sync ✓

**Test Scenario 1: Favorites Fetch on Login**:
- [ ] On another device or browser, login and add products to favorites
- [ ] On mobile app, login with same account
- [ ] Navigate to Favorites screen
- [ ] Verify favorites from backend appear
- [ ] Verify heart icons are filled on product cards

**Test Scenario 2: Favorites Clear on Logout**:
- [ ] Login and add products to favorites
- [ ] Verify favorites appear in Favorites screen
- [ ] Logout
- [ ] Browse products as guest
- [ ] Verify heart icons are empty (no favorites)
- [ ] Navigate to Favorites screen
- [ ] Verify "Login required" message appears

**Test Scenario 3: Favorites Toggle**:
- [ ] Login
- [ ] On Home screen, tap heart icon on a product
- [ ] Verify heart fills immediately (optimistic update)
- [ ] Navigate to Favorites screen
- [ ] Verify product appears in list
- [ ] Tap heart again to remove
- [ ] Verify product disappears from favorites

**Test Scenario 4: Favorites Fetch Failure**:
- [ ] Block favorites endpoint
- [ ] Login (auth works)
- [ ] Check console logs for "Failed to fetch favorites"
- [ ] Verify app still works, favorites just empty
- [ ] No crashes or blocking errors

---

### 5. Authentication Flow ✓

**Test Scenario 1: Complete Login Flow**:
- [ ] Open app (fresh install or after logout)
- [ ] Tap Login or try to access protected feature
- [ ] Enter email and phone number
- [ ] Tap "Send OTP"
- [ ] Verify success message
- [ ] Enter received OTP code
- [ ] Tap "Verify & Login"
- [ ] Verify success message
- [ ] Verify redirect to Home tab
- [ ] Navigate to Profile tab
- [ ] Verify profile data loads
- [ ] Verify cart initializes for user
- [ ] Verify favorites load

**Test Scenario 2: Login with Existing Session**:
- [ ] Login successfully
- [ ] Close app (don't logout)
- [ ] Wait 30 seconds
- [ ] Reopen app
- [ ] Verify app shows loading screen briefly
- [ ] Verify user is still logged in
- [ ] Verify profile loads automatically
- [ ] Verify cart persists
- [ ] Verify favorites load

**Test Scenario 3: Expired Token Handling**:
- [ ] Login successfully
- [ ] Manually clear access token from AsyncStorage (dev tools)
- [ ] Try to navigate to protected screen
- [ ] Verify automatic token refresh attempt
- [ ] If refresh fails, verify redirect to login

**Test Scenario 4: Complete Logout Flow**:
- [ ] Login and add items to cart
- [ ] Add products to favorites
- [ ] Navigate to Profile
- [ ] Tap Logout
- [ ] Verify confirmation alert appears
- [ ] Confirm logout
- [ ] Verify redirect to Home (as guest)
- [ ] Verify cart is empty
- [ ] Verify favorites are cleared
- [ ] Verify profile shows "Not logged in"
- [ ] Verify AsyncStorage is cleared (dev tools)

---

## Regression Testing

### Navigation
- [ ] Tab bar navigation works on all 5 tabs
- [ ] Back button works on all stack screens
- [ ] Deep links work (product/[id], orders/[id])
- [ ] Navigation state persists across app restarts

### Product Browsing
- [ ] Products load on Home screen
- [ ] Product images display correctly
- [ ] Product prices show in selected stablecoin
- [ ] Product detail screen loads when tapped
- [ ] "Add to Cart" works from product detail
- [ ] Quantity selector works

### Shopping Cart
- [ ] Add to cart updates badge count
- [ ] Cart screen shows all items
- [ ] Quantity adjustment works (+/-)
- [ ] Remove item works
- [ ] Stablecoin selector works
- [ ] Total price updates correctly
- [ ] "Proceed to Checkout" navigates correctly

### Orders
- [ ] Orders list loads
- [ ] Order detail screen shows correct data
- [ ] Order status displays correctly
- [ ] Order confirmation screen shows after checkout

### Wallets
- [ ] Wallet list loads
- [ ] Create wallet flow works
- [ ] Wallet detail shows balance and address
- [ ] Deposit screen shows QR code
- [ ] Copy address works

### Rewards
- [ ] Rewards screen loads without search bar
- [ ] Points balance displays
- [ ] Tier information shows
- [ ] Tabs switch correctly (Purchase, Referral, Subscription)
- [ ] Mystery boxes display

---

## Performance Testing

### App Launch
- [ ] Cold start time < 3 seconds
- [ ] Warm start time < 1 second
- [ ] Splash screen shows appropriately

### Screen Transitions
- [ ] Tab switches are smooth (no lag)
- [ ] Stack navigation is smooth
- [ ] No flickering during transitions

### Data Loading
- [ ] Product list loads progressively
- [ ] Images load without blocking UI
- [ ] Scroll performance is smooth with many items

### Network
- [ ] App handles slow 3G connection
- [ ] App handles network failure gracefully
- [ ] Retry mechanisms work

---

## Device Testing

### iOS
- [ ] iPhone (iOS 15+)
- [ ] iPad (if supported)
- [ ] Test on physical device (not just simulator)

### Android
- [ ] Android 12+
- [ ] Different screen sizes (small, medium, large)
- [ ] Test on physical device (not just emulator)

---

## Edge Cases

### Authentication
- [ ] Multiple rapid login attempts
- [ ] Login with invalid OTP
- [ ] Login with expired OTP
- [ ] Logout during active API calls

### Cart
- [ ] Add same item multiple times
- [ ] Add items exceeding stock
- [ ] Update quantity to 0 (should remove)
- [ ] Large cart (50+ items)

### Network
- [ ] Airplane mode enabled
- [ ] WiFi drops during operation
- [ ] API returns 500 errors
- [ ] API timeouts

### Storage
- [ ] Device low storage
- [ ] AsyncStorage full
- [ ] AsyncStorage corruption (simulate)

---

## Accessibility Testing

- [ ] Screen reader works (VoiceOver/TalkBack)
- [ ] Text scaling works (increase font size)
- [ ] Color contrast is sufficient
- [ ] Touch targets are large enough (44x44dp minimum)

---

## Security Testing

### Data Protection
- [ ] Tokens not visible in logs
- [ ] Sensitive data not cached inappropriately
- [ ] AsyncStorage data encrypted (if configured)

### Authentication
- [ ] Token refresh works securely
- [ ] Logout clears all sensitive data
- [ ] Session timeout works

---

## Sign-Off Checklist

Before marking as tested:

- [ ] All critical bugs verified fixed
- [ ] No new bugs introduced
- [ ] Performance is acceptable
- [ ] Works on iOS and Android
- [ ] Works on physical devices
- [ ] Error handling is user-friendly
- [ ] No console errors in normal operation
- [ ] AsyncStorage usage is correct
- [ ] App doesn't crash in any scenario tested

---

## Test Results

### Tester Information
- **Tester Name**: _______________
- **Test Date**: _______________
- **App Version**: _______________
- **Device Used**: _______________
- **OS Version**: _______________

### Issues Found
| Issue # | Description | Severity | Status |
|---------|-------------|----------|--------|
| 1 | | High/Med/Low | Open/Fixed |
| 2 | | High/Med/Low | Open/Fixed |
| 3 | | High/Med/Low | Open/Fixed |

### Overall Test Result
- [ ] PASS - Ready for deployment
- [ ] PASS WITH MINOR ISSUES - Deploy with known issues documented
- [ ] FAIL - Critical issues must be fixed before deployment

### Notes
_Add any additional notes, observations, or recommendations here_

---

## Automated Testing Recommendations

### Unit Tests Needed
- [ ] Cart store logic
- [ ] Auth store logic
- [ ] Favorites store logic
- [ ] API client methods

### Integration Tests Needed
- [ ] Login → Profile flow
- [ ] Add to cart → Checkout flow
- [ ] Favorites toggle flow

### E2E Tests Needed
- [ ] Complete purchase flow
- [ ] Multi-user scenario
- [ ] Network failure recovery

---

**Last Updated**: 2025-11-30
**Next Review**: Before each major release
