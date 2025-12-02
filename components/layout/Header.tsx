import { RootState } from "@/libs/stores";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";

export default function Header() {
  const router = useRouter();
  const cartItems = useSelector((state: RootState) => state.manageCart.items);
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View
      className="px-4 pb-4 flex-row items-center justify-between border-b border-gray-200 bg-white"
      style={{ paddingTop: 50 }}
    >
      <Text className="text-3xl font-extrabold text-primary">B-Showsell</Text>
      <View className="flex-row gap-2">
        <TouchableOpacity
          className="p-2 bg-gray-100 rounded-full"
          onPress={() => router.push("/(search)")}
        >
          <MaterialIcons name="search" size={24} color="#4B5563" />
        </TouchableOpacity>
        <TouchableOpacity
          className="p-2 bg-gray-100 rounded-full"
          activeOpacity={0.7}
          onPress={() => router.push("/(cart)")}
        >
          <MaterialIcons name="shopping-cart" size={24} color="#374151" />
          {cartItemCount > 0 && (
            <View className="absolute -top-1 -right-1 bg-rose-500 rounded-full w-5 h-5 items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {cartItemCount > 9 ? "9+" : cartItemCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
