import React, { useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AnimatedTabBarButtonProps {
  isFocused: boolean;
  label: string;
  iconName: string;
  badge?: number;
  onPress: () => void;
  onLongPress: () => void;
  accessibilityLabel?: string;
  testID?: string;
}

export function AnimatedTabBarButton({
  isFocused,
  label,
  iconName,
  badge,
  onPress,
  onLongPress,
  accessibilityLabel,
  testID,
}: AnimatedTabBarButtonProps) {
  const scaleAnim = useRef(new Animated.Value(isFocused ? 1 : 0.9)).current;
  const opacityAnim = useRef(new Animated.Value(isFocused ? 1 : 0.6)).current;
  const indicatorAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isFocused ? 1 : 0.9,
        useNativeDriver: true,
        friction: 7,
        tension: 40,
      }),
      Animated.timing(opacityAnim, {
        toValue: isFocused ? 1 : 0.6,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(indicatorAnim, {
        toValue: isFocused ? 1 : 0,
        useNativeDriver: true,
        friction: 7,
        tension: 40,
      }),
    ]).start();
  }, [isFocused]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
        tension: 100,
      }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      onPress={handlePress}
      onLongPress={onLongPress}
      style={styles.tab}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.tabContent,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {/* Top indicator */}
        <Animated.View
          style={[
            styles.activeIndicator,
            {
              opacity: indicatorAnim,
              transform: [
                {
                  scaleX: indicatorAnim,
                },
              ],
            },
          ]}
        />

        {/* Icon container */}
        <View
          style={[
            styles.iconContainer,
            isFocused && styles.iconContainerActive,
          ]}
        >
          <Ionicons
            name={iconName as any}
            size={22}
            color={isFocused ? "#ffffff" : "#6a6a6a"}
          />
          {badge !== undefined && badge > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {badge > 99 ? "99+" : badge}
              </Text>
            </View>
          )}
        </View>

        {/* Label */}
        <Text
          style={[
            styles.label,
            isFocused ? styles.labelActive : styles.labelInactive,
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  activeIndicator: {
    position: "absolute",
    top: -4,
    width: 28,
    height: 2,
    backgroundColor: "#8b5cf6",
    borderRadius: 2,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
    position: "relative",
    backgroundColor: "transparent",
  },
  iconContainerActive: {
    backgroundColor: "#8b5cf6",
    shadowColor: "#8b5cf6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 1,
  },
  labelActive: {
    color: "#8b5cf6",
  },
  labelInactive: {
    color: "#6a6a6a",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: "#0a0a0a",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
});
