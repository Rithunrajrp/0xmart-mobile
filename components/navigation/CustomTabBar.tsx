import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedTabBarButton } from "./AnimatedTabBarButton";

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Platform.OS === "ios" ? insets.bottom : 12,
        },
      ]}
    >
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          // Get icon name based on route
          const getIconName = (routeName: string, focused: boolean) => {
            switch (routeName) {
              case "index":
                return focused ? "home" : "home-outline";
              case "collection":
                return focused ? "grid" : "grid-outline";
              case "exclusive":
                return focused ? "diamond" : "diamond-outline";
              case "reward":
                return focused ? "gift" : "gift-outline";
              case "profile":
                return focused ? "person" : "person-outline";
              default:
                return "home-outline";
            }
          };

          const iconName = getIconName(route.name, isFocused);
          const badge = options.tabBarBadge;

          return (
            <AnimatedTabBarButton
              key={route.key}
              isFocused={isFocused}
              label={typeof label === "string" ? label : route.name}
              iconName={iconName}
              badge={typeof badge === "number" ? badge : undefined}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0a0a0a",
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
    paddingTop: 4,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 8,
  },
});
