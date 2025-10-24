import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Dữ liệu demo ---
const newsData = [
  {
    id: "1",
    title: "Top 10 Skincare Tips for Healthier Skin",
    description:
      "Discover dermatologist-approved ways to maintain glowing and youthful skin.",
    image:
      "https://phippspharmacy.com/cdn/shop/articles/skincare_b9290896-c6eb-458a-8988-3e8f17ff4b42.webp?v=1745949312",
  },
  {
    id: "2",
    title: "New Makeup Trends 2025 You Should Try",
    description:
      "Explore the hottest looks dominating beauty runways this year.",
    image:
      "https://phippspharmacy.com/cdn/shop/articles/skincare_b9290896-c6eb-458a-8988-3e8f17ff4b42.webp?v=1745949312",
  },
  {
    id: "3",
    title: "How to Protect Your Hair from Heat Damage",
    description:
      "Learn effective techniques to keep your hair strong and shiny all year round.",
    image:
      "https://phippspharmacy.com/cdn/shop/articles/skincare_b9290896-c6eb-458a-8988-3e8f17ff4b42.webp?v=1745949312",
  },
];

// --- Component ---
export default function NewsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-100 flex-row justify-between items-center">
        <Text className="text-2xl font-extrabold text-gray-900">
          Beauty News
        </Text>
        <TouchableOpacity className="p-2 bg-gray-100 rounded-full">
          <MaterialIcons name="notifications-none" size={22} color="#4B5563" />
        </TouchableOpacity>
      </View>

      {/* Danh sách tin */}
      <FlatList
        data={newsData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View className="bg-white mb-4 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <Image
              source={{ uri: item.image }}
              className="w-full h-48"
              resizeMode="cover"
            />
            <View className="p-4">
              <Text
                className="text-lg font-bold text-gray-800 mb-1"
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <Text className="text-gray-500 text-sm mb-3" numberOfLines={2}>
                {item.description}
              </Text>
              <TouchableOpacity className="flex-row items-center">
                <Text className="text-rose-500 font-medium">Read More</Text>
                <MaterialIcons
                  name="arrow-right-alt"
                  size={18}
                  color="#F43F5E"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
