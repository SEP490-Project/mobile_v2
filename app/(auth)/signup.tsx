import { AuthButton, AuthInput } from "@/components/guest";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";

const RegisterSchema = yup.object().shape({
  full_name: yup.string().required("Full name is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  username: yup.string().required("Username is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters long")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Confirm password is required"),
});

function RegisterScreen() {
  const router = useRouter();

  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({
    full_name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleRegister = async () => {
    const body = { full_name, email, username, password, confirmPassword };
    setErrors({
      full_name: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    });

    try {
      await RegisterSchema.validate(body, { abortEarly: false });
      Alert.alert("Đăng ký thành công!");
      router.back();
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const newErrors: any = {
          full_name: "",
          email: "",
          username: "",
          password: "",
          confirmPassword: "",
        };
        err.inner.forEach((error) => {
          if (error.path) newErrors[error.path] = error.message;
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 flex-col justify-between px-6 py-8">
            <View>
              <Text className="text-3xl font-bold mb-1 text-gray-900">Register Account</Text>
              <Text className="text-gray-500 mb-8">Fill in the details below</Text>
              <View className="space-y-4">
                <AuthInput
                  label="Full Name"
                  placeholder="John Doe"
                  value={full_name}
                  onChangeText={handleChangeText(setFullName, "full_name")}
                  error={errors.full_name}
                />
                <AuthInput
                  label="Email"
                  placeholder="john@example.com"
                  value={email}
                  onChangeText={handleChangeText(setEmail, "email")}
                  error={errors.email}
                />
                <AuthInput
                  label="Username"
                  placeholder="john_doe"
                  value={username}
                  onChangeText={handleChangeText(setUsername, "username")}
                  error={errors.username}
                />
                <AuthInput
                  label="Password"
                  placeholder="Enter your password"
                  isPassword
                  value={password}
                  onChangeText={handleChangeText(setPassword, "password")}
                  error={errors.password}
                />
                <AuthInput
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  isPassword
                  value={confirmPassword}
                  onChangeText={handleChangeText(setConfirmPassword, "confirmPassword")}
                  error={errors.confirmPassword}
                />

                <View className="pt-4">
                  <AuthButton
                    title="Sign Up"
                    onPress={handleRegister}
                    disabled={!email || !password || !username || !full_name}
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-center text-gray-500 mt-6 mb-4">
                Already have an account? <Text className="text-primary font-medium">Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default RegisterScreen;
