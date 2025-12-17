import React from "react";
import {
    ActivityIndicator,
    Text,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    ViewStyle,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
  ...props
}) => {
  const getVariantStyles = (): ViewStyle => {
    const baseStyles: ViewStyle = {
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    };

    switch (variant) {
      case "primary":
        return {
          ...baseStyles,
          backgroundColor: "#111827", // Charcoal Black
        };
      case "secondary":
        return {
          ...baseStyles,
          backgroundColor: "#F3F4F6", // Neutral
        };
      case "outline":
        return {
          ...baseStyles,
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: "#E5E7EB", // Light Gray
        };
      case "danger":
        return {
          ...baseStyles,
          backgroundColor: "#ef4444",
        };
      case "ghost":
        return {
          ...baseStyles,
          backgroundColor: "transparent",
        };
      default:
        return baseStyles;
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case "sm":
        return {
          paddingVertical: 8,
          paddingHorizontal: 12,
        };
      case "md":
        return {
          paddingVertical: 12,
          paddingHorizontal: 16,
        };
      case "lg":
        return {
          paddingVertical: 16,
          paddingHorizontal: 24,
        };
      default:
        return {};
    }
  };

  const getTextVariantStyles = (): TextStyle => {
    switch (variant) {
      case "secondary":
        return { color: "#111827" }; // Charcoal
      case "outline":
      case "ghost":
        return { color: "#4B5563" }; // Gray 600
      default:
        return { color: "#ffffff" };
    }
  };

  const getTextSizeStyles = (): TextStyle => {
    switch (size) {
      case "sm":
        return { fontSize: 14, fontWeight: "600" };
      case "md":
        return { fontSize: 16, fontWeight: "600" };
      case "lg":
        return { fontSize: 18, fontWeight: "700" };
      default:
        return {};
    }
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        getVariantStyles(),
        getSizeStyles(),
        fullWidth && { width: "100%" },
        isDisabled && { opacity: 0.5 },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" || variant === "ghost" ? "#a0a0a0" : "#ffffff"}
          size="small"
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              getTextVariantStyles(),
              getTextSizeStyles(),
              icon ? { marginLeft: 8 } : undefined,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
