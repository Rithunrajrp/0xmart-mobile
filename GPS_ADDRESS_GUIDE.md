# GPS-Based Address Management Guide

## Overview

0xMart mobile app includes comprehensive address management with GPS auto-fill functionality. Users can manage multiple shipping and billing addresses with automatic location detection.

---

## Features

### ✅ Multi-Address Support
- Users can save multiple addresses
- Support for both Shipping and Billing addresses
- Set default address for quick checkout
- Full CRUD operations (Create, Read, Update, Delete)

### ✅ GPS Auto-Fill
- One-tap location detection using device GPS
- Automatic reverse geocoding to get street address
- Pre-fills address fields with detected location
- Fallback to manual entry if GPS fails

### ✅ Address Selection
- Horizontal scrollable address selector for checkout
- Visual indication of selected address
- Default address auto-selected
- Quick navigation to address management

### ✅ Dark Theme UI
- Fully styled with 0xMart dark theme
- Purple accent colors (#8b5cf6)
- Smooth animations and transitions
- Responsive design

---

## Implementation Details

### Location Service (`utils/location.ts`)

```typescript
// Request location permissions
await locationService.requestPermissions();

// Get current GPS coordinates
const coords = await locationService.getCurrentLocation();
// Returns: { latitude: number, longitude: number }

// Convert coordinates to address
const address = await locationService.reverseGeocode(coords);
// Returns: {
//   street, city, state, country, postalCode,
//   formattedAddress
// }

// One-step: Get current address
const currentAddress = await locationService.getCurrentAddress();

// Search for address by text query
const results = await locationService.searchAddress("123 Main St");
```

---

## User Store Integration

**State** (`store/user-store.ts`):
```typescript
addresses: UserAddress[]  // List of user's addresses
isLoading: boolean        // Loading state
error: string | null      // Error message
```

**Actions**:
```typescript
fetchAddresses()              // Load all addresses from backend
addAddress(data)              // Create new address
updateAddress(id, data)       // Update existing address
deleteAddress(id)             // Delete address
setDefaultAddress(id)         // Mark address as default
```

---

## Screen: Address Management

**Location**: `screens/profile/AddressesScreen.tsx`

### Features:
1. **List View**
   - Displays all saved addresses
   - Shows address type (Shipping/Billing)
   - Highlights default address with star badge
   - Color-coded icons (Purple for shipping, Blue for billing)

2. **Empty State**
   - Shows when no addresses exist
   - Prompts user to add first address
   - Direct link to add address

3. **Address Card Actions**
   - **Edit**: Opens form with pre-filled data
   - **Set Default**: Makes address the default
   - **Delete**: Confirms then removes address

### GPS Auto-Fill Flow:

1. User taps **"Add Address"**
2. Modal opens with form
3. User taps **"Use Current Location"** button
4. App requests location permission (if not already granted)
5. GPS fetches current coordinates
6. Coordinates reverse geocoded to address
7. Form fields auto-filled:
   - Address Line 1 (street)
   - City
   - State/Province
   - Postal Code
   - Country
8. User fills remaining fields (name, phone, apt/suite)
9. User saves address

### Permissions Handling:

**iOS**:
- Permission prompt shown on first GPS request
- User grants "While Using App" permission
- `NSLocationWhenInUseUsageDescription` in app.json

**Android**:
- Permission prompt shown on first GPS request
- `ACCESS_FINE_LOCATION` permission required
- `ACCESS_COARSE_LOCATION` as fallback

**Permission Denied**:
- Alert shown with error message
- User can manually enter address
- GPS button disabled until permission granted

---

## Component: Address Selector

**Location**: `components/AddressSelector.tsx`

Used during checkout and wherever address selection is needed.

### Usage:

```typescript
import { AddressSelector } from '@/components/AddressSelector';

<AddressSelector
  selectedAddressId={selectedAddress?.id}
  onSelect={(address) => setSelectedAddress(address)}
  addressType="SHIPPING"  // Optional: filter by type
  title="Select Delivery Address"  // Optional: custom title
/>
```

### Features:
- **Horizontal Scroll**: Swipe through addresses
- **Visual Selection**: Selected address has purple border
- **Auto-Select Default**: Default address selected on mount
- **Empty States**: Handles no addresses and non-authenticated
- **Quick Actions**: "Manage" button to address management screen

### States Handled:
1. **Not Authenticated**: Shows login prompt
2. **Loading**: Shows spinner while fetching
3. **No Addresses**: Shows add address prompt
4. **Has Addresses**: Shows scrollable cards

---

## Address Form Validation

**Required Fields**:
- ✅ Full Name
- ✅ Phone Number
- ✅ Address Line 1
- ✅ City
- ✅ Postal Code
- ✅ Country

**Optional Fields**:
- Address Line 2 (Apt, Suite, Building)
- State/Province (optional in some countries)

**Validation Rules**:
```typescript
{
  fullName: "Must not be empty",
  phone: "Must not be empty",
  addressLine1: "Must not be empty",
  city: "Must not be empty",
  postalCode: "Must not be empty",
  country: "Must not be empty"
}
```

Errors shown inline below each field in red text.

---

## Data Types

```typescript
interface UserAddress {
  id: string;
  userId: string;
  type: "SHIPPING" | "BILLING";
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GeocodedAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formattedAddress: string;
}

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}
```

---

## API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/users/me/addresses` | Fetch all user addresses |
| POST | `/users/me/addresses` | Create new address |
| PUT | `/users/me/addresses/:id` | Update address |
| DELETE | `/users/me/addresses/:id` | Delete address |
| PATCH | `/users/me/addresses/:id/default` | Set as default |

---

## Testing Guide

### Test Case 1: GPS Auto-Fill Success
1. Open app and login
2. Navigate to Profile → Addresses
3. Tap "Add Address"
4. Tap "Use Current Location"
5. Grant location permission if prompted
6. **Expected**: Address fields auto-filled
7. Complete remaining fields
8. Save address
9. **Expected**: Address appears in list

### Test Case 2: GPS Permission Denied
1. Follow steps 1-4 above
2. Deny location permission
3. **Expected**: Alert shown "Could not detect your location"
4. GPS button still works (try again)
5. **Expected**: User can still manually enter address

### Test Case 3: Create Shipping Address
1. Add address with type "SHIPPING"
2. **Expected**: Icon shows home symbol
3. **Expected**: Purple color accent

### Test Case 4: Create Billing Address
1. Add address with type "BILLING"
2. **Expected**: Icon shows card symbol
3. **Expected**: Blue color accent

### Test Case 5: Set Default Address
1. Create 2+ addresses
2. Tap "Set Default" on second address
3. **Expected**: Star badge moves to second address
4. **Expected**: Only one address marked default

### Test Case 6: Delete Address
1. Tap "Delete" on an address
2. **Expected**: Confirmation alert shown
3. Confirm deletion
4. **Expected**: Address removed from list
5. **Expected**: Success message shown

### Test Case 7: Edit Address
1. Tap "Edit" on an address
2. **Expected**: Modal opens with pre-filled form
3. Change name
4. Tap "Update"
5. **Expected**: Address updated in list

### Test Case 8: Address Selector in Checkout
1. Add 3+ addresses
2. Navigate to checkout
3. **Expected**: Address selector shows
4. **Expected**: Default address pre-selected
5. Scroll horizontally through addresses
6. Tap different address
7. **Expected**: Visual selection changes

### Test Case 9: Empty Address List
1. Delete all addresses
2. **Expected**: Empty state shown
3. **Expected**: "Add Address" button visible
4. Tap button
5. **Expected**: Form modal opens

### Test Case 10: Offline GPS
1. Turn off WiFi and mobile data
2. Try to use GPS auto-fill
3. **Expected**: Error shown
4. **Expected**: User can still manually enter

---

## Error Handling

### GPS Errors:
- **Permission Denied**: "Location permission denied"
- **GPS Unavailable**: "Could not detect your location"
- **Timeout**: "Location request timed out"
- **Network Error**: "Network error while geocoding"

### API Errors:
- **Create Failed**: "Failed to add address"
- **Update Failed**: "Failed to update address"
- **Delete Failed**: "Failed to delete address"
- **Fetch Failed**: "Failed to fetch addresses"

All errors shown via `Alert.alert()` with clear messages.

---

## Performance Optimizations

1. **GPS Timeout**: 10 seconds max for location fetch
2. **Lazy Loading**: Addresses fetched only when needed
3. **Caching**: Address list cached in Zustand store
4. **Debouncing**: Prevents multiple simultaneous GPS requests
5. **Optimistic Updates**: UI updates before API confirmation

---

## Accessibility

1. **Screen Reader**: All buttons and fields labeled
2. **Touch Targets**: Minimum 44x44 points
3. **Color Contrast**: WCAG AA compliant
4. **Focus Management**: Proper tab order
5. **Error Announcements**: Errors read by screen reader

---

## Known Limitations

1. **GPS Accuracy**: Varies by device and environment
   - **Indoor**: May be less accurate
   - **Urban**: Better accuracy
   - **Rural**: May have delays

2. **Reverse Geocoding**: Address format varies by region
   - Some countries don't have street numbers
   - State/province optional in some regions

3. **Network Dependency**: Requires internet for geocoding
   - GPS works offline
   - Reverse geocoding needs network

4. **Battery Impact**: GPS uses significant battery
   - Only activated on button press
   - Automatically stops after result

---

## Future Enhancements

### Planned Features:
1. **Address Search**: Search addresses by text
2. **Map View**: Show address on map
3. **Address Validation**: Validate with postal service APIs
4. **Saved Locations**: Quick access to frequent addresses
5. **Nickname Addresses**: "Home", "Work", "Mom's House"
6. **Address Sharing**: Share address via QR code
7. **Import Contacts**: Import from phone contacts
8. **Auto-Complete**: Google Places autocomplete

### Technical Improvements:
1. **Background Location**: Track delivery in progress
2. **Geofencing**: Notify when near delivery address
3. **Route Optimization**: Multi-stop deliveries
4. **Address Clustering**: Group nearby addresses

---

## Troubleshooting

### Issue: GPS Not Working
**Symptoms**: "Use Current Location" doesn't work
**Solutions**:
1. Check location permission in device settings
2. Ensure GPS is enabled on device
3. Try restarting app
4. Check network connection
5. Try in open area (not indoors)

### Issue: Wrong Address Detected
**Symptoms**: GPS returns incorrect address
**Solutions**:
1. Move to open area for better GPS signal
2. Wait for better GPS lock
3. Manually correct address fields
4. Use address search instead

### Issue: Addresses Not Loading
**Symptoms**: Address list empty but should have data
**Solutions**:
1. Check internet connection
2. Pull to refresh
3. Logout and login again
4. Check backend API status

### Issue: Can't Delete Default Address
**Symptoms**: Delete button doesn't work on default address
**Solutions**:
1. Set another address as default first
2. Then delete the previous default

---

## Security & Privacy

1. **Location Data**:
   - Never stored on backend
   - Only used for geocoding
   - Immediately discarded after use

2. **Address Data**:
   - Encrypted in transit (HTTPS)
   - Stored securely on backend
   - Only accessible by authenticated user
   - Not shared with third parties

3. **Permissions**:
   - Location: Only "While Using App"
   - No background location tracking
   - User can revoke anytime in settings

---

## Best Practices for Developers

1. **Always Check Authentication**: Address features require login
2. **Handle All Error Cases**: GPS can fail in many ways
3. **Provide Manual Fallback**: Don't rely solely on GPS
4. **Validate All Inputs**: Never trust geocoded data
5. **Test on Real Devices**: Simulators don't have real GPS
6. **Consider International**: Address formats vary globally
7. **Optimize Battery**: GPS usage should be minimal
8. **Cache Appropriately**: Reduce API calls

---

## Code Examples

### Example 1: Using Location Service
```typescript
import { locationService } from '@/utils/location';

// Get current address
const handleGetAddress = async () => {
  try {
    const address = await locationService.getCurrentAddress();
    if (address) {
      setFormData({
        ...formData,
        addressLine1: address.street || '',
        city: address.city || '',
        state: address.state || '',
        postalCode: address.postalCode || '',
        country: address.country || '',
      });
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to get location');
  }
};
```

### Example 2: Using Address Store
```typescript
import { useUserStore } from '@/store/user-store';

const MyComponent = () => {
  const { addresses, fetchAddresses, addAddress } = useUserStore();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = async (data) => {
    try {
      await addAddress(data);
      Alert.alert('Success', 'Address added');
    } catch (error) {
      Alert.alert('Error', 'Failed to add address');
    }
  };

  return (
    <View>
      {addresses.map(addr => (
        <Text key={addr.id}>{addr.fullName}</Text>
      ))}
    </View>
  );
};
```

### Example 3: Using Address Selector
```typescript
import { AddressSelector } from '@/components/AddressSelector';
import { useState } from 'react';

const CheckoutScreen = () => {
  const [selectedAddress, setSelectedAddress] = useState(null);

  return (
    <View>
      <AddressSelector
        selectedAddressId={selectedAddress?.id}
        onSelect={setSelectedAddress}
        addressType="SHIPPING"
      />
      <Button
        title="Continue to Payment"
        disabled={!selectedAddress}
        onPress={handleCheckout}
      />
    </View>
  );
};
```

---

## Support

For issues or questions:
1. Check this guide first
2. Review console logs for errors
3. Test on physical device (not simulator)
4. Check backend API connectivity
5. Report bugs via GitHub issues

---

**Last Updated**: 2025-11-30
**Version**: 1.0.0
**Maintainer**: 0xMart Development Team
