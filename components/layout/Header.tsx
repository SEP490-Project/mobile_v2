import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Header() {
  return (
    <View className="px-4 pb-4 flex-row items-center justify-between border-b border-gray-200">
      <Text className="text-3xl font-extrabold text-primary">B-ShowSell</Text>
      <View className="flex-row gap-2">
        <TouchableOpacity className="p-2 bg-gray-100 rounded-full">
          <MaterialIcons name="search" size={24} color="#4B5563" />
        </TouchableOpacity>
        <TouchableOpacity className="p-2 bg-gray-100 rounded-full">
          <MaterialIcons name="shopping-cart" size={24} color="#4B5563" />
          <View className="absolute top-1 right-1 bg-rose-500 w-2 h-2 rounded-full border-2 border-white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
