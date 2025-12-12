import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExclusiveDrop, MembershipTier } from '@/types/rewards';
import { TIER_CONFIGS } from '@/config/tier-config';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  drops: ExclusiveDrop[];
  currentTier: MembershipTier;
}

export default function ExclusiveDropsSection({ drops, currentTier }: Props) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (drops.length === 0) {
    return (
      <View className="bg-gray-900 rounded-2xl p-6 border border-gray-800 items-center">
        <Ionicons name="diamond-outline" size={48} color="#6B7280" />
        <Text className="text-white/80 text-base font-semibold mt-4">No Exclusive Drops Yet</Text>
        <Text className="text-white/60 text-sm text-center mt-2">
          Upgrade your tier to unlock exclusive limited edition products
        </Text>
      </View>
    );
  }

  return (
    <View>
      {drops.map((drop) => {
        const tierConfig = TIER_CONFIGS[drop.requiredTier];
        const stockPercent = (drop.availableQuantity / drop.totalQuantity) * 100;
        const isLowStock = stockPercent < 30;

        return (
          <View key={drop.id} className="mb-4">
            <LinearGradient
              colors={
                drop.unlocked
                  ? ['#0F172A', '#1E293B']
                  : ['#374151', '#4B5563']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className={`rounded-2xl overflow-hidden border ${
                drop.unlocked ? 'border-teal-500/50' : 'border-gray-700'
              }`}
            >
              <View className="flex-row">
                {/* Product Image */}
                <View className="w-32 h-32 bg-gray-800 relative">
                  <Image
                    source={{ uri: drop.imageUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  {!drop.unlocked && (
                    <View className="absolute inset-0 bg-black/60 items-center justify-center">
                      <Ionicons name="lock-closed" size={32} color="#9CA3AF" />
                    </View>
                  )}
                </View>

                {/* Product Info */}
                <View className="flex-1 p-4">
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1">
                      <Text
                        className={`text-base font-bold ${
                          drop.unlocked ? 'text-white' : 'text-gray-400'
                        }`}
                        numberOfLines={2}
                      >
                        {drop.name}
                      </Text>
                    </View>
                  </View>

                  {/* Required Tier Badge */}
                  <View
                    className="self-start rounded-full px-2 py-1 mb-2"
                    style={{ backgroundColor: `${tierConfig.color.primary}40` }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{ color: tierConfig.color.primary }}
                    >
                      {tierConfig.name}
                    </Text>
                  </View>

                  {/* Stock Info */}
                  <View className="mb-2">
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className={`text-xs ${drop.unlocked ? 'text-white/70' : 'text-gray-500'}`}>
                        Stock Remaining
                      </Text>
                      <Text
                        className={`text-xs font-bold ${
                          isLowStock ? 'text-red-400' : drop.unlocked ? 'text-teal-400' : 'text-gray-500'
                        }`}
                      >
                        {drop.availableQuantity} / {drop.totalQuantity}
                      </Text>
                    </View>
                    <View className={`h-1.5 rounded-full overflow-hidden ${drop.unlocked ? 'bg-gray-800' : 'bg-gray-700'}`}>
                      <View
                        className={`h-full rounded-full ${
                          isLowStock ? 'bg-red-500' : drop.unlocked ? 'bg-teal-500' : 'bg-gray-600'
                        }`}
                        style={{ width: `${stockPercent}%` }}
                      />
                    </View>
                  </View>

                  {/* Launch Date */}
                  <View className="flex-row items-center">
                    <Ionicons
                      name="calendar"
                      size={14}
                      color={drop.unlocked ? '#6EE7B7' : '#6B7280'}
                    />
                    <Text className={`text-xs ml-1 ${drop.unlocked ? 'text-teal-300' : 'text-gray-500'}`}>
                      Launches {formatDate(drop.launchDate)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Button */}
              <View className="px-4 pb-4">
                {drop.unlocked ? (
                  <TouchableOpacity className="bg-teal-600 rounded-xl py-2.5">
                    <Text className="text-white font-bold text-center text-sm">
                      View Product
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View className="bg-gray-800 rounded-xl py-2.5 border border-gray-700">
                    <Text className="text-gray-500 font-bold text-center text-sm">
                      Unlock at {tierConfig.name} Tier
                    </Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </View>
        );
      })}
    </View>
  );
}
