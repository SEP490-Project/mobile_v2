import { convertNumberToVND } from "@/libs/helper/currency-helper";
import { useAppDispatch } from "@/libs/stores";
import { removeFromCart, updateQuantity } from "@/libs/stores/cartManager/slice";
import { CartItem as CartItemType } from "@/libs/types/cart";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const dispatch = useAppDispatch();
  const { product, variant, quantity } = item;

  const handleRemove = () => {
    dispatch(removeFromCart(item.id));
  };

  const handleIncrement = () => {
    dispatch(updateQuantity({ id: item.id, quantity: quantity + 1 }));
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      dispatch(updateQuantity({ id: item.id, quantity: quantity - 1 }));
    }
  };

  const imageUrl =
    variant.images && variant.images.length > 0
      ? variant.images[0].image_url
      : Array.isArray(product.thumbnail_url)
        ? product.thumbnail_url[0]
        : product.thumbnail_url;

  const subtotal = variant.price * quantity;

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm">
      <View className="flex-row">
        {/* Product Image */}
        <Image
          source={{ uri: imageUrl }}
          className="w-24 h-24 rounded-xl bg-gray-100"
          resizeMode="cover"
        />

        {/* Product Details */}
        <View className="flex-1 ml-4">
          <View className="flex-row justify-between items-start">
            <View className="flex-1 pr-2">
              <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={2}>
                {product.name}
              </Text>
              <Text className="text-xs text-gray-500 mb-1">
                {variant.capacity} {variant.capacity_unit} • {variant.container_type}
              </Text>
              {product.type === "LIMITED" && (
                <View className="bg-rose-100 px-2 py-0.5 rounded self-start">
                  <Text className="text-xs font-semibold text-rose-600">LIMITED</Text>
                </View>
              )}
            </View>

            {/* Delete Button */}
            <TouchableOpacity
              onPress={handleRemove}
              className="p-1.5 bg-red-50 rounded-lg"
              activeOpacity={0.7}
            >
              <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>

          {/* Price and Quantity */}
          <View className="flex-row justify-between items-end mt-2">
            {/* Quantity Controls */}
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={handleDecrement}
                className="w-8 h-8 bg-gray-100 rounded-lg items-center justify-center"
                disabled={quantity <= 1}
              >
                <MaterialIcons
                  name="remove"
                  size={16}
                  color={quantity <= 1 ? "#D1D5DB" : "#374151"}
                />
              </TouchableOpacity>

              <Text className="mx-3 text-base font-bold text-gray-800 w-6 text-center">
                {quantity}
              </Text>

              <TouchableOpacity
                onPress={handleIncrement}
                className="w-8 h-8 bg-gray-100 rounded-lg items-center justify-center"
                disabled={quantity >= variant.current_stock}
              >
                <MaterialIcons
                  name="add"
                  size={16}
                  color={quantity >= variant.current_stock ? "#D1D5DB" : "#374151"}
                />
              </TouchableOpacity>
            </View>

            {/* Price */}
            <View className="items-end">
              <Text className="text-xs text-gray-500">
                {convertNumberToVND(variant.price)} each
              </Text>
              <Text className="text-lg font-bold text-rose-600">
                {convertNumberToVND(subtotal)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CartItem;
