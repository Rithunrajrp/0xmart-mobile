/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#1c1c1c';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#111827', // Charcoal Black
    background: '#FFFFFF',
    tint: '#111827',
    icon: '#4B5563', // Gray 600
    tabIconDefault: '#9CA3AF', // Gray 400
    tabIconSelected: '#111827',
    border: '#E5E7EB',
  },
  dark: {
    // Forcing light theme aesthetics for "Modern Minimal" look as requested "White / off-white background"
    text: '#111827',
    background: '#FFFFFF',
    tint: '#111827',
    icon: '#4B5563',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#111827',
    border: '#E5E7EB',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
