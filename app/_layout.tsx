import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';
import '../global.css';
import { useAuthStore } from '@/store/auth-store';

export default function RootLayout() {
  const { isAuthenticated, accessToken, fetchUser, user } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize auth state on app startup
    const initAuth = async () => {
      // Wait for zustand persist to rehydrate - check state directly
      // Instead of arbitrary timeout, check if store has rehydrated
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
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === 'auth';

    // Only redirect if authenticated and trying to access auth screens
    // Allow unauthenticated users to browse the app
    if (isAuthenticated && inAuthGroup) {
      // Redirect to home if authenticated and in auth screens
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isInitialized]);

  // Show loading screen while initializing
  if (!isInitialized) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
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
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
