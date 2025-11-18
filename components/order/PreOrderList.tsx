import { convertNumberToVND } from "@/libs/helper/currency-helper";
import { RootState, useAppDispatch } from "@/libs/stores";
import { getPreOrdersThunk } from "@/libs/stores/orderManager/thunk";
import { PreOrderData } from "@/libs/types/pre-order";
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
import { useSelector } from "react-redux";

// --- Status Colors ---
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
    case "approved":
      return "text-green-700";
    case "delivered":
      return "text-green-700";
    case "pre_ordered":
      return "text-purple-700";
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
    case "rejected":
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
    case "approved":
      return "bg-green-100";
    case "confirmed":
      return "bg-blue-100";
    case "delivered":
      return "bg-green-100";
    case "pre_ordered":
      return "bg-purple-100";
    case "completed":
      return "bg-green-100";
    case "in_transit":
    case "shipping":
      return "bg-yellow-100";
    case "processing":
    case "pending":
      return "bg-blue-100";
    case "cancelled":
    case "rejected":
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
  if (!status) return "";
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function PreOrderList() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const preOrderList = useSelector((state: RootState) => state.manageOrder.preOrderList);
  const loading = useSelector((state: RootState) => state.manageOrder.loading);
  const [refreshing, setRefreshing] = React.useState(false);

  useFocusEffect(() => {
    dispatch(getPreOrdersThunk());
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(getPreOrdersThunk());
    setRefreshing(false);
  };

  const handlePreOrderPress = (preOrderData: PreOrderData) => {
    router.push({
      pathname: "/(order)/pre-order-detail",
      params: { preOrderData: JSON.stringify(preOrderData) },
    });
  };

  if (loading && !preOrderList) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#ff9fb2" />
        <Text className="mt-4 text-gray-500">Loading pre-orders...</Text>
      </View>
    );
  }

  if (!preOrderList?.data || preOrderList?.data?.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <MaterialIcons name="schedule" size={80} color="#d1d5db" />
        <Text className="text-xl font-bold text-gray-800 mt-4">No Pre-Orders Yet</Text>
        <Text className="text-gray-500 text-center mt-2">
          You haven&apos;t placed any pre-orders yet. Check out our upcoming products!
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/")}
          className="bg-blue-500 rounded-lg px-6 py-3 mt-6"
        >
          <Text className="text-white font-semibold">Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={preOrderList.data}
      keyExtractor={(item: PreOrderData) => item.id}
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      renderItem={({ item }: { item: PreOrderData }) => (
        <TouchableOpacity
          onPress={() => handlePreOrderPress(item)}
          className="bg-white mb-4 rounded-xl shadow-sm border border-gray-100 p-4"
          activeOpacity={0.7}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-2">
            <Text className="font-semibold text-gray-800" numberOfLines={1}>
              Pre-Order #{item.id.slice(0, 8)}
            </Text>
            <View className={`px-3 py-1 rounded-full ${getStatusBgColor(item.status)}`}>
              <Text className={`font-medium text-xs ${getStatusColor(item.status)}`}>
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>

          <Text className="text-gray-500 text-sm mb-3">
            {new Date(item.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Text>

          {/* Product Info */}
          <View className="bg-gray-50 rounded-lg p-3 mb-3">
            <View className="flex-row items-center">
              <MaterialIcons name="local-drink" size={20} color="#6b7280" />
              <Text className="text-gray-600 text-sm ml-2">
                Quantity: {item.quantity} • {item.capacity} {item.capacity_unit}
              </Text>
            </View>
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
                {convertNumberToVND(item.total_amount)}
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
  );
}
