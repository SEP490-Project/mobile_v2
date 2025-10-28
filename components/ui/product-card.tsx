import { Product } from "@/libs/types/product";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const getProductPrice = () => {
    if (!product.variants || product.variants.length === 0) return 0;
    const defaultVariant = product.variants.find((v) => v.is_default);
    return defaultVariant?.price || product.variants[0].price;
  };

  const price = getProductPrice();

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm"
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: product.thumbnail_url?.[0] || "https://via.placeholder.com/150" }}
        className="w-full h-40 rounded-lg mb-3"
        resizeMode="cover"
      />

      <Text numberOfLines={2} className="font-semibold text-gray-800 text-base min-h-[40px]">
        {product.name}
      </Text>

      {product.brand_name && (
        <View className="flex-row items-center my-1">
          <MaterialIcons name="business" size={14} color="#9CA3AF" />
          <Text className="text-gray-600 text-sm ml-1" numberOfLines={1}>
            {product.brand_name}
          </Text>
        </View>
      )}

      <Text className="text-rose-600 font-bold text-lg mt-1">${price.toFixed(2)}</Text>
    </TouchableOpacity>
  );
}
