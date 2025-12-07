import { AuthButton, AuthInput } from "@/components/guest";
import { useAppDispatch } from "@/libs/stores";
import { resetPassword } from "@/libs/stores/authenManager/thunk";
import { useLocalSearchParams, useRouter } from "expo-router";
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

const ResetPasswordSchema = yup.object().shape({
  new_password: yup
    .string()
    .min(8, "Password must be at least 8 characters long")
    .required("New password is required"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("new_password")], "Passwords must match")
    .required("Please confirm your password"),
});

export default function ResetPasswordScreen() {
  const { email, token } = useLocalSearchParams<{ email?: string; token?: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [parsedEmail, setParsedEmail] = useState(email || "");
  const [parsedToken, setParsedToken] = useState(token || "");
  const [errors, setErrors] = useState({ new_password: "", confirm_password: "", reset_url: "" });
  const [loading, setLoading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(!email || !token);

  const handleResetPassword = async () => {
    const body = { new_password: newPassword, confirm_password: confirmPassword };
    setErrors({ new_password: "", confirm_password: "", reset_url: "" });

    try {
      await ResetPasswordSchema.validate(body, { abortEarly: false });

      if (!parsedEmail || !parsedToken) {
        Alert.alert(
          "Error",
          "Missing email or token. Please paste the reset URL or try the reset link again.",
        );
        return;
      }

      setLoading(true);

      const resetData = {
        email: parsedEmail,
        new_password: newPassword,
        token: parsedToken,
      };

      await dispatch(resetPassword(resetData)).unwrap();

      Alert.alert(
        "Password Reset Successful",
        "Your password has been reset successfully. You can now sign in with your new password.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)"),
          },
        ],
      );
    } catch (err: any) {
      if (err.name === "ValidationError") {
        let newErrors: any = { new_password: "", confirm_password: "", reset_url: "" };
        err.inner.forEach((error: any) => {
          if (error.path) {
            newErrors[error.path] = error.message;
          }
        });
        setErrors(newErrors);
      } else {
        const errorMsg =
          typeof err === "string"
            ? err
            : err?.message || "Password reset failed. Please try again.";
        Alert.alert("Reset Failed", errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const parseResetUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const emailParam = urlObj.searchParams.get("email");
      const stateParam = urlObj.searchParams.get("state");

      if (emailParam && stateParam) {
        const decodedEmail = decodeURIComponent(emailParam);
        setParsedEmail(decodedEmail);
        setParsedToken(stateParam);
        setErrors((prev) => ({ ...prev, reset_url: "" }));
        setShowUrlInput(false);
        Alert.alert(
          "URL Parsed Successfully",
          `Email: ${decodedEmail}\nYou can now reset your password.`,
        );
      } else {
        setErrors((prev) => ({ ...prev, reset_url: "Invalid reset URL format" }));
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, reset_url: "Invalid URL format" }));
    }
  };

  const handlePasteUrl = () => {
    if (!resetUrl.trim()) {
      setErrors((prev) => ({ ...prev, reset_url: "Please enter a reset URL" }));
      return;
    }
    parseResetUrl(resetUrl.trim());
  };

  const handleChangeText =
    (
      setter: React.Dispatch<React.SetStateAction<string>>,
      field: "new_password" | "confirm_password" | "reset_url",
    ) =>
    (text: string) => {
      setter(text.trim());
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
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
              <Text className="text-3xl font-bold mb-2 text-gray-600">Reset Your Password</Text>
              <Text className="text-gray-500 mb-4">
                Enter your new password below. Make sure it&apos;s secure and easy to remember.
              </Text>
              {parsedEmail && (
                <View className="bg-blue-50 p-3 rounded-lg">
                  <Text className="text-blue-800 text-sm">
                    Resetting password for: <Text className="font-semibold">{parsedEmail}</Text>
                  </Text>
                </View>
              )}
            </View>

            {showUrlInput && (
              <View className="mb-6">
                <View className="bg-amber-50 p-3 rounded-lg mb-4">
                  <Text className="text-amber-800 text-sm font-medium mb-1">
                    📱 Trouble with the email link?
                  </Text>
                  <Text className="text-amber-700 text-xs">
                    You can paste the reset URL from your email below to continue.
                  </Text>
                </View>

                <AuthInput
                  label="Reset URL (Optional)"
                  placeholder="Paste your reset URL here..."
                  value={resetUrl}
                  onChangeText={handleChangeText(setResetUrl, "reset_url")}
                  error={errors.reset_url}
                />

                <View className="mt-3">
                  <AuthButton
                    title="Parse URL"
                    onPress={handlePasteUrl}
                    disabled={!resetUrl.trim()}
                  />
                </View>

                <View className="flex-row justify-center mt-4">
                  <TouchableOpacity onPress={() => setShowUrlInput(false)}>
                    <Text className="text-gray-500 text-sm">Skip this step</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View className="space-y-4">
              <AuthInput
                label="New Password"
                placeholder="Enter your new password"
                isPassword
                value={newPassword}
                onChangeText={handleChangeText(setNewPassword, "new_password")}
                error={errors.new_password}
              />

              <AuthInput
                label="Confirm New Password"
                placeholder="Confirm your new password"
                isPassword
                value={confirmPassword}
                onChangeText={handleChangeText(setConfirmPassword, "confirm_password")}
                error={errors.confirm_password}
              />

              <View className="pt-4 mt-5">
                <AuthButton
                  title={loading ? "Resetting Password..." : "Reset Password"}
                  onPress={handleResetPassword}
                  disabled={
                    loading || !newPassword || !confirmPassword || !parsedEmail || !parsedToken
                  }
                />
              </View>
            </View>
          </View>

          <View className="flex-row justify-center mt-8 mb-4">
            <TouchableOpacity onPress={() => router.replace("/(auth)")}>
              <Text className="text-primary font-medium">Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
