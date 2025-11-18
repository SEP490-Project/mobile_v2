import OrderList from "@/components/order/OrderList";
import PreOrderList from "@/components/order/PreOrderList";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function OrdersScreen() {
  const [orderType, setOrderType] = React.useState<"orders" | "preorders">("orders");

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-100 flex-row justify-between items-center">
        <Text className="text-2xl font-extrabold text-gray-900">My Orders</Text>
        <TouchableOpacity className="p-2 bg-gray-100 rounded-full">
          <MaterialIcons name="shopping-bag" size={22} color="#4B5563" />
        </TouchableOpacity>
      </View>

      {/* Order Type Toggle */}
      <View className="flex-row px-4 py-3 gap-3">
        <TouchableOpacity
          onPress={() => setOrderType("orders")}
          className={`flex-1 py-3 rounded-lg ${orderType === "orders" ? "bg-primary" : "bg-gray-100"}`}
          activeOpacity={0.7}
        >
          <Text
            className={`text-center font-semibold ${orderType === "orders" ? "text-white" : "text-gray-700"}`}
          >
            Orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setOrderType("preorders")}
          className={`flex-1 py-3 rounded-lg ${orderType === "preorders" ? "bg-primary" : "bg-gray-100"}`}
          activeOpacity={0.7}
        >
          <Text
            className={`text-center font-semibold ${orderType === "preorders" ? "text-white" : "text-gray-700"}`}
          >
            Pre-Orders
          </Text>
        </TouchableOpacity>
      </View>

      {/* Order/Pre-Order List */}
      {orderType === "orders" ? <OrderList /> : <PreOrderList />}
    </SafeAreaView>
  );
}

export default OrdersScreen;
