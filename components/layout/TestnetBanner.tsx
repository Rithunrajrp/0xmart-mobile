import { useTestnetStore } from '@/store/testnet-store';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

export function TestnetBanner() {
  const { isTestnetMode } = useTestnetStore();

  if (!isTestnetMode) return null;

  return (
    <LinearGradient
      colors={['#2563eb', '#3b82f6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <Ionicons name="flask" size={12} color="white" style={styles.icon} />
      <Text style={styles.text}>APPLICATION IS IN TEST MODE - USING TESTNET NETWORKS</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 20, // 5px height as requested (20 in React Native scale)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
});
