import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { MysteryBox, MembershipTier } from '@/types/rewards';
import { useRewardsStore } from '@/store/rewards-store';

interface Props {
  boxes: MysteryBox[];
  currentTier: MembershipTier;
}

const rarityColors = {
  COMMON: ['#3B82F6', '#60A5FA'],
  RARE: ['#A855F7', '#C084FC'],
  EPIC: ['#EC4899', '#F472B6'],
  LEGENDARY: ['#F59E0B', '#FBBF24'],
};

const rarityIcons = {
  COMMON: 'cube',
  RARE: 'diamond',
  EPIC: 'star',
  LEGENDARY: 'trophy',
};

export default function MysteryBoxGrid({ boxes, currentTier }: Props) {
  const { openMysteryBox } = useRewardsStore();

  const handleOpenBox = async (box: MysteryBox) => {
    if (!box.unlocked) {
      Alert.alert('Locked', 'This mystery box is not yet available for your tier.');
      return;
    }

    if (box.opened) {
      Alert.alert('Already Opened', 'You have already opened this mystery box.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    Alert.alert(
      'Open Mystery Box?',
      `Open ${box.title}? You might receive amazing rewards!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open',
          onPress: async () => {
            await openMysteryBox(box.id);
            // Show reward animation
            Alert.alert(
              '🎉 Congratulations!',
              'You received:\n• 750 Bonus Points\n• Free Shipping Voucher\n• 10% Discount Code'
            );
          },
        },
      ]
    );
  };

  return (
    <View>
      {boxes.map((box) => (
        <TouchableOpacity
          key={box.id}
          onPress={() => handleOpenBox(box)}
          disabled={!box.unlocked || box.opened}
          className="mb-4"
        >
          <LinearGradient
            colors={box.unlocked ? rarityColors[box.rarity] : ['#374151', '#4B5563']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className={`rounded-2xl p-5 border ${
              box.unlocked ? 'border-white/30' : 'border-gray-700'
            }`}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <View
                  className={`rounded-full p-3 mr-3 ${
                    box.unlocked ? 'bg-white/20' : 'bg-gray-800'
                  }`}
                >
                  <Ionicons
                    name={
                      box.unlocked
                        ? box.opened
                          ? 'checkmark-circle'
                          : (rarityIcons[box.rarity] as any)
                        : 'lock-closed'
                    }
                    size={24}
                    color={box.unlocked ? '#FFF' : '#9CA3AF'}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-lg font-bold ${
                      box.unlocked ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    {box.title}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <View
                      className={`rounded-full px-2 py-0.5 ${
                        box.unlocked ? 'bg-white/20' : 'bg-gray-700'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          box.unlocked ? 'text-white' : 'text-gray-500'
                        }`}
                      >
                        {box.rarity}
                      </Text>
                    </View>
                    {box.requiredPoints && (
                      <Text className="text-white/60 text-xs ml-2">
                        • {box.requiredPoints} pts
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              {box.opened && (
                <View className="bg-green-500 rounded-full px-3 py-1">
                  <Text className="text-white text-xs font-bold">OPENED</Text>
                </View>
              )}

              {!box.unlocked && (
                <View className="bg-gray-700 rounded-full px-3 py-1">
                  <Text className="text-gray-400 text-xs font-bold">LOCKED</Text>
                </View>
              )}
            </View>

            {/* Potential Rewards */}
            <View className="bg-black/20 rounded-xl p-3">
              <Text
                className={`text-xs font-semibold mb-2 ${
                  box.unlocked ? 'text-white/80' : 'text-gray-500'
                }`}
              >
                Potential Rewards:
              </Text>
              {box.potentialRewards.map((reward, index) => (
                <View key={index} className="flex-row items-center mb-1">
                  <View
                    className={`w-1 h-1 rounded-full mr-2 ${
                      box.unlocked ? 'bg-white/60' : 'bg-gray-600'
                    }`}
                  />
                  <Text
                    className={`text-xs ${box.unlocked ? 'text-white/70' : 'text-gray-500'}`}
                  >
                    {reward}
                  </Text>
                </View>
              ))}
            </View>

            {box.unlocked && !box.opened && (
              <TouchableOpacity className="bg-white rounded-xl py-2 mt-3">
                <Text className="text-gray-900 font-bold text-center text-sm">Open Box</Text>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </View>
  );
}
