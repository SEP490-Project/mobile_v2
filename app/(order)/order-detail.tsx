import { CompensateModal } from "@/components/order/CompensateModal";
import { convertNumberToVND } from "@/libs/helper/currency-helper";
import { RootState, useAppDispatch } from "@/libs/stores";
import {
  receiveOrderThunk,
  requestCompensateOrderThunk,
  requestRefundOrderThunk,
} from "@/libs/stores/orderManager/thunk";
import { OrderData, OrderItem } from "@/libs/types/order";
import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "text-blue-800 bg-blue-100";
    case "paid":
      return "text-green-800 bg-green-100";
    case "refund_request":
      return "text-blue-800 bg-blue-100";
    case "refunded":
      return "text-green-800 bg-green-100";
    case "confirmed":
      return "text-yellow-800 bg-yellow-100";
    case "awaiting_pickup":
      return "text-blue-800 bg-blue-100";
    case "shipped":
      return "text-orange-800 bg-orange-100";
    case "in_transit":
      return "text-blue-800 bg-blue-100";
    case "delivered":
      return "text-green-800 bg-green-100";
    case "received":
      return "text-teal-800 bg-teal-100";
    case "cancelled":
      return "text-red-800 bg-red-100";
    case "compensate_request":
      return "text-blue-800 bg-blue-100";
    case "compensated":
      return "text-green-800 bg-green-100";
    case "completed":
      return "text-green-800 bg-green-100";
    default:
      return "text-gray-800 bg-gray-100";
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
  const { orderList, loading } = useSelector((state: RootState) => state.manageOrder);

  const [compensateModalVisible, setCompensateModalVisible] = React.useState(false);
  const [zoomedIn, setZoomedIn] = React.useState(false);

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
    const result = await dispatch(receiveOrderThunk(order.id));
    if (receiveOrderThunk.fulfilled.match(result)) {
      alert("Order marked as received successfully.");
      router.back();
    } else {
      alert(result.payload || "Failed to mark order as received.");
    }
  };

  const handleRequestRefund = async () => {
    const result = await dispatch(requestRefundOrderThunk(order.id));

    console.log("Refund request result:", result);
    if (requestRefundOrderThunk.fulfilled.match(result)) {
      alert("Refund request submitted successfully.");
      router.back();
    } else {
      alert(result.payload || "Failed to submit refund request.");
    }
  };

  const handleCompensateOrder = async (reason: string, file: any) => {
    const formData = new FormData();
    formData.append("reason", reason);
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);

    const result = await dispatch(requestCompensateOrderThunk({ orderId: order.id, formData }));

    if (requestCompensateOrderThunk.fulfilled.match(result)) {
      alert("Compensation request submitted successfully.");
      setCompensateModalVisible(false);
      router.back();
    } else {
      alert(result.payload || "Failed to submit compensation request.");
    }
  };

  const handleCopyToClipboard = async (text: string | undefined) => {
    if (text) {
      await Clipboard.setStringAsync(text);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#ff9fb2" />
        <Text className="mt-4 text-gray-500">Processing ...</Text>
      </SafeAreaView>
    );
  }

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
          {order.ghn_order_code && (
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex flex-row gap-2">
                <Text className="text-sm text-gray-500">Order Code</Text>
                <TouchableOpacity
                  onPress={() => handleCopyToClipboard(order.ghn_order_code)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="content-copy" size={14} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <Text className="text-sm text-gray-700">{order.ghn_order_code}</Text>
            </View>
          )}
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm text-gray-500">Status</Text>
            <View
              className={`px-3 py-1 rounded-full ${getStatusColor(order.status).split(" ")[1]}`}
            >
              <Text
                className={`text-xs font-semibold ${getStatusColor(order.status).split(" ")[0]}`}
              >
                {getStatusText(order.status)}
              </Text>
            </View>
          </View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm text-gray-500">Order Type</Text>
            <View
              className={`px-3 py-1 rounded-full ${order.order_type === "LIMITED" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100"}`}
            >
              <Text
                className={`text-sm font-medium ${order.order_type === "LIMITED" ? "text-yellow-700" : "text-gray-700"}`}
              >
                {order.order_type === "LIMITED" ? "Limited Order" : "Standard Order"}
              </Text>
            </View>
          </View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm text-gray-500">Picked Up</Text>
            <Text className="text-sm text-gray-700">
              {order.is_self_picked_up ? "At place" : "Delivery"}
            </Text>
          </View>

          <View className="flex-row justify-between items-center">
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

        {(order.status === "COMPENSATED" || order.status === "REFUNDED") && (
          <View className="bg-yellow-50 px-4 py-3 mb-2 mx-4 rounded-lg border border-yellow-200">
            <Text className="text-yellow-800 font-medium text-center">
              {order.status === "COMPENSATED"
                ? "This pre-order has been compensated."
                : "This pre-order has been refunded."}{" "}
              {"\n"}
              The Image below is the staff {order.status} proof.
            </Text>
            <TouchableOpacity
              className="mt-2 rounded-lg"
              onPress={() => setZoomedIn(true)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: order.staff_resource || "" }}
                style={{ width: "100%", height: 200, borderRadius: 12, marginTop: 10 }}
              />
            </TouchableOpacity>
          </View>
        )}

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

        {/* User note */}
        {order.user_note && (
          <View className="bg-white px-4 py-4 mb-2">
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="note" size={20} color="#ff9fb2" />
              <Text className="text-lg font-bold text-gray-800 ml-2">Note</Text>
            </View>
            <Text className="text-gray-700">{order.user_note}</Text>
          </View>
        )}

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
              className={`py-3 ${
                index !== order.order_items.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <View className="flex-row">
                <View className="w-20 h-20 bg-gray-100 rounded-2xl items-center justify-center">
                  <Image
                    source={{ uri: item.images?.[0]?.image_url }}
                    style={{ width: 64, height: 64, borderRadius: 12 }}
                  />
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
              {item.is_reviewed === false &&
                (order.status.toLowerCase() === "received" ||
                  order.status.toLowerCase() === "completed") && (
                  <TouchableOpacity
                    className="mt-3 bg-primary rounded-lg py-2 px-4 items-center"
                    onPress={() =>
                      router.push({
                        pathname: "/(review)",
                        params: {
                          referenceId: item.id,
                          orderType: "ORDER",
                          productName: `${item.capacity} ${item.capacity_unit} (${item.container_type} - ${item.dispenser_type})`,
                          imageUrl: item.images?.[0]?.image_url || "",
                        },
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <Text className="text-white font-semibold">Write a Review</Text>
                  </TouchableOpacity>
                )}
            </View>
          ))}
        </View>

        {/* Payment Transaction */}
        <View className="bg-white px-4 py-4 mb-4">
          <View className="flex-row items-center mb-3">
            <MaterialIcons name="payment" size={20} color="#ff9fb2" />
            <Text className="text-lg font-bold text-gray-800 ml-2">Payment Information</Text>
          </View>
          <View className="space-y-2">
            <View className="flex-row justify-between py-2">
              <Text className="text-gray-600">Id</Text>
              <Text className="text-gray-800 font-medium capitalize">
                #{order.payment_transaction.id.slice(0, 8)}
              </Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-gray-600">Payment Method</Text>
              <Text className="text-gray-800 font-medium capitalize">
                {order.payment_transaction.method}
              </Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-gray-600">Payment Status</Text>
              <View
                className={`px-3 py-1 rounded-full ${getStatusColor(order.payment_transaction.status).split(" ")[1]}`}
              >
                <Text
                  className={`text-xs font-semibold ${getStatusColor(order.payment_transaction.status).split(" ")[0]}`}
                >
                  {getStatusText(order.payment_transaction.status)}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-gray-600">Created Date</Text>
              <Text className="text-gray-800 font-medium">
                {new Date(order.payment_transaction.transaction_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-gray-600">Last Updated</Text>
              <Text className="text-gray-800 font-medium">
                {new Date(order.payment_transaction.updated_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>
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
      </ScrollView>

      {/* Action Buttons */}
      {order.status.toLowerCase() === "delivered" && (
        <View className="flex-row bg-white px-4 py-3 border-t border-gray-200 gap-2">
          <TouchableOpacity
            className="rounded-lg py-4 items-center border border-primary flex-1"
            onPress={() => setCompensateModalVisible(true)}
          >
            <Text className="text-primary font-bold text-base">Compensate Order</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="rounded-lg py-4 items-center bg-primary flex-1"
            onPress={handleReceiveOrder}
          >
            <Text className="text-white font-bold text-base">Receive Order</Text>
          </TouchableOpacity>
        </View>
      )}

      {order.status.toLowerCase() === "paid" && order.order_type !== "LIMITED" && (
        <View className="flex-row bg-white px-4 py-3 border-t border-gray-200 gap-2">
          <TouchableOpacity
            className="rounded-lg py-4 items-center border border-primary flex-1"
            onPress={handleRequestRefund}
          >
            <Text className="text-primary font-bold text-base">Refund Order</Text>
          </TouchableOpacity>
        </View>
      )}

      <CompensateModal
        visible={compensateModalVisible}
        onClose={() => setCompensateModalVisible(false)}
        handleCompensateOrder={handleCompensateOrder}
      />
      {/* Zoomed In Image Modal */}
      {zoomedIn && (
        <Modal animationType="fade" transparent={true} visible={zoomedIn}>
          <View className="flex-1 bg-black bg-opacity-90 justify-center items-center">
            <TouchableOpacity
              className="absolute top-10 right-5 p-2 bg-gray-800 rounded-full"
              onPress={() => setZoomedIn(false)}
            >
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Image
              source={{ uri: order.staff_resource || "" }}
              style={{ width: "90%", height: "70%", borderRadius: 12 }}
              resizeMode="contain"
            />
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default OrderDetailScreen;
