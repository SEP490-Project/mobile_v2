import { AuthButton, AuthInput } from "@/components/guest";
import { useAppDispatch } from "@/libs/stores";
import { changePassword } from "@/libs/stores/authenManager/thunk";
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

const ChangePasswordSchema = yup.object().shape({
  current_password: yup.string().required("Current password is required"),
  new_password: yup
    .string()
    .min(6, "New password must be at least 6 characters")
    .required("New password is required"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("new_password")], "Passwords do not match")
    .required("Please confirm your new password"),
});

function ChangePasswordScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    current_password?: string;
    new_password?: string;
    confirm_password?: string;
    general?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    setErrors({});

    try {
      await ChangePasswordSchema.validate(
        {
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        },
        { abortEarly: false },
      );

      setLoading(true);

      await dispatch(
        changePassword({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      ).unwrap();

      Alert.alert("Success", "Your password has been changed successfully.", [
        {
          text: "OK",
          onPress: () => router.push("/(tabs)/account"),
        },
      ]);
    } catch (err: any) {
      if (err instanceof yup.ValidationError) {
        const validationErrors: any = {};
        err.inner.forEach((error) => {
          if (error.path) {
            validationErrors[error.path] = error.message;
          }
        });
        setErrors(validationErrors);
      } else {
        const errorMsg =
          typeof err === "string"
            ? err
            : err?.message || "Failed to change password. Please try again.";
        setErrors({ general: errorMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  const clearFieldError = (field: string) => {
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
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
              <Text className="text-3xl font-bold mb-2 text-gray-600">Change Password</Text>
              <Text className="text-gray-500">
                Enter your current password and choose a new secure password.
              </Text>
            </View>

            {errors.general && (
              <View className="mb-4 p-3 bg-red-50 rounded-lg">
                <Text className="text-red-600 text-sm">{errors.general}</Text>
              </View>
            )}

            <AuthInput
              label="Current Password"
              placeholder="Enter your current password"
              value={currentPassword}
              onChangeText={(text) => {
                setCurrentPassword(text);
                clearFieldError("current_password");
              }}
              isPassword={true}
              error={errors.current_password}
            />

            <AuthInput
              label="New Password"
              placeholder="Enter your new password"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                clearFieldError("new_password");
              }}
              isPassword={true}
              error={errors.new_password}
            />

            <AuthInput
              label="Confirm New Password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                clearFieldError("confirm_password");
              }}
              isPassword={true}
              error={errors.confirm_password}
            />

            <View className="pt-4">
              <AuthButton
                title={loading ? "Changing..." : "Change Password"}
                onPress={handleChangePassword}
                disabled={loading || !currentPassword || !newPassword || !confirmPassword}
              />
            </View>
          </View>

          <View className="flex-row justify-center mt-8 mb-4">
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-primary font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default ChangePasswordScreen;
