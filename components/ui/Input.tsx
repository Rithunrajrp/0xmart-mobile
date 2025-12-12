import React from "react";
import {
  View,
  TextInput,
  Text,
  TextInputProps,
  ViewStyle,
  TextStyle,
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
              color: "#ffffff",
              marginBottom: 8,
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
          borderColor: error ? "#ef4444" : "#2a2a2a",
          borderRadius: 12,
          backgroundColor: "#1a1a1a",
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
              color: "#ffffff",
            },
            inputStyle,
          ]}
          placeholderTextColor="#6a6a6a"
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
