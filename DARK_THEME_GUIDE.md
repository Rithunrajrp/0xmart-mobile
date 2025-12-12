# Dark Theme Implementation Guide

The 0xMart mobile app has been updated to use a dark theme based on the design reference. This guide explains the color palette and how to apply dark theme styles to screens and components.

## Color Palette

### Background Colors
```typescript
background: {
  DEFAULT: "#0a0a0a",      // Main background
  secondary: "#121212",     // Alternative background
  tertiary: "#1a1a1a",      // Elevated surfaces
}
```

### Card Colors
```typescript
card: {
  DEFAULT: "#1a1a1a",       // Card background
  secondary: "#1e1e1e",     // Alternative card
  hover: "#222222",         // Hover/pressed state
}
```

### Border Colors
```typescript
border: {
  DEFAULT: "#2a2a2a",       // Default borders
  light: "#333333",         // Lighter borders
}
```

### Text Colors
```typescript
text: {
  primary: "#ffffff",       // Primary text (headings, important text)
  secondary: "#a0a0a0",     // Secondary text (descriptions)
  tertiary: "#6a6a6a",      // Tertiary text (hints, placeholders)
  muted: "#4a4a4a",         // Muted text (disabled)
}
```

### Accent Colors
```typescript
primary: "#8b5cf6",         // Purple - primary actions, buttons
accent: {
  blue: "#3b82f6",          // Blue accent
  purple: "#8b5cf6",        // Purple accent
  pink: "#ec4899",          // Pink accent
  green: "#10b981",         // Green accent
}
```

### Semantic Colors
```typescript
success: "#22c55e",         // Success states
danger: "#ef4444",          // Error states, destructive actions
warning: "#f59e0b",         // Warning states
info: "#3b82f6",            // Info states
```

## Component Styling

### Updated Components

#### Button Component
- **Primary**: Purple background (`#8b5cf6`), white text
- **Secondary**: Dark card background (`#1e1e1e`), white text
- **Outline**: Transparent background, dark border (`#2a2a2a`), light gray text
- **Danger**: Red background (`#ef4444`), white text
- **Ghost**: Transparent background, light gray text
- **Border Radius**: 12px (rounded corners)

#### Input Component
- **Background**: Card background (`#1a1a1a`)
- **Border**: Dark border (`#2a2a2a`)
- **Border Radius**: 12px
- **Text Color**: White (`#ffffff`)
- **Placeholder**: Tertiary text (`#6a6a6a`)
- **Label**: White (`#ffffff`)
- **Error Border**: Danger color (`#ef4444`)
- **Error Text**: Danger color (`#ef4444`)

#### Card Component
- **Background**: Card background (`#1a1a1a`)
- **Border**: Dark border (`#2a2a2a`), 1px width
- **Border Radius**: 16px
- **Shadow**: Black shadow for depth

#### CountryCodePicker Component
- **Picker Background**: Card background (`#1a1a1a`)
- **Border**: Dark border (`#2a2a2a`)
- **Modal Background**: Dark with higher opacity (`rgba(0, 0, 0, 0.8)`)
- **Modal Content**: Card background with border
- **Selected Item**: Hover color (`#2a2a2a`)
- **Checkmark**: Primary color (`#8b5cf6`)

## Screen Styling Pattern

When updating screens to dark theme, follow this pattern:

### Container Style
```typescript
container: {
  flex: 1,
  backgroundColor: "#0a0a0a", // Main background
}
```

### Headers and Titles
```typescript
title: {
  fontSize: 28,
  fontWeight: "700",
  color: "#ffffff", // Primary text
}

subtitle: {
  fontSize: 16,
  color: "#a0a0a0", // Secondary text
}
```

### Section Headers
```typescript
sectionTitle: {
  fontSize: 20,
  fontWeight: "600",
  color: "#ffffff", // Primary text
}
```

### Body Text
```typescript
bodyText: {
  fontSize: 14,
  color: "#a0a0a0", // Secondary text
}

mutedText: {
  fontSize: 12,
  color: "#6a6a6a", // Tertiary text
}
```

### Icons
- **Primary Icons**: Use primary color (`#8b5cf6`) for main actions
- **Secondary Icons**: Use secondary text color (`#a0a0a0`)
- **Muted Icons**: Use tertiary text color (`#6a6a6a`)

### Product Cards
```typescript
productCard: {
  backgroundColor: "#1a1a1a",
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "#2a2a2a",
}

productTitle: {
  color: "#ffffff",
  fontSize: 16,
  fontWeight: "600",
}

productPrice: {
  color: "#8b5cf6", // Primary color for prices
  fontSize: 18,
  fontWeight: "700",
}

productDescription: {
  color: "#a0a0a0",
  fontSize: 14,
}
```

