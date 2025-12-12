import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
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
          backgroundColor: "#8b5cf6",
        };
      case "secondary":
        return {
          ...baseStyles,
          backgroundColor: "#1e1e1e",
        };
      case "outline":
        return {
          ...baseStyles,
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: "#2a2a2a",
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
      case "outline":
      case "ghost":
        return { color: "#a0a0a0" };
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
              icon && { marginLeft: 8 },
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
