import React from "react";
import { View, ViewStyle, StyleSheet } from "react-native";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  elevation?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 16,
  elevation = 2,
}) => {
  return (
    <View
      style={[
        styles.card,
        {
          padding,
          shadowOpacity: elevation * 0.1,
          shadowRadius: elevation * 2,
          elevation,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
});
