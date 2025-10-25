import { AuthButton, AuthInput } from "@/components/guest";
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
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleResetPassword = async () => {
    setError("");

    try {
      await ForgotPasswordSchema.validate({ email });
      console.log("Forgot password email:", email);
      Alert.alert("Check your email", "A password reset link has been sent to your inbox.");
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setError(err.message);
      }
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
                Enter your email address and we’ll send you instructions to reset your password.
              </Text>
            </View>

            <AuthInput
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError("");
              }}
              error={error}
            />

            <View className="pt-4">
              <AuthButton title="Send Reset Link" onPress={handleResetPassword} disabled={!email} />
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
