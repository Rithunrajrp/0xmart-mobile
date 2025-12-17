import React from "react";
import {
    Text,
    TextInput,
    TextInputProps,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  leftIcon,
  rightIcon,
  ...props
}) => {
  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {label && (
        <Text
          style={[
            {
              fontSize: 14,
              fontWeight: "500",
              color: "#111827", // Charcoal Black
              marginBottom: 8,
              fontFamily: 'Inter-Medium',
            },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: error ? "#ef4444" : "#E5E7EB", // Light Gray
          borderRadius: 12,
          backgroundColor: "#FFFFFF", // White
          paddingHorizontal: 12,
        }}
      >
        {leftIcon && <View style={{ marginRight: 8 }}>{leftIcon}</View>}
        <TextInput
          style={[
            {
              flex: 1,
              paddingVertical: 12,
              fontSize: 16,
              color: "#111827", // Charcoal Black
              fontFamily: 'Inter-Regular',
            },
            inputStyle,
          ]}
          placeholderTextColor="#9CA3AF" // Muted Gray
          {...props}
        />
        {rightIcon && <View style={{ marginLeft: 8 }}>{rightIcon}</View>}
      </View>
      {error && (
        <Text
          style={{
            fontSize: 12,
            color: "#ef4444",
            marginTop: 4,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};
