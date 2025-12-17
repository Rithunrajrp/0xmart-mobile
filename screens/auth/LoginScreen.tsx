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
              uri: "https://ik.imagekit.io/bgvtzewqf/0xmart/OXMART-3.png",
            }}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.formContainer}>
          {step === "phone" ? (
            <>
              <View style={styles.heroTextContainer}>
                <Text style={styles.welcomeText}>Welcome back</Text>
                <Text style={styles.heroSubText}>Please enter your details to sign in.</Text>
              </View>

              <View style={styles.inputGroup}>
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
                  leftIcon={<Ionicons name="mail-outline" size={20} color="#6B7280" />}
                  containerStyle={styles.inputContainer}
                  inputStyle={styles.inputField}
                />

                <View style={styles.phoneLabelContainer}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                </View>
                <View style={[styles.phoneContainer, errors.phone ? styles.phoneError : null]}>
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
                    containerStyle={styles.phoneInputContainer}
                    inputStyle={styles.inputField}
                    // error={errors.phone} // Handled by container border
                    leftIcon={<Ionicons name="call-outline" size={20} color="#6B7280" />}
                  />
                </View>
                {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}

                <Input
                  label="Referral Code (Optional)"
                  value={referralCode}
                  onChangeText={(text) => setReferralCode(text.toUpperCase())}
                  placeholder="Have a referral code?"
                  autoCapitalize="characters"
                  leftIcon={<Ionicons name="gift-outline" size={20} color="#6B7280" />}
                  containerStyle={styles.inputContainer}
                  inputStyle={styles.inputField}
                />
              </View>

              <View style={styles.actionButtons}>
                <Button
                  title="Send OTP"
                  onPress={handleSendOTP}
                  loading={loading}
                  fullWidth
                  style={styles.primaryButton}
                  textStyle={styles.primaryButtonText}
                />

                <TouchableOpacity onPress={handleSkip} style={styles.skipButtonContainer}>
                  <Text style={styles.skipButtonText}>Skip & Browse</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.heroTextContainer}>
                <Text style={styles.welcomeText}>Verify OTP</Text>
                <Text style={styles.heroSubText}>
                  We sent 6-digit codes to your email and phone.
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
                  leftIcon={<Ionicons name="mail-open-outline" size={20} color="#6B7280" />}
                  containerStyle={styles.inputContainer}
                  inputStyle={styles.inputField}
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
                  leftIcon={<Ionicons name="phone-portrait-outline" size={20} color="#6B7280" />}
                  containerStyle={styles.inputContainer}
                  inputStyle={styles.inputField}
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
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB", // Very light gray for background
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  headerLogo: {
    width: 200,
    height: 70,
    tintColor: "#111827",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280", // Gray-500
    marginTop: 4,
    fontFamily: 'Inter-Regular',
    letterSpacing: 0.5,
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
    fontFamily: 'PlayfairDisplay-Bold',
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
    backgroundColor: 'transparent',
  },
  inputField: {
    fontSize: 16,
  },
  phoneLabelContainer: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    fontFamily: 'Inter-Medium',
  },
  phoneContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  phoneError: {
    // marginBottom: 0, 
  },
  countryCodeInput: {
    flex: 0.35,
    marginBottom: 0,
  },
  phoneInputContainer: {
    flex: 0.65,
    marginBottom: 0,
    backgroundColor: 'transparent',
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: -16,
    marginBottom: 20,
    marginLeft: 4,
  },
  actionButtons: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: "#111827",
    height: 56,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
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
    fontSize: 16,
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
