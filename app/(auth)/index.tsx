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

const LoginSchema = yup.object().shape({
  login_identifier: yup.string().required("Email or Username is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .required("Password is required"),
});

export default function LoginScreen() {
  const router = useRouter();
  const [login_identifier, setLoginIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    login_identifier: "",
    password: "",
  });

  const handleLogin = async () => {
    const body = { login_identifier, password };
    setErrors({ login_identifier: "", password: "" });

    try {
      await LoginSchema.validate(body, { abortEarly: false });

      console.log("Login JSON:", body);
      Alert.alert("Đăng nhập thành công!");
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        let newErrors: any = { login_identifier: "", password: "" };
        err.inner.forEach((error) => {
          if (error.path) {
            newErrors[error.path as keyof typeof newErrors] = error.message;
          }
        });

        setErrors(newErrors);
      }
    }
  };

  const handleChangeText =
    (setter: React.Dispatch<React.SetStateAction<string>>, field: keyof typeof errors) =>
    (text: string) => {
      setter(text);
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior="height" style={{ flex: 1 }} keyboardVerticalOffset={50}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1">
            <View className="mb-12">
              <Text className="text-4xl font-bold mb-2 text-gray-600">
                Welcome back to <Text className="text-primary font-bold">B-ShowSell</Text>
              </Text>
              <Text className="text-gray-500">Enter your login information here</Text>
            </View>
            <View className="space-y-4">
              <AuthInput
                label="Your Email or Username"
                placeholder="Enter your email or username"
                value={login_identifier}
                onChangeText={handleChangeText(setLoginIdentifier, "login_identifier")}
                error={errors.login_identifier}
              />
              <AuthInput
                label="Password"
                placeholder="Enter your password"
                isPassword
                value={password}
                onChangeText={handleChangeText(setPassword, "password")}
                error={errors.password}
              />

              <View className="pt-4">
                <AuthButton
                  title="Sign In"
                  onPress={handleLogin}
                  disabled={!login_identifier || !password}
                />
              </View>
            </View>
          </View>

          <View className="flex-row justify-between mt-8 mb-4">
            <TouchableOpacity onPress={() => router.push("/(auth)/forgot")}>
              <Text className="text-gray-500">Forgot Password</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text className="text-primary font-medium">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
