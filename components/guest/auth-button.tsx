import React from "react";
import { Text, TouchableOpacity } from "react-native";

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export default function AuthButton({ title, onPress, disabled }: AuthButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`w-full py-4 rounded-xl ${disabled ? "bg-pink-200" : "bg-primary"}`}
    >
      <Text className="text-white text-center text-base font-semibold">{title}</Text>
    </TouchableOpacity>
  );
}
