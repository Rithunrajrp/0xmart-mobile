import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { TierUpgradeEvent } from '@/types/rewards';
import { TIER_CONFIGS } from '@/config/tier-config';

interface Props {
  visible: boolean;
  upgradeEvent: TierUpgradeEvent;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export default function TierUpgradeModal({ visible, upgradeEvent, onClose }: Props) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  const newTierConfig = TIER_CONFIGS[upgradeEvent.toTier];

  useEffect(() => {
    if (visible) {
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Entrance animations
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous rotate animation for badge
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();

      // Confetti animation
      Animated.sequence([
        Animated.delay(200),
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      rotateAnim.setValue(0);
      confettiAnim.setValue(0);
    }
  }, [visible]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View className="flex-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
        {/* Animated Confetti Background */}
        {[...Array(20)].map((_, i) => (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: Math.random() * width,
              top: -50,
              transform: [
                {
                  translateY: confettiAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, height + 100],
                  }),
                },
                {
                  rotate: confettiAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', `${Math.random() * 720}deg`],
                  }),
                },
              ],
              opacity: confettiAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 1, 0],
              }),
            }}
            className={`w-3 h-3 rounded-full ${
              i % 4 === 0
                ? 'bg-yellow-400'
                : i % 4 === 1
                ? 'bg-teal-400'
                : i % 4 === 2
                ? 'bg-purple-400'
                : 'bg-orange-400'
            }`}
          />
        ))}

        {/* Modal Content */}
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
              ],
            }}
            className="w-full"
          >
            <LinearGradient
              colors={newTierConfig.color.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-3xl overflow-hidden border-2 border-white/30"
            >
              {/* Header */}
              <View className="items-center pt-8 pb-6 px-6">
                <Text className="text-white text-3xl font-bold mb-2">🎉 Congratulations! 🎉</Text>
                <Text className="text-white/90 text-center text-base">
                  You've unlocked a new membership tier!
                </Text>
              </View>

              {/* Tier Badge */}
              <View className="items-center pb-6">
                <Animated.View
                  style={{
                    transform: [{ rotate: spin }],
                  }}
                  className="mb-4"
                >
                  <View className="bg-white/30 rounded-full p-6 backdrop-blur-lg border-2 border-white/50">
                    <Ionicons name="diamond" size={64} color="#FFF" />
                  </View>
                </Animated.View>

                <View className="bg-white/20 backdrop-blur-lg rounded-full px-8 py-4 border-2 border-white/40">
                  <Text className="text-white text-2xl font-bold tracking-wider">
                    {newTierConfig.name}
                  </Text>
                </View>

                <Text className="text-white/80 text-sm mt-3">
                  Total Spent: ${upgradeEvent.totalSpent.toLocaleString()}
                </Text>
              </View>

              {/* Bonus Points */}
              <View className="bg-white/20 backdrop-blur-lg mx-6 rounded-2xl p-5 mb-6 border border-white/30">
                <View className="flex-row items-center justify-center mb-2">
                  <Ionicons name="star" size={24} color="#FBBF24" />
                  <Text className="text-white text-xl font-bold ml-2">Bonus Reward!</Text>
                </View>
                <Text className="text-white text-3xl font-bold text-center">
                  +{upgradeEvent.bonusPoints.toLocaleString()} Points
                </Text>
                <Text className="text-white/70 text-sm text-center mt-1">
                  Added to your balance
                </Text>
              </View>

              {/* Unlocked Features */}
              <View className="bg-black/20 mx-6 rounded-2xl p-5 mb-6">
                <Text className="text-white text-base font-bold mb-4 text-center">
                  New Features Unlocked:
                </Text>
                {upgradeEvent.unlockedFeatures.map((feature, index) => (
                  <View key={index} className="flex-row items-center mb-3">
                    <View className="bg-green-500 rounded-full p-1 mr-3">
                      <Ionicons name="checkmark" size={16} color="#FFF" />
                    </View>
                    <Text className="text-white/90 text-sm flex-1">{feature}</Text>
                  </View>
                ))}
              </View>

              {/* Benefits Preview */}
              <View className="bg-white/10 mx-6 rounded-2xl p-5 mb-6">
                <Text className="text-white text-sm font-bold mb-3">Your New Benefits:</Text>
                {newTierConfig.benefits.slice(0, 3).map((benefit, index) => (
                  <View key={index} className="flex-row items-start mb-2">
                    <Ionicons name="star" size={14} color="#FBBF24" />
                    <Text className="text-white/80 text-xs ml-2 flex-1">{benefit}</Text>
                  </View>
                ))}
                {newTierConfig.benefits.length > 3 && (
                  <Text className="text-white/60 text-xs mt-2">
                    + {newTierConfig.benefits.length - 3} more benefits
                  </Text>
                )}
              </View>

              {/* Close Button */}
              <View className="px-6 pb-6">
                <TouchableOpacity
                  onPress={onClose}
                  className="bg-white rounded-2xl py-4"
                >
                  <Text className="text-gray-900 font-bold text-center text-lg">
                    Start Earning More!
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}
