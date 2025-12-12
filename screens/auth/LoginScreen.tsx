import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { CountryCodePicker } from "../../components/ui/CountryCodePicker";
import { useAuthStore } from "../../store/auth-store";
import api from "../../api";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);

  // Form data
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");

  // Validation errors
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    otp: "",
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    return phone.length >= 10;
  };

  const handleSendOTP = async () => {
    // Validate
    const newErrors = {
      email: "",
      phone: "",
      otp: "",
    };

    if (!email || !validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!phoneNumber || !validatePhone(phoneNumber)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (newErrors.email || newErrors.phone) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await api.sendOTP(email, countryCode, phoneNumber);
      setStep("otp");
      Alert.alert("Success", "OTP sent to your email and phone");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setErrors({ ...errors, otp: "Please enter a valid 6-digit OTP" });
      return;
    }

    setLoading(true);
    try {
      // Use the auth store's login method which properly sets tokens and user
      await login(email, otp, countryCode, phoneNumber);

      Alert.alert("Success", "Login successful!");

      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Invalid OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image
            source={{
              uri: "https://ik.imagekit.io/bgvtzewqf/0xmart/OXMART-3.png",
            }}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>
            Shop products with stablecoins
          </Text>
        </View>

        <Card style={styles.card}>
          {step === "phone" ? (
            <>
              <Text style={styles.stepTitle}>Enter your details</Text>

              <Input
                label="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrors({ ...errors, email: "" });
                }}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                leftIcon={<Ionicons name="mail-outline" size={20} color="#6a6a6a" />}
              />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.phoneContainer}>
                <CountryCodePicker
                  value={countryCode}
                  onSelect={setCountryCode}
                  containerStyle={styles.countryCodeInput}
                />
                <Input
                  value={phoneNumber}
                  onChangeText={(text) => {
                    setPhoneNumber(text);
                    setErrors({ ...errors, phone: "" });
                  }}
                  placeholder="1234567890"
                  keyboardType="phone-pad"
                  containerStyle={styles.phoneInput}
                  error={errors.phone}
                  leftIcon={<Ionicons name="call-outline" size={20} color="#6a6a6a" />}
                />
              </View>

              <Button
                title="Send OTP"
                onPress={handleSendOTP}
                loading={loading}
                fullWidth
              />

              <Button
                title="Skip & Browse"
                onPress={handleSkip}
                variant="ghost"
                fullWidth
                style={styles.skipButton}
              />
            </>
          ) : (
            <>
              <Text style={styles.stepTitle}>Enter OTP</Text>
              <Text style={styles.otpInfo}>
                We sent a 6-digit code to {email} and {countryCode} {phoneNumber}
              </Text>

              <Input
                label="OTP Code"
                value={otp}
                onChangeText={(text) => {
                  setOtp(text);
                  setErrors({ ...errors, otp: "" });
                }}
                placeholder="123456"
                keyboardType="number-pad"
                maxLength={6}
                error={errors.otp}
                leftIcon={<Ionicons name="key-outline" size={20} color="#6a6a6a" />}
              />

              <Button
                title="Verify & Login"
                onPress={handleVerifyOTP}
                loading={loading}
                fullWidth
              />

              <Button
                title="Change Phone/Email"
                onPress={() => setStep("phone")}
                variant="ghost"
                fullWidth
                style={styles.skipButton}
              />

              <Button
                title="Resend OTP"
                onPress={handleSendOTP}
                variant="outline"
                fullWidth
                style={styles.skipButton}
                disabled={loading}
              />
            </>
          )}
        </Card>

        <Text style={styles.disclaimer}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  headerLogo: {
    width: 180,
    height: 60,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#a0a0a0",
    marginTop: 8,
  },
  card: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
    marginBottom: 8,
  },
  phoneContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  countryCodeInput: {
    flex: 0.3,
    marginBottom: 0,
  },
  phoneInput: {
    flex: 0.7,
  },
  skipButton: {
    marginTop: 12,
  },
  otpInfo: {
    fontSize: 14,
    color: "#a0a0a0",
    marginBottom: 24,
  },
  disclaimer: {
    fontSize: 12,
    color: "#6a6a6a",
    textAlign: "center",
  },
});
