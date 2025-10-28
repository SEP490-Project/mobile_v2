import CartItem from "@/components/cart/CartItem";
import { RootState, useAppDispatch } from "@/libs/stores";
import { clearCart } from "@/libs/stores/cartManager/slice";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const CartScreen = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const cartItems = useSelector((state: RootState) => state.manageCart.items);

  const totalCost = cartItems.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleClearCart = () => {
    Alert.alert("Clear Cart", "Are you sure you want to remove all items from your cart?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All",
        style: "destructive",
        onPress: () => dispatch(clearCart()),
      },
    ]);
  };

  const handleMakeOrder = () => {
    if (cartItems.length === 0) {
      Alert.alert("Empty Cart", "Please add items to your cart before placing an order.");
      return;
    }

    Alert.alert(
      "Make Order",
      `You are about to order ${totalItems} item(s) for $${totalCost.toFixed(2)}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Proceed",
          onPress: () => {
            console.log("Order placed:", {
              items: cartItems.map((item) => ({
                productId: item.product.id,
                variantId: item.variant.id,
                quantity: item.quantity,
              })),
              totalCost,
            });
            Alert.alert("Success", "Order functionality will be implemented with API");
          },
        },
      ],
    );
  };

  const EmptyCart = () => (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <View className="bg-gray-100 rounded-full p-8 mb-6">
        <MaterialIcons name="shopping-cart" size={80} color="#D1D5DB" />
      </View>
      <Text className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</Text>
      <Text className="text-gray-500 text-center mb-8">
        Looks like you haven&apos;t added any items to your cart yet
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/(tabs)")}
        className="bg-rose-500 px-8 py-4 rounded-xl"
        activeOpacity={0.7}
      >
        <Text className="text-white font-bold text-base">Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  if (cartItems.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="px-4 py-3 border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => router.back()}
                className="p-2 bg-gray-50 rounded-full mr-3"
                activeOpacity={0.7}
              >
                <MaterialIcons name="arrow-back" size={24} color="#374151" />
              </TouchableOpacity>
              <Text className="text-2xl font-bold text-gray-900">My Cart</Text>
            </View>
          </View>
        </View>
        <EmptyCart />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 bg-gray-50 rounded-full mr-3"
              activeOpacity={0.7}
            >
              <MaterialIcons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-gray-900">My Cart</Text>
              <Text className="text-sm text-gray-500">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </Text>
            </View>
          </View>

          {/* Clear All Button */}
          {cartItems.length > 0 && (
            <TouchableOpacity
              onPress={handleClearCart}
              className="bg-red-50 px-4 py-2 rounded-lg"
              activeOpacity={0.7}
            >
              <Text className="text-red-600 font-semibold text-sm">Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Cart Items List */}
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CartItem item={item} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Section - Total & Actions */}
      <View className="bottom-0 left-0 right-0 border-gray-100 bg-white border-t px-4">
        {/* Summary */}
        <View className="bg-gray-50 rounded-xl p-4 mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-600">Subtotal ({totalItems} items)</Text>
            <Text className="text-gray-800 font-semibold">${totalCost.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between items-center py-3 border-t border-gray-200">
            <Text className="text-lg font-bold text-gray-900">Total</Text>
            <Text className="text-2xl font-bold text-rose-600">${totalCost.toFixed(2)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.push("/(tabs)")}
            className="flex-1 bg-white border-2 border-gray-300 rounded-xl py-4 items-center justify-center"
            activeOpacity={0.7}
          >
            <Text className="text-gray-700 font-bold text-base">Continue Shopping</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleMakeOrder}
            className="flex-1 bg-rose-500 rounded-xl py-4 items-center justify-center shadow-lg"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <MaterialIcons name="shopping-bag" size={20} color="white" />
              <Text className="text-white font-bold text-base ml-2">Place Order</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CartScreen;
