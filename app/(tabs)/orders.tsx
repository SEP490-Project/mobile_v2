import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Dữ liệu mẫu ---
const orders = [
  {
    id: "ORD12345",
    status: "Delivered",
    date: "Oct 22, 2025",
    total: 82.5,
    items: [
      {
        name: "Hydrating Face Cream",
        image: "https://hoatuongvyspa.com/upload/product/beauty-25g-9579.png",
      },
      {
        name: "Vitamin C Serum",
        image:
          "https://product.hstatic.net/1000241635/product/obagi-medical-professional-c-serum-15-362032050522-product-cap-off_275cc86cb749406697f7d54cd8a1dcb7.jpg",
      },
    ],
  },
  {
    id: "ORD12346",
    status: "In Transit",
    date: "Oct 20, 2025",
    total: 49.9,
    items: [
      {
        name: "Limited Edition Lipstick",
        image:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5i54dw_4-oEf5YjGzcWyKIxvj3KnPIsV5TA&s",
      },
    ],
  },
  {
    id: "ORD12347",
    status: "Processing",
    date: "Oct 18, 2025",
    total: 35.0,
    items: [
      {
        name: "Gold Glow Highlighter",
        image:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8neDixiU9MnHKnv2miq8o7qB-pV-ewVseVw&s",
      },
    ],
  },
];

// --- Màu trạng thái ---
const getStatusColor = (status: string) => {
  switch (status) {
    case "Delivered":
      return "text-green-600";
    case "In Transit":
      return "text-yellow-600";
    case "Processing":
      return "text-blue-600";
    case "Cancelled":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

// --- Component ---
export default function OrdersScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-100 flex-row justify-between items-center">
        <Text className="text-2xl font-extrabold text-gray-900">
          My Orders
        </Text>
        <TouchableOpacity className="p-2 bg-gray-100 rounded-full">
          <MaterialIcons name="shopping-bag" size={22} color="#4B5563" />
        </TouchableOpacity>
      </View>

      {/* Danh sách đơn hàng */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View className="bg-white mb-4 rounded-xl shadow-sm border border-gray-100 p-4">
            {/* Header đơn hàng */}
            <View className="flex-row justify-between items-center mb-2">
              <Text className="font-semibold text-gray-800">
                Order ID: {item.id}
              </Text>
              <Text className={`font-medium ${getStatusColor(item.status)}`}>
                {item.status}
              </Text>
            </View>

            <Text className="text-gray-500 text-sm mb-3">{item.date}</Text>

            {/* Danh sách sản phẩm */}
            <View className="flex-row">
              {item.items.map((p, index) => (
                <Image
                  key={index}
                  source={{ uri: p.image }}
                  className="w-16 h-16 rounded-lg mr-2 border border-gray-100"
                />
              ))}
            </View>

            {/* Footer */}
            <View className="flex-row justify-between items-center mt-4">
              <Text className="text-gray-700 font-medium">
                Total:{" "}
                <Text className="text-rose-600 font-bold">
                  ${item.total.toFixed(2)}
                </Text>
              </Text>
              <TouchableOpacity className="flex-row items-center">
                <Text className="text-rose-500 font-medium mr-1">
                  View Details
                </Text>
                <MaterialIcons name="chevron-right" size={20} color="#F43F5E" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
