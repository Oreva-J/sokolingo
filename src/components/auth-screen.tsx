import { useAuth, useClerk, useSignIn, useSignUp, useSSO } from "@clerk/expo";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";

type AuthMode = "sign-up" | "sign-in";

type AuthScreenProps = {
  mode: AuthMode;
};

const socialOptions = [
  {
    label: "Continue with Google",
    icon: "G",
    iconClass: "text-[#4285F4]",
    strategy: "oauth_google",
  },
  {
    label: "Continue with Facebook",
    icon: "f",
    iconClass: "text-[#1877F2]",
    strategy: "oauth_facebook",
  },
  {
    label: "Continue with Apple",
    icon: "",
    iconClass: "text-text-primary",
    strategy: "oauth_apple",
  },
] as const;

export function AuthScreen({ mode }: AuthScreenProps) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { setActive } = useClerk();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const { startSSOFlow } = useSSO();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVerificationVisible, setVerificationVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isSignUp = mode === "sign-up";

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleEmailFlow = async () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (isSignUp && !password) {
      setErrorMessage("Please create a password.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const createResult = await signUp.create({
          emailAddress: normalizedEmail,
          password,
        });
        if (createResult.error) {
          throw new Error(createResult.error.message);
        }

        const codeResult = await signUp.verifications.sendEmailCode();
        if (codeResult.error) {
          throw new Error(codeResult.error.message);
        }
      } else {
        const createResult = await signIn.create({
          identifier: normalizedEmail,
        });
        if (createResult.error) {
          throw new Error(createResult.error.message);
        }

        const codeResult = await signIn.emailCode.sendCode({
          emailAddress: normalizedEmail,
        });
        if (codeResult.error) {
          throw new Error(codeResult.error.message);
        }
      }

      setVerificationVisible(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We could not start the verification flow. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (code: string) => {
    if (!code || code.length !== 6) {
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const result = await signUp.verifications.verifyEmailCode({ code });

        if (result.error) {
          throw new Error(result.error.message);
        }

        if (!signUp.createdSessionId) {
          const missingFields = signUp.missingFields.join(", ");
          throw new Error(
            missingFields
              ? `Email verified, but Clerk still requires: ${missingFields.replaceAll("_", " ")}. Enable passwordless email sign-up in the Clerk Dashboard or add those fields to this form.`
              : "Email verified, but Clerk did not create a session. Check your Clerk sign-up settings.",
          );
        }

        const finalizeResult = await signUp.finalize();
        if (finalizeResult.error) {
          throw new Error(finalizeResult.error.message);
        }
      } else {
        const result = await signIn.emailCode.verifyCode({ code });

        if (result.error) {
          throw new Error(result.error.message);
        }

        if (!signIn.createdSessionId) {
          throw new Error(
            "Your code was accepted, but Clerk did not create a session. Complete any additional sign-in verification and try again.",
          );
        }

        const finalizeResult = await signIn.finalize();
        if (finalizeResult.error) {
          throw new Error(finalizeResult.error.message);
        }
      }

      router.replace("/");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The verification code is invalid. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialAuth = async (
    strategy: (typeof socialOptions)[number]["strategy"],
  ) => {
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const result = await startSSOFlow({
        strategy,
      });

      if (result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        router.replace("/");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Social sign-in could not be completed. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <Text className="font-poppins text-[43px] leading-[43px] text-text-primary">
            ‹
          </Text>
        </Pressable>

        <View className="mt-6">
          <Text className="font-poppins-semibold text-[28px] leading-[35px] text-text-primary">
            {isSignUp ? "Create your account" : "Welcome back"}
          </Text>
          <Text className="mt-3 font-poppins text-[15px] leading-[22px] text-text-secondary">
            {isSignUp
              ? "Start your language journey today ✨"
              : "Continue your language journey ✨"}
          </Text>
        </View>

        <View className="relative mt-1 h-[198px] items-center justify-end">
          <Image
            source={images.mascotAuth}
            contentFit="contain"
            accessibilityLabel="Friendly fox mascot"
            style={styles.mascot}
          />
          <Text style={[styles.sparkle, styles.sparkleLeft]}>✦</Text>
          <Text style={[styles.sparkle, styles.sparkleRight]}>✦</Text>
          <Text style={[styles.sparkle, styles.sparkleBottom]}>✦</Text>
        </View>

        <View className="mt-[-2px] gap-[18px]">
          <View className="h-[112px] justify-center rounded-[20px] border border-[#E5E7EB] px-6">
            <Text className="font-poppins text-[14px] leading-[20px] text-text-secondary">
              Email
            </Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="alex@gmail.com"
              placeholderTextColor="#0D132B"
              style={styles.input}
              value={email}
            />
          </View>

          {isSignUp ? (
            <View className="h-[112px] justify-center rounded-[20px] border border-[#E5E7EB] px-6">
              <Text className="font-poppins text-[14px] leading-[20px] text-text-secondary">
                Password
              </Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="password"
                onChangeText={setPassword}
                placeholder="Create a password"
                placeholderTextColor="#0D132B"
                secureTextEntry
                style={styles.input}
                value={password}
              />
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={handleEmailFlow}
            style={({ pressed }) => [
              styles.primaryButton,
              (pressed || isSubmitting) && styles.pressed,
            ]}
          >
            <Text className="font-poppins-semibold text-[20px] text-white">
              {isSubmitting
                ? isSignUp
                  ? "Signing Up..."
                  : "Signing In..."
                : isSignUp
                  ? "Sign Up"
                  : "Sign In"}
            </Text>
          </Pressable>

          {errorMessage ? (
            <Text className="font-poppins text-[13px] leading-[18px] text-[#D12727]">
              {errorMessage}
            </Text>
          ) : null}
        </View>

        <View className="mt-[38px] flex-row items-center gap-5">
          <View className="h-px flex-1 bg-[#E5E7EB]" />
          <Text className="font-poppins text-[16px] text-text-secondary">
            or continue with
          </Text>
          <View className="h-px flex-1 bg-[#E5E7EB]" />
        </View>

        <View className="mt-[21px] gap-3">
          {socialOptions.map((option) => (
            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              key={option.label}
              onPress={() => void handleSocialAuth(option.strategy)}
              style={({ pressed }) => [
                styles.socialButton,
                (pressed || isSubmitting) && styles.pressed,
              ]}
            >
              <Text
                className={`font-poppins-semibold text-[26px] ${option.iconClass}`}
              >
                {option.icon}
              </Text>
              <Text className="font-poppins text-[16px] text-text-primary">
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="mt-auto flex-row items-center justify-center pt-[42px]">
          <Text className="font-poppins text-[15px] text-text-secondary">
            {isSignUp ? "Already have an account?" : "New to Sokolingo?"}{" "}
          </Text>
          <Pressable
            onPress={() => router.replace(isSignUp ? "/sign-in" : "/sign-up")}
          >
            <Text className="font-poppins-medium text-[15px] text-purple">
              {isSignUp ? "Log in" : "Sign up"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <VerificationModal
        email={email}
        isSubmitting={isSubmitting}
        key={
          isVerificationVisible ? "verification-open" : "verification-closed"
        }
        onClose={() => setVerificationVisible(false)}
        onVerify={handleVerifyCode}
        visible={isVerificationVisible}
      />
      <View nativeID="clerk-captcha" />
    </SafeAreaView>
  );
}

type VerificationModalProps = {
  email: string;
  isSubmitting: boolean;
  onClose: () => void;
  onVerify: (code: string) => Promise<void>;
  visible: boolean;
};

function VerificationModal({
  email,
  isSubmitting,
  onClose,
  onVerify,
  visible,
}: VerificationModalProps) {
  const codeInputRef = useRef<TextInput>(null);
  const submittedCodeRef = useRef<string | null>(null);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!visible) {
      return;
    }

    const focusTimer = setTimeout(() => codeInputRef.current?.focus(), 150);
    return () => clearTimeout(focusTimer);
  }, [visible]);

  useEffect(() => {
    if (!visible || code.length !== 6) {
      submittedCodeRef.current = null;
      return;
    }

    if (isSubmitting || submittedCodeRef.current === code) {
      return;
    }

    submittedCodeRef.current = code;
    void onVerify(code);
  }, [code, isSubmitting, onVerify, visible]);

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View className="items-center rounded-t-[28px] bg-white px-7 pb-[30px] pt-3">
          <View className="mb-[22px] h-[5px] w-[42px] rounded-[4px] bg-[#D9DCE5]" />
          <Text className="font-poppins-semibold text-[24px] leading-[31px] text-text-primary">
            Check your email
          </Text>
          <Text className="mt-2 text-center font-poppins text-[15px] leading-[23px] text-text-secondary">
            We sent a verification code to{"\n"}
            <Text className="font-poppins-medium text-text-primary">
              {email || "your email address"}
            </Text>
          </Text>
          <Pressable
            onPress={() => codeInputRef.current?.focus()}
            style={styles.codeEntry}
          >
            <TextInput
              autoFocus
              caretHidden
              keyboardType="number-pad"
              maxLength={6}
              onChangeText={(value) => setCode(value.replace(/[^0-9]/g, ""))}
              ref={codeInputRef}
              selectionColor="transparent"
              style={styles.codeInput}
              value={code}
            />
            <View pointerEvents="none" className="flex-row gap-2">
              {Array.from({ length: 6 }, (_, index) => (
                <View
                  key={index}
                  className={`h-[52px] w-[45px] items-center justify-center rounded-[12px] border ${index < code.length ? "border-purple" : "border-[#E5E7EB]"}`}
                >
                  <Text className="font-poppins-semibold text-[22px] text-text-primary">
                    {code[index] || ""}
                  </Text>
                </View>
              ))}
            </View>
          </Pressable>
          <Pressable onPress={onClose} style={styles.cancelButton}>
            <Text className="font-poppins-medium text-[15px] text-purple">
              Use a different email
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 44,
    paddingBottom: 26,
  },
  backButton: {
    alignSelf: "flex-start",
    height: 48,
    justifyContent: "center",
    marginLeft: -10,
    marginTop: 5,
    width: 48,
  },
  backIcon: {
    color: "#0D132B",
    fontFamily: "Poppins",
    fontSize: 43,
    lineHeight: 43,
  },
  sparkle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 23,
    position: "absolute",
  },
  sparkleLeft: {
    color: "#FF9D00",
    left: 40,
    top: 50,
  },
  sparkleRight: {
    color: "#6BA7FF",
    right: 72,
    top: 59,
  },
  sparkleBottom: {
    color: "#FFD234",
    right: 68,
    top: 124,
  },
  mascot: {
    height: 190,
    width: 270,
  },
  input: {
    color: "#0D132B",
    fontFamily: "Poppins",
    fontSize: 17,
    marginTop: 8,
    padding: 0,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#6C4EF5",
    borderRadius: 18,
    height: 82,
    justifyContent: "center",
  },
  socialButton: {
    alignItems: "center",
    borderColor: "#EEF0F4",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 30,
    height: 70,
    justifyContent: "flex-start",
    paddingHorizontal: 41,
  },
  pressed: {
    opacity: 0.78,
  },
  modalOverlay: {
    backgroundColor: "rgba(13, 19, 43, 0.35)",
    flex: 1,
    justifyContent: "flex-end",
  },
  codeInput: {
    backgroundColor: "transparent",
    color: "transparent",
    height: 52,
    opacity: 0,
    position: "absolute",
    width: "100%",
    zIndex: 1,
  },
  codeEntry: {
    height: 52,
    marginTop: 28,
    position: "relative",
    width: 6 * 45 + 5 * 8,
  },
  cancelButton: {
    marginTop: 22,
    padding: 8,
  },
});