### Status Badges
```typescript
// Active/Success
statusActive: {
  backgroundColor: "#22c55e",
  color: "#ffffff",
}

// Warning/Pending
statusPending: {
  backgroundColor: "#f59e0b",
  color: "#ffffff",
}

// Error/Cancelled
statusError: {
  backgroundColor: "#ef4444",
  color: "#ffffff",
}

// Inactive/Disabled
statusInactive: {
  backgroundColor: "#2a2a2a",
  color: "#6a6a6a",
}
```

## Screen-by-Screen Updates

### Already Updated
- ✅ LoginScreen (`screens/auth/LoginScreen.tsx`)
- ✅ UI Components (Button, Input, Card, CountryCodePicker)

### To Update

For each screen, replace:

#### Background Colors
- `#f2f2f2`, `#ffffff` → `#0a0a0a` (containers)
- Card backgrounds → `#1a1a1a`

#### Text Colors
- `#0a0a0a`, `#1c1c1c`, `#000000` → `#ffffff` (titles, headings)
- `#6a6a6a`, `#666666` → `#a0a0a0` (body text)
- `#9b9b9b`, `#999999` → `#6a6a6a` (muted text)

#### Border Colors
- `#d1d1d1`, `#e5e5e5`, `#cccccc` → `#2a2a2a`

#### Icon Colors
- Main icons → `#8b5cf6` (primary)
- Secondary icons → `#a0a0a0`
- Muted icons → `#6a6a6a`

#### Button Colors
- Primary buttons → `#8b5cf6`
- Danger buttons → `#ef4444`

### Example Screen Update

**Before:**
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0a0a0a",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  text: {
    fontSize: 14,
    color: "#6a6a6a",
  },
});
```

**After:**
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a", // Dark background
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff", // White text
  },
  card: {
    backgroundColor: "#1a1a1a", // Dark card
    borderRadius: 16, // Slightly more rounded
    borderWidth: 1,
    borderColor: "#2a2a2a", // Dark border
  },
  text: {
    fontSize: 14,
    color: "#a0a0a0", // Light gray text
  },
});
```

## Using Tailwind Classes

If using NativeWind classes, use these mappings:

### Backgrounds
- `bg-background` → `#0a0a0a`
- `bg-card` → `#1a1a1a`
- `bg-card-secondary` → `#1e1e1e`

### Text
- `text-text-primary` → `#ffffff`
- `text-text-secondary` → `#a0a0a0`
- `text-text-tertiary` → `#6a6a6a`

### Borders
- `border-border` → `#2a2a2a`
- `border-border-light` → `#333333`

### Accent Colors
- `bg-primary` or `text-primary` → `#8b5cf6`
- `bg-success` or `text-success` → `#22c55e`
- `bg-danger` or `text-danger` → `#ef4444`
- `bg-warning` or `text-warning` → `#f59e0b`

## StatusBar Configuration

The status bar should be set to light content mode:

```typescript
import { StatusBar } from 'expo-status-bar';

<StatusBar style="light" />
```

This is already configured in `app/_layout.tsx` via:
```json
"userInterfaceStyle": "dark"
```

## Testing Dark Theme

1. Clear cache and restart:
```bash
npm start -- --clear
```

2. Verify colors in:
   - Login screen
   - Home/Shop screen
   - Product cards
   - Forms and inputs
   - Buttons
   - Modals and overlays

3. Check contrast ratios for accessibility:
   - Text on dark backgrounds should be clearly readable
   - Interactive elements should be distinguishable

## Common Patterns

### Loading States
```typescript
<ActivityIndicator color="#8b5cf6" size="large" />
```

### Empty States
```typescript
emptyStateText: {
  color: "#6a6a6a",
  fontSize: 16,
  textAlign: "center",
}
```

### Dividers
```typescript
divider: {
  height: 1,
  backgroundColor: "#2a2a2a",
}
```

### Shadows
```typescript
shadow: {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
}
```

## Notes

- All screens should maintain consistent spacing and padding
- Interactive elements should have clear visual feedback (opacity, color change)
- Ensure sufficient contrast for accessibility (WCAG AA minimum)
- Test on both iOS and Android to ensure colors render consistently
- Consider adding subtle gradients to cards for visual interest (optional)

## Quick Reference Card

| Element | Color Value | Variable |
|---------|-------------|----------|
| Main Background | `#0a0a0a` | `background.DEFAULT` |
| Card Background | `#1a1a1a` | `card.DEFAULT` |
| Border | `#2a2a2a` | `border.DEFAULT` |
| Primary Text | `#ffffff` | `text.primary` |
| Secondary Text | `#a0a0a0` | `text.secondary` |
| Muted Text | `#6a6a6a` | `text.tertiary` |
| Primary Button | `#8b5cf6` | `primary.DEFAULT` |
| Success | `#22c55e` | `success.DEFAULT` |
| Danger | `#ef4444` | `danger.DEFAULT` |
| Warning | `#f59e0b` | `warning.DEFAULT` |

Use this guide to ensure consistent dark theme implementation across all screens!
