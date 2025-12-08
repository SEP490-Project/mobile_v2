import { AuthButton, AuthInput } from "@/components/guest";
import { useAppDispatch } from "@/libs/stores";
import { forgotPassword } from "@/libs/stores/authenManager/thunk";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";

const ForgotPasswordSchema = yup.object().shape({
  email: yup.string().email("Please enter a valid email address").required("Email is required"),
});

function ForgotPasswordScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    setError("");

    try {
      await ForgotPasswordSchema.validate({ email });
      setLoading(true);

      await dispatch(
        forgotPassword({ email, frontend_url: "https://bshowsell.site/reset-password" }),
      ).unwrap();

      Alert.alert(
        "Check your email",
        "A password reset link has been sent to your inbox. You can also continue directly below.",
        [
          {
            text: "Continue Here",
            onPress: () =>
              router.push({
                pathname: "/(auth)/reset-password",
                params: { from_forgot: "true" },
              }),
          },
        ],
      );
    } catch (err: any) {
      if (err instanceof yup.ValidationError) {
        setError(err.message);
      } else {
        const errorMsg =
          typeof err === "string"
            ? err
            : err?.message || "Failed to send reset email. Please try again.";
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior="height" style={{ flex: 1 }} keyboardVerticalOffset={50}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingVertical: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center">
            <View className="mb-12">
              <Text className="text-3xl font-bold mb-2 text-gray-600">Forgot your password?</Text>
              <Text className="text-gray-500">
                Enter your email address and we&apos;ll send you instructions to reset your
                password.
              </Text>
            </View>

            <AuthInput
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text.trim());
                if (error) setError("");
              }}
              error={error}
            />

            <View className="pt-4">
              <AuthButton
                title={loading ? "Sending..." : "Send Reset Link"}
                onPress={handleResetPassword}
                disabled={loading || !email}
              />
            </View>
          </View>

          <View className="flex-row justify-center mt-8 mb-4">
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-primary font-medium">Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default ForgotPasswordScreen;
