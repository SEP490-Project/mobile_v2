import { MaterialIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import React from "react";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// --- Dữ liệu ---
const categories = [
  { id: "1", name: "Skincare", icon: "spa" },
  { id: "2", name: "Makeup", icon: "palette" },
  { id: "3", name: "Haircare", icon: "content-cut" },
  { id: "4", name: "Perfume", icon: "local-florist" },
  { id: "5", name: "Tools", icon: "handyman" },
];

const topRated = [
  {
    id: "1",
    name: "Hydrating Face Cream",
    price: 29.99,
    rating: 4.8,
    image: "https://hoatuongvyspa.com/upload/product/beauty-25g-9579.png",
  },
  {
    id: "2",
    name: "Vitamin C Serum",
    price: 35.0,
    rating: 4.9,
    image:
      "https://product.hstatic.net/1000241635/product/obagi-medical-professional-c-serum-15-362032050522-product-cap-off_275cc86cb749406697f7d54cd8a1dcb7.jpg",
  },
  {
    id: "3",
    name: "Rose Toner Mist",
    price: 22.5,
    rating: 4.7,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgHKgzk3jN2B9w9K0zPe9CRxbUMzFD_3bGlg&s",
  },
];

const limitedProducts = [
  {
    id: "1",
    name: "Limited Edition Lipstick",
    price: 42.0,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5i54dw_4-oEf5YjGzcWyKIxvj3KnPIsV5TA&s",
  },
  {
    id: "2",
    name: "Gold Glow Highlighter",
    price: 49.5,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8neDixiU9MnHKnv2miq8o7qB-pV-ewVseVw&s",
  },
];

const blogPosts = [
  {
    id: "1",
    title: "How to Build a Simple Skincare Routine",
    image:
      "https://theorganiccompoundingpharmacy.com/cdn/shop/articles/How_to_Build_a_Simple_Skincare_Routine_for_Beginners.png?v=1737490654&width=480",
  },
  {
    id: "2",
    title: "Top 5 Makeup Trends of 2025",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPAgEcdWsdoPpihyfXEqQBdpnWkriNEh1COA&s",
  },
  {
    id: "3",
    title: "Haircare Secrets from Professionals",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOdR5A8qlKaImozYZTXFDf3U7UtyGVkcP2Bw&s",
  },
];

// --- Category Item ---
function CategoryItem({ name, icon }: { name: string; icon: string }) {
  return (
    <TouchableOpacity className="items-center mr-4">
      <View className="h-16 w-16 flex items-center justify-center bg-rose-50 border border-rose-100 p-3 rounded-full mb-1">
        <MaterialIcons name={icon as any} size={24} color="#F43F5E" />
      </View>
      <Text className="text-gray-600 text-xs font-medium">{name}</Text>
    </TouchableOpacity>
  );
}

// --- Section Item ---
function Section({
  title,
  products,
  delay = 0,
}: {
  title: string;
  products: any[];
  delay?: number;
}) {
  return (
    <View className="mt-6">
      <View className="flex-row justify-between items-center px-4 mb-3">
        <Text className="text-xl font-bold text-gray-800">{title}</Text>
        <TouchableOpacity className="flex-row items-center">
          <Text className="text-rose-500 font-medium mr-1">See all</Text>
          <MaterialIcons name="chevron-right" size={20} color="#F43F5E" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item, index }) => (
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: delay + index * 120, type: "timing" }}
            className="bg-white rounded-xl p-3 mr-4 border border-gray-100 shadow-sm w-44"
          >
            <Image
              source={{ uri: item.image }}
              className="w-full h-40 rounded-lg mb-3"
            />
            <Text
              numberOfLines={2}
              className="font-semibold text-gray-800 text-base"
            >
              {item.name}
            </Text>
            {item.rating && (
              <View className="flex-row items-center my-1">
                <MaterialIcons name="star" size={16} color="#F59E0B" />
                <Text className="text-yellow-600 text-sm ml-1">
                  {item.rating.toFixed(1)}
                </Text>
              </View>
            )}
            <Text className="text-rose-600 font-bold text-lg mt-1">
              ${item.price.toFixed(2)}
            </Text>
          </MotiView>
        )}
      />
    </View>
  );
}

// --- HomeScreen ---
export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top + 10 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="px-4 pb-4 flex-row items-center justify-between">
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

      {/* Categories */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
        renderItem={({ item }) => (
          <CategoryItem name={item.name} icon={item.icon} />
        )}
      />

      {/* Sections */}
      <Section title="Top Rated Products ✨" products={topRated} delay={100} />
      <Section
        title="Limited Edition ⏳"
        products={limitedProducts}
        delay={400}
      />

      {/* Beauty Blog */}
      <View className="mt-6 px-4 pb-8">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          Beauty Blog
        </Text>
        {blogPosts.map((post, i) => (
          <MotiView
            key={post.id}
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: i * 150, type: "timing" }}
            className="flex-row items-center mb-4 bg-white rounded-xl p-3 border border-gray-100 shadow-sm"
          >
            <Image
              source={{ uri: post.image }}
              className="w-24 h-24 rounded-lg mr-4"
            />
            <View className="flex-1">
              <Text
                className="text-lg font-semibold text-gray-800 mb-1"
                numberOfLines={2}
              >
                {post.title}
              </Text>
              <TouchableOpacity className="flex-row items-center mt-1">
                <Text className="text-sm text-rose-500 font-medium">
                  Read More
                </Text>
                <MaterialIcons
                  name="arrow-right-alt"
                  size={18}
                  color="#F43F5E"
                />
              </TouchableOpacity>
            </View>
          </MotiView>
        ))}
      </View>
    </ScrollView>
  );
}
