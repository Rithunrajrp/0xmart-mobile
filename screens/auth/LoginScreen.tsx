import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../../api";
import { Button } from "../../components/ui/Button";
import { CountryCodePicker } from "../../components/ui/CountryCodePicker";
import { Input } from "../../components/ui/Input";
import { useAuthStore } from "../../store/auth-store";

export default function LoginScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const { login } = useAuthStore();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);

  // Form data
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [referralCode, setReferralCode] = useState("");

  // Dual OTP state
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");

  // Handle referral code from URL params
  useEffect(() => {
    const ref = searchParams.ref;
    if (ref && typeof ref === 'string') {
      setReferralCode(ref.toUpperCase());
    }
  }, [searchParams]);

  // Validation errors
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    emailOtp: "",
    phoneOtp: "",
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    return phone.length >= 10;
  };

  const performSendOTP = async () => {
    setLoading(true);
    try {
      await api.sendOTP(email, countryCode, phoneNumber, referralCode || undefined);
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

  const handleSendOTP = async () => {
    // Validate
    const newErrors = {
      email: "",
      phone: "",
      emailOtp: "",
      phoneOtp: "",
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

    // If referral code is provided, validate it first
    if (referralCode && referralCode.trim() !== "") {
      setLoading(true);
      try {
        const validation = await api.validateReferralCode(referralCode);

        if (validation.valid) {
          // Valid code, proceed with OTP
          await performSendOTP();
        } else {
          // Invalid code, show confirmation dialog
          setLoading(false);
          Alert.alert(
            "Invalid Referral Code",
            `${validation.message}\n\nWould you like to continue without a referral code?`,
            [
              {
                text: "Fix Code",
                style: "cancel",
                onPress: () => {
                  // User can edit the referral code
                },
              },
              {
                text: "Continue Without Referral",
                onPress: () => {
                  setReferralCode(""); // Clear invalid code
                  performSendOTP();
                },
              },
            ]
          );
        }
      } catch (error: any) {
        setLoading(false);
        Alert.alert(
          "Error",
          error.response?.data?.message || "Failed to validate referral code"
        );
      }
    } else {
      // No referral code, proceed directly
      await performSendOTP();
    }
  };

  const handleVerifyOTP = async () => {
    const newErrors = {
      email: "",
      phone: "",
      emailOtp: "",
      phoneOtp: "",
    };
    
    if (!emailOtp || emailOtp.length !== 6) {
      newErrors.emailOtp = "Enter 6-digit Email OTP";
    }
    if (!phoneOtp || phoneOtp.length !== 6) {
      newErrors.phoneOtp = "Enter 6-digit Phone OTP";
    }

    if (newErrors.emailOtp || newErrors.phoneOtp) {
        setErrors({ ...errors, ...newErrors });
        return;
    }

    setLoading(true);
    try {
      // Use the auth store's login method with dual OTPs and referral code
      await login(email, emailOtp, countryCode, phoneNumber, phoneOtp, referralCode || undefined);

      Alert.alert("Success", "Login successful!");

      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error: any) {
      // Prevent crash by handling the error gracefully
      const errorMessage = error.response?.data?.message || "Invalid OTPs or Login Failed";
      Alert.alert("Login Failed", errorMessage);
      console.log("Login Error:", error);
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
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={{
              uri: "https://ik.imagekit.io/bgvtzewqf/0xmart/0XMART-BLACK-FONT-REMOVEBG-long.png",
            }}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.formContainer}>
          {step === "phone" ? (
            <>
              {/* <View style={styles.heroTextContainer}>
                <Text style={styles.welcomeText}>Welcome back</Text>
                <Text style={styles.heroSubText}>Enter your details to sign in.</Text>
              </View> */}

              <View style={styles.inputGroup}>
                <Input
                  label="Email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrors({ ...errors, email: "" });
                  }}
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                  leftIcon={<Ionicons name="mail-outline" size={20} color="#9CA3AF" />}
                  containerStyle={styles.inputContainer}
                />

                <View style={styles.phoneSection}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <View style={[styles.phoneInputCombined, errors.phone ? styles.errorBorder : null]}>
                      <CountryCodePicker
                        value={countryCode}
                        onSelect={setCountryCode}
                        containerStyle={styles.countryPicker}
                      />
                      <View style={styles.verticalDivider} />
                      <Input
                        value={phoneNumber}
                        onChangeText={(text) => {
                          setPhoneNumber(text);
                          setErrors({ ...errors, phone: "" });
                        }}
                        placeholder="Mobile number"
                        keyboardType="phone-pad"
                        containerStyle={styles.phoneInputWrapper}
                        contentContainerStyle={styles.phoneInputContent}
                      />
                  </View>
                   {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
                </View>

                <Input
                  label="Referral Code (Optional)"
                  value={referralCode}
                  onChangeText={(text) => setReferralCode(text.toUpperCase())}
                  placeholder="Referral Code"
                  autoCapitalize="characters"
                  leftIcon={<Ionicons name="gift-outline" size={20} color="#9CA3AF" />}
                  containerStyle={styles.inputContainer}
                />
              </View>

              <View style={styles.actionButtons}>
                <Button
                  title="Continue"
                  onPress={handleSendOTP}
                  loading={loading}
                  fullWidth
                  style={styles.primaryButton}
                  textStyle={styles.primaryButtonText}
                />

                {/* <TouchableOpacity onPress={handleSkip} style={styles.skipButtonContainer}>
                  <Text style={styles.skipButtonText}>Skip & Browse</Text>
                </TouchableOpacity> */}
              </View>
            </>
          ) : (
            <>
              <View style={styles.heroTextContainer}>
                <Text style={styles.welcomeText}>Verify OTP</Text>
                <Text style={styles.heroSubText}>
                  Enter the verification codes sent to your email and phone.
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Input
                  label="Email OTP"
                  value={emailOtp}
                  onChangeText={(text) => {
                    setEmailOtp(text);
                    setErrors({ ...errors, emailOtp: "" });
                  }}
                  placeholder="000000"
                  keyboardType="number-pad"
                  maxLength={6}
                  error={errors.emailOtp}
                  leftIcon={<Ionicons name="mail-open-outline" size={20} color="#9CA3AF" />}
                  containerStyle={styles.inputContainer}
                />

                <Input
                  label="Phone OTP"
                  value={phoneOtp}
                  onChangeText={(text) => {
                    setPhoneOtp(text);
                    setErrors({ ...errors, phoneOtp: "" });
                  }}
                  placeholder="000000"
                  keyboardType="number-pad"
                  maxLength={6}
                  error={errors.phoneOtp}
                  leftIcon={<Ionicons name="phone-portrait-outline" size={20} color="#9CA3AF" />}
                  containerStyle={styles.inputContainer}
                />
              </View>

              <View style={styles.actionButtons}>
                <Button
                  title="Verify & Login"
                  onPress={handleVerifyOTP}
                  loading={loading}
                  fullWidth
                  style={styles.primaryButton}
                  textStyle={styles.primaryButtonText}
                />

                <View style={styles.secondaryActions}>
                  <TouchableOpacity onPress={handleSendOTP} disabled={loading}>
                    <Text style={styles.secondaryActionText}>Resend Codes</Text>
                  </TouchableOpacity>
                  <View style={styles.divider} />
                  <TouchableOpacity onPress={() => setStep("phone")}>
                    <Text style={styles.secondaryActionText}>Change Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.disclaimer}>
            By continuing, you agree to 0xMart's Terms and Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: "flex-start", // Left align logo
    marginBottom: 40,
  },
  headerLogo: {
    width: 140, // Smaller, neater logo
    height: 50,
    resizeMode: "contain",
    alignSelf: "center",
  },
  formContainer: {
    flex: 1,
  },
  heroTextContainer: {
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    fontFamily: 'PlayfairDisplay-Bold', // Keep serif for elegance
    letterSpacing: -0.5,
  },
  heroSubText: {
    fontSize: 16,
    color: "#6B7280",
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  phoneSection: {
      marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 8,
    fontFamily: "Inter-Medium",
  },
  phoneInputCombined: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 12,
      height: 52, // Standard height
      overflow: 'hidden', // Ensure children don't bleed out
  },
  errorBorder: {
      borderColor: '#ef4444',
  },
  countryPicker: {
      // Remove default margins/borders if any from the component itself
      borderWidth: 0,
      marginBottom: 0,
      backgroundColor: 'transparent',
      width: 100, // Fixed width for country code
  },
  verticalDivider: {
      width: 1,
      height: '60%',
      backgroundColor: '#E5E7EB',
  },
  phoneInputWrapper: {
      flex: 1,
      marginBottom: 0, // Reset default Input margin
  },
  phoneInputContent: {
      borderWidth: 0, // Remove Input's internal border
      backgroundColor: 'transparent',
      height: '100%',
      paddingHorizontal: 12,
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
  },
  actionButtons: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: "#111827",
    height: 52,
    borderRadius: 12, // Slightly tighter radius
    shadowColor: "transparent", // Remove shadow for cleaner look or keep minimal
    elevation: 0,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: 'Inter-SemiBold',
  },
  skipButtonContainer: {
    alignItems: 'center',
    padding: 12,
  },
  skipButtonText: {
    color: "#6B7280",
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    fontWeight: "500",
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  secondaryActionText: {
    color: "#4B5563",
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: "500",
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: "#E5E7EB",
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 32,
  },
  disclaimer: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
});
