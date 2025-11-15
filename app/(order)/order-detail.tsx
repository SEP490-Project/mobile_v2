import { convertNumberToVND } from "@/libs/helper/currency-helper";
import { RootState, useAppDispatch } from "@/libs/stores";
import { receiveOrderThunk } from "@/libs/stores/orderManager/thunk";
import { OrderData, OrderItem } from "@/libs/types/order";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-700";
    case "delivered":
      return "bg-green-100 text-green-700";
    case "in_transit":
    case "shipping":
      return "bg-yellow-100 text-yellow-700";
    case "processing":
    case "pending":
      return "bg-blue-100 text-blue-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    case "completed":
      return "bg-green-100 text-green-700";
    case "awaiting_pickup":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getStatusText = (status: string) => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const OrderDetailScreen = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const orderList = useSelector((state: RootState) => state.manageOrder.orderList);

  // Find the specific order
  const order: OrderData | undefined = orderList?.data?.find((o: OrderData) => o.id === orderId);

  if (!order) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#ff9fb2" />
        <Text className="mt-4 text-gray-500">Loading order details...</Text>
      </SafeAreaView>
    );
  }

  const handleReceiveOrder = async () => {
    console.log("Receiving order:", order.id);
    const result = await dispatch(receiveOrderThunk(order.id));
    console.log("Receive order result:", result);
    if (receiveOrderThunk.fulfilled.match(result)) {
      alert("Order marked as received successfully.");
    }
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 bg-gray-50 rounded-full mr-3"
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Order Details</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Order Status Card */}
        <View className="bg-white px-4 py-4 mb-2">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm text-gray-500">Order ID</Text>
            <Text className="font-mono text-sm text-gray-700">#{order.id.slice(0, 8)}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-gray-500">Status</Text>
            <View
              className={`px-3 py-1 rounded-full ${getStatusColor(order.status).split(" ")[0]}`}
            >
              <Text
                className={`text-xs font-semibold ${getStatusColor(order.status).split(" ")[1]}`}
              >
                {getStatusText(order.status)}
              </Text>
            </View>
          </View>
          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-sm text-gray-500">Picked Up</Text>
            <Text className="text-sm text-gray-700">
              {order.is_self_picked_up ? "At place" : "Shipping to address"}
            </Text>
          </View>
          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-sm text-gray-500">Order Date</Text>
            <Text className="text-sm text-gray-700">
              {new Date(order.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View className="bg-white px-4 py-4 mb-2">
          <View className="flex-row items-center mb-3">
            <MaterialIcons name="location-on" size={20} color="#ff9fb2" />
            <Text className="text-lg font-bold text-gray-800 ml-2">Delivery Address</Text>
          </View>
          <View className="bg-gray-50 rounded-lg p-3">
            <Text className="font-semibold text-base text-gray-800">{order.full_name}</Text>
            <Text className="text-gray-600 mt-1">{order.phone_number}</Text>
            <Text className="text-gray-600 mt-1">{order.email}</Text>
            <Text className="text-gray-600 mt-2">{order.street}</Text>
            <Text className="text-gray-600">
              {order.ward_name}, {order.district_name}
            </Text>
            <Text className="text-gray-600">{order.province_name}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View className="bg-white px-4 py-4 mb-2">
          <View className="flex-row items-center mb-3">
            <MaterialIcons name="shopping-cart" size={20} color="#ff9fb2" />
            <Text className="text-lg font-bold text-gray-800 ml-2">
              Order Items ({order.order_items.length})
            </Text>
          </View>
          {order.order_items.map((item: OrderItem, index: number) => (
            <View
              key={item.id}
              className={`flex-row py-3 ${
                index !== order.order_items.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <View className="w-20 h-20 bg-gray-100 rounded-lg items-center justify-center">
                <MaterialIcons name="local-drink" size={32} color="#9ca3af" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="font-semibold text-gray-800">
                  {item.capacity} {item.capacity_unit} - {item.container_type}
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  {item.dispenser_type && `Dispenser: ${item.dispenser_type}`}
                </Text>
                <View className="flex-row justify-between items-center mt-2">
                  <Text className="text-sm text-gray-500">Qty: {item.quantity}</Text>
                  <Text className="text-primary font-semibold">
                    {convertNumberToVND(item.unit_price)}
                  </Text>
                </View>
                <Text className="text-xs text-gray-400 mt-1">
                  Subtotal: {convertNumberToVND(item.subtotal)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View className="bg-white px-4 py-4 mb-2">
          <View className="flex-row items-center mb-3">
            <MaterialIcons name="receipt" size={20} color="#ff9fb2" />
            <Text className="text-lg font-bold text-gray-800 ml-2">Order Summary</Text>
          </View>
          <View className="space-y-2">
            <View className="flex-row justify-between py-2">
              <Text className="text-gray-600">
                Subtotal ({order.order_items.reduce((sum, item) => sum + item.quantity, 0)} items)
              </Text>
              <Text className="text-gray-800 font-medium">
                {convertNumberToVND(
                  order.order_items.reduce((sum, item) => sum + item.subtotal, 0),
                )}
              </Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-gray-600">Shipping Fee</Text>
              <Text className="text-gray-800 font-medium">
                {convertNumberToVND(order.shipping_fee)}
              </Text>
            </View>
            <View className="border-t border-gray-200 pt-2 mt-2">
              <View className="flex-row justify-between">
                <Text className="text-lg font-bold text-gray-800">Total</Text>
                <Text className="text-lg font-bold text-primary">
                  {convertNumberToVND(order.total_amount + order.shipping_fee)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* User note */}
        {order.user_note && (
          <View className="bg-white px-4 py-4 mb-4">
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="note" size={20} color="#ff9fb2" />
              <Text className="text-lg font-bold text-gray-800 ml-2">Note</Text>
            </View>
            <Text className="text-gray-700">{order.user_note}</Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {order.status.toLowerCase() === "pending" && (
        <View className="flex-row bg-white px-4 py-3 border-t border-gray-200 gap-2">
          {order.status.toLowerCase() === "paid" && (
            <TouchableOpacity className="rounded-lg py-4 items-center border border-primary flex-1">
              <Text className="text-primary font-bold text-base">Cancel Order</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity className="bg-primary rounded-lg py-4 items-center flex-1">
            <Text className="text-white font-bold text-base">Pay Order</Text>
          </TouchableOpacity>
        </View>
      )}

      {order.status.toLowerCase() === "delivered" && (
        <View className="flex-row bg-white px-4 py-3 border-t border-gray-200 gap-2">
          <TouchableOpacity
            className="rounded-lg py-4 items-center bg-primary flex-1"
            onPress={handleReceiveOrder}
          >
            <Text className="text-white font-bold text-base">Received Order</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default OrderDetailScreen;
