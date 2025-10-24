import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
// Giả sử bạn có thể import Icon từ một thư viện (ví dụ: 'react-native-vector-icons/Ionicons')
// Để đơn giản, tôi sẽ dùng Text cho biểu tượng, nhưng bạn nên dùng icon thật
import { Ionicons } from "@expo/vector-icons"; // Ví dụ dùng @expo/vector-icons nếu bạn dùng Expo

interface AuthInputProps {
  label: string;
  placeholder: string;
  secureTextEntry?: boolean; // Giữ lại để biết đây là trường có thể là mật khẩu
  value: string;
  onChangeText: (text: string) => void;
  isPassword?: boolean; // Prop mới để xác định đây là trường mật khẩu
  error?: string; // Prop mới để hiển thị lỗi validation
}

export default function AuthInput({
  label,
  placeholder,
  secureTextEntry: initialSecureTextEntry, // Đổi tên để tránh xung đột với state
  value,
  onChangeText,
  isPassword = false, // Mặc định không phải mật khẩu
  error,
}: AuthInputProps) {
  // Quản lý trạng thái hiển thị mật khẩu
  const [isSecure, setIsSecure] = useState(initialSecureTextEntry || isPassword);

  const toggleSecureEntry = () => {
    setIsSecure(!isSecure);
  };

  // Xác định màu đường viền dựa trên trạng thái lỗi
  const borderColor = error ? "border-red-500" : "border-gray-300";

  return (
    <View className="w-full mb-4">
      <Text className="text-gray-700 mb-1 font-medium">{label}</Text>
      <View
        className={`flex-row items-center border ${borderColor} rounded-xl px-4 text-base text-gray-900`}
      >
        <TextInput
          className="flex-1 py-3" // flex-1 để chiếm hết không gian còn lại
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={isSecure}
          value={value}
          onChangeText={onChangeText}
        />
        {/* Nút con mắt chỉ hiển thị nếu đây là trường mật khẩu */}
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
      {/* Hiển thị lỗi validation */}
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
}
