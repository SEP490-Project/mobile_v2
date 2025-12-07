import { AuthButton, AuthInput } from "@/components/guest";
import { useAppDispatch } from "@/libs/stores";
import { login } from "@/libs/stores/authenManager/thunk";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";

const LoginSchema = yup.object().shape({
  login_identifier: yup.string().required("Email or Username is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .required("Password is required"),
});

function LoginScreen() {
  const router = useRouter();
  const [login_identifier, setLoginIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ login_identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const handleLogin = async () => {
    const body = { login_identifier, password };
    setErrors({ login_identifier: "", password: "" });

    try {
      await LoginSchema.validate(body, { abortEarly: false });
      setLoading(true);

      const user = await dispatch(login(body)).unwrap();
      Alert.alert("Login successful!", `Hello ${user.user?.name || "User"}`);
      router.replace("/(tabs)");
    } catch (err: any) {
      if (err.name === "ValidationError") {
        let newErrors: any = { login_identifier: "", password: "" };
        err.inner.forEach((error: any) => {
          if (error.path) {
            newErrors[error.path] = error.message;
          }
        });
        setErrors(newErrors);
      } else {
        const errorMsg =
          typeof err === "string" ? err : err?.message || "Login failed. Please try again.";
        Alert.alert("Login failed", errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangeText =
    (setter: React.Dispatch<React.SetStateAction<string>>, field: keyof typeof errors) =>
    (text: string) => {
      setter(text.trim());
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
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

              <View className="flex-row justify-end mt-1">
                <Text
                  className="text-primary font-semibold"
                  onPress={() => router.push("./forgot")}
                >
                  Forgot password?
                </Text>
              </View>

              <View className="pt-4 mt-5">
                <AuthButton
                  title={loading ? "Signing In..." : "Sign In"}
                  onPress={handleLogin}
                  disabled={loading || !login_identifier || !password}
                />
              </View>

              <View className="flex-row justify-center mt-4">
                <Text className="text-gray-500">Don&apos;t have an account? </Text>
                <Text
                  className="text-primary font-semibold"
                  onPress={() => router.push("./signup")}
                >
                  Sign up
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default LoginScreen;
