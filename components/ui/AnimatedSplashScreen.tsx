import { Audio } from 'expo-av';
import { Image } from 'expo-image';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

interface AnimatedSplashScreenProps {
  onFinish: () => void;
}

export const AnimatedSplashScreen = ({ onFinish }: AnimatedSplashScreenProps) => {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);

  const logoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: containerOpacity.value,
    };
  });

  useEffect(() => {
    const playSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('@/assets/sounds/splash.mp3')
        );
        await sound.playAsync();
      } catch (error) {
        // Sound file might not exist yet, ignore error
        // console.log('Error playing splash sound:', error);
      }
    };

    const runAnimation = async () => {
      // Play sound shortly after start
      setTimeout(playSound, 100);

      // Simple entrance animation
      opacity.value = withTiming(1, { duration: 800 });
      scale.value = withTiming(1, { duration: 800 });

      // Exit animation
      setTimeout(() => {
        containerOpacity.value = withTiming(0, { duration: 500 }, (finished) => {
          if (finished) {
            runOnJS(onFinish)();
          }
        });
      }, 2500); // Display for 2.5 seconds total
    };

    runAnimation();
  }, []);

  return (
    <Animated.View style={[styles.container, containerStyle]}>

      <Animated.View style={[styles.logoContainer, logoStyle]}>
        {/* Use the same icon as the app */}
        <Image
          source={require('../../assets/images/splash-icon.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999, // Ensure it sits on top of everything
    backgroundColor: '#000000',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});
