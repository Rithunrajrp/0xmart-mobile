import AsyncStorage from '@react-native-async-storage/async-storage';

// Temporary script to check and debug auth tokens
export async function checkAuthStatus() {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');

    console.log('=== AUTH STATUS ===');
    console.log('Access Token exists:', !!accessToken);
    console.log('Refresh Token exists:', !!refreshToken);

    if (accessToken) {
      console.log('Access Token (first 50 chars):', accessToken.substring(0, 50) + '...');
    }

    if (refreshToken) {
      console.log('Refresh Token (first 50 chars):', refreshToken.substring(0, 50) + '...');
    }

    // Get all AsyncStorage keys
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('All AsyncStorage keys:', allKeys);

    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Error checking auth status:', error);
  }
}

// Clear all auth data
export async function clearAuth() {
  try {
    await AsyncStorage.clear();
    console.log('✅ All auth data cleared. Please login again.');
  } catch (error) {
    console.error('Error clearing auth:', error);
  }
}
