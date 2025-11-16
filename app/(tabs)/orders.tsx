import { convertNumberToVND } from "@/libs/helper/currency-helper";
import { RootState, useAppDispatch } from "@/libs/stores";
import { getOrdersThunk } from "@/libs/stores/orderManager/thunk";
import { OrderData } from "@/libs/types/order";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

// --- Màu trạng thái ---
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return "text-green-700";
    case "delivered":
      return "text-green-700";
    case "confirmed":
      return "text-blue-700";
    case "completed":
      return "text-green-700";
    case "in_transit":
    case "shipping":
      return "text-yellow-700";
    case "processing":
    case "pending":
      return "text-blue-700";
    case "cancelled":
      return "text-red-700";
    case "awaiting_pickup":
      return "text-yellow-700";
    case "received":
      return "text-green-700";
    default:
      return "text-gray-700";
  }
};

const getStatusBgColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return "bg-green-100";
    case "confirmed":
      return "bg-blue-100";
    case "delivered":
      return "bg-green-100";
    case "completed":
      return "bg-green-100";
    case "in_transit":
    case "shipping":
      return "bg-yellow-100";
    case "processing":
    case "pending":
      return "bg-blue-100";
    case "cancelled":
      return "bg-red-100";
    case "awaiting_pickup":
      return "bg-yellow-100 ";
    case "received":
      return "bg-green-100";
    default:
      return "bg-gray-100";
  }
};

const getStatusText = (status: string) => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// --- Component ---
function OrdersScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const orderList = useSelector((state: RootState) => state.manageOrder.orderList);
  const loading = useSelector((state: RootState) => state.manageOrder.loading);
  const [refreshing, setRefreshing] = React.useState(false);

  useFocusEffect(() => {
    dispatch(getOrdersThunk());
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(getOrdersThunk());
    setRefreshing(false);
  };

  const handleOrderPress = (orderId: string) => {
    router.push({
      pathname: "/(order)/order-detail",
      params: { orderId },
    });
  };

  if (loading && !orderList) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#ff9fb2" />
        <Text className="mt-4 text-gray-500">Loading orders...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-100 flex-row justify-between items-center">
        <Text className="text-2xl font-extrabold text-gray-900">My Orders</Text>
        <TouchableOpacity className="p-2 bg-gray-100 rounded-full">
          <MaterialIcons name="shopping-bag" size={22} color="#4B5563" />
        </TouchableOpacity>
      </View>

      {/* Danh sách đơn hàng */}
      {orderList?.data && orderList?.data?.length > 0 ? (
        <FlatList
          data={orderList.data}
          keyExtractor={(item: OrderData) => item.id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }: { item: OrderData }) => (
            <TouchableOpacity
              onPress={() => handleOrderPress(item.id)}
              className="bg-white mb-4 rounded-xl shadow-sm border border-gray-100 p-4"
              activeOpacity={0.7}
            >
              {/* Header đơn hàng */}
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-semibold text-gray-800" numberOfLines={1}>
                  Order #{item.id.slice(0, 8)}
                </Text>
                <View className="flex-row gap-1">
                  <View className={`px-3 py-1 rounded-full ${getStatusBgColor(item.status)}`}>
                    <Text className={`font-medium text-xs ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full`}>
                    <Text
                      className={`font-semibold text-xs ${item.order_type.toLowerCase() === "limited" ? "text-yellow-700" : "text-gray-700"}`}
                    >
                      {getStatusText(item.order_type)}
                    </Text>
                  </View>
                </View>
              </View>

              <Text className="text-gray-500 text-sm mb-3">
                {new Date(item.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </Text>

              {/* Order Items Summary */}
              <View className="bg-gray-50 rounded-lg p-3 mb-3">
                <View className="flex-row items-center">
                  <MaterialIcons name="local-drink" size={20} color="#6b7280" />
                  <Text className="text-gray-600 text-sm ml-2">
                    {item.order_items?.length} item(s) •{" "}
                    {item.order_items?.reduce((sum, orderItem) => sum + orderItem.quantity, 0)}{" "}
                    total quantity
                  </Text>
                </View>
                {item.order_items?.length > 2 && (
                  <Text className="text-gray-400 text-xs mt-1 ml-7">
                    +{item.order_items?.length - 2} more items
                  </Text>
                )}
              </View>

              {/* Delivery Address */}
              <View className="flex-row items-start mb-3">
                <MaterialIcons name="location-on" size={16} color="#6b7280" />
                <Text className="text-gray-600 text-sm ml-1 flex-1" numberOfLines={1}>
                  {item.street}, {item.ward_name}, {item.district_name}, {item.province_name}
                </Text>
              </View>

              {/* Footer */}
              <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
                <View>
                  <Text className="text-gray-500 text-xs mb-1">Total Amount</Text>
                  <Text className="text-gray-900 font-bold text-lg">
                    {convertNumberToVND(item.total_amount + item.shipping_fee)}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-blue-500 font-medium mr-1">View Details</Text>
                  <MaterialIcons name="chevron-right" size={20} color="#3b82f6" />
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <MaterialIcons name="shopping-bag" size={80} color="#d1d5db" />
          <Text className="text-xl font-bold text-gray-800 mt-4">No Orders Yet</Text>
          <Text className="text-gray-500 text-center mt-2">
            You haven&apos;t placed any orders yet. Start shopping to see your orders here!
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/")}
            className="bg-blue-500 rounded-lg px-6 py-3 mt-6"
          >
            <Text className="text-white font-semibold">Start Shopping</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

export default OrdersScreen;
