import { AnimatedSplashScreen } from '@/components/ui/AnimatedSplashScreen';
import { TestnetBanner } from '@/components/layout/TestnetBanner';
import { useAuthStore } from '@/store/auth-store';
import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold
} from '@expo-google-fonts/inter';
import {
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold
} from '@expo-google-fonts/playfair-display';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isAuthenticated, accessToken, fetchUser, user } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSplashAnimationFinished, setIsSplashAnimationFinished] = useState(false);

    const [fontsLoaded] = useFonts({
      'PlayfairDisplay-Regular': PlayfairDisplay_400Regular,
      'PlayfairDisplay-Bold': PlayfairDisplay_700Bold,
      'Inter-Regular': Inter_400Regular,
      'Inter-Medium': Inter_500Medium,
      'Inter-SemiBold': Inter_600SemiBold,
      'Inter-Bold': Inter_700Bold,
    });

  useEffect(() => {
    // Initialize auth state on app startup
    const initAuth = async () => {
      try {
        // Wait for zustand persist to rehydrate
        await new Promise(resolve => setTimeout(resolve, 150));

        // If we have a token, fetch user data to verify it's still valid
        if (accessToken) {
          try {
            await fetchUser();

            // Initialize cart for the logged-in user
            if (user) {
              const { useCartStore } = await import('@/store/cart-store');
              const { useFavoritesStore } = await import('@/store/favorites-store');

              useCartStore.getState().loadCartForUser(user.id);
              useFavoritesStore.getState().fetchFavorites().catch(err =>
                console.log("Failed to fetch favorites on init:", err)
              );
            }
          } catch (error) {
            console.log('Token expired or invalid, user will need to login');
          }
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Error during initialization:', error);
        setIsInitialized(true); // Still initialize even on error
      } finally {
        // Hide native splash screen immediately, we'll show our custom one
        await SplashScreen.hideAsync();
      }
    };

    if (fontsLoaded) {
      initAuth();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === 'auth';

    if (isAuthenticated && inAuthGroup) {
      // Redirect to home if authenticated and in auth screens
      router.replace('/(tabs)');
    } else if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated and not already in auth screens
      router.replace('/auth/login');
    }
  }, [isAuthenticated, segments, isInitialized]);

  // Wait for fonts before showing anything (keep native splash or show blank)
  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <TestnetBanner />
        {isInitialized && (
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
            <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="checkout" options={{ headerShown: false }} />
            <Stack.Screen name="addresses" options={{ headerShown: false }} />
            <Stack.Screen name="orders/[id]/confirmation" options={{ headerShown: false }} />
            <Stack.Screen name="orders/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="wallets/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="wallets/[id]/deposit" options={{ headerShown: false }} />
            <Stack.Screen name="wallets/[id]/withdraw" options={{ headerShown: false }} />
            <Stack.Screen name="wallets/create" options={{ headerShown: false }} />
            <Stack.Screen name="rewards" options={{ headerShown: false }} />
          </Stack>
        )}

        {!isSplashAnimationFinished && (
          <AnimatedSplashScreen
            onFinish={() => setIsSplashAnimationFinished(true)}
          />
        )}
      </View>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
