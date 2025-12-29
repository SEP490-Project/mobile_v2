import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface AuthInputProps {
  label: string;
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  isPassword?: boolean;
  error?: string;
}

export default function AuthInput({
  label,
  placeholder,
  secureTextEntry: initialSecureTextEntry,
  value,
  onChangeText,
  isPassword = false,
  error,
}: AuthInputProps) {
  const [isSecure, setIsSecure] = useState(initialSecureTextEntry || isPassword);

  const toggleSecureEntry = () => {
    setIsSecure(!isSecure);
  };

  const borderColor = error ? "border-red-500" : "border-gray-300";

  return (
    <View className="w-full mb-4">
      <Text className="text-gray-700 mb-1 font-medium">{label}</Text>
      <View
        className={`flex-row items-center border ${borderColor} rounded-xl px-4 text-base text-gray-900`}
      >
        <TextInput
          className="flex-1 py-3"
          style={{ color: "#111827" }}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={isSecure}
          value={value}
          onChangeText={(text) => onChangeText(text.trim())}
        />
        {isPassword && (
          <TouchableOpacity onPress={toggleSecureEntry} className="p-1 ml-2">
            <Ionicons
              name={isSecure ? "eye-off-outline" : "eye-outline"}
              size={24}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
}
