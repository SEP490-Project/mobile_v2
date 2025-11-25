import { convertNumberToVND } from "@/libs/helper/currency-helper";
import { useAppDispatch } from "@/libs/stores";
import { requestCompensatePreOrderThunk } from "@/libs/stores/orderManager/thunk";
import { PreOrderData } from "@/libs/types/pre-order";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
    case "approved":
      return "text-green-700 bg-green-100";
    case "delivered":
      return "text-green-700 bg-green-100";
    case "pre_ordered":
      return "text-purple-700 bg-purple-100";
    case "confirmed":
      return "text-blue-700 bg-blue-100";
    case "completed":
      return "text-green-700 bg-green-100";
    case "in_transit":
    case "shipping":
      return "text-yellow-700 bg-yellow-100";
    case "processing":
    case "pending":
      return "text-blue-700 bg-blue-100";
    case "cancelled":
    case "rejected":
      return "text-red-700 bg-red-100";
    case "awaiting_pickup":
      return "text-yellow-700 bg-yellow-100";
    case "received":
      return "text-green-700 bg-green-100";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getStatusText = (status: string) => {
  if (!status) return "";
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const PreOrderDetailScreen = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { preOrderData } = useLocalSearchParams();

  // Parse the pre-order data from params
  const preOrder: PreOrderData | null = React.useMemo(() => {
    try {
      if (typeof preOrderData === "string") {
        return JSON.parse(preOrderData);
      }
      return null;
    } catch (error) {
      console.error("Error parsing preOrderData:", error);
      return null;
    }
  }, [preOrderData]);

  if (!preOrder) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#ff9fb2" />
        <Text className="mt-4 text-gray-500">Loading pre-order details...</Text>
      </SafeAreaView>
    );
  }

  const handleCompensatePreOrder = async (file: File, reason: string) => {
    const formData = new FormData();
    formData.append("reason", reason);
    formData.append("file", file);

    const result = await dispatch(
      requestCompensatePreOrderThunk({ preOrderId: preOrder.id, file: formData }),
    );

    console.log("Compensate pre-order result:", result);
    if (requestCompensatePreOrderThunk.fulfilled.match(result)) {
      alert("Compensation request submitted successfully.");
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
        <Text className="text-xl font-bold text-gray-900">Pre-Order Details</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Pre-Order Status Card */}
        <View className="bg-white px-4 py-4 mb-2">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm text-gray-500">Pre-Order ID</Text>
            <Text className="font-mono text-sm text-gray-700">#{preOrder.id.slice(0, 8)}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-gray-500">Status</Text>
            <View
              className={`px-3 py-1 rounded-full ${getStatusColor(preOrder.status).split(" ")[1]}`}
            >
              <Text
                className={`text-xs font-semibold ${getStatusColor(preOrder.status).split(" ")[0]}`}
              >
                {getStatusText(preOrder.status)}
              </Text>
            </View>
          </View>
          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-sm text-gray-500">Pickup Method</Text>
            <Text className="text-sm text-gray-700">
              {preOrder.is_self_picked_up ? "Self Pickup" : "Delivery"}
            </Text>
          </View>
          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-sm text-gray-500">Order Date</Text>
            <Text className="text-sm text-gray-700">
              {new Date(preOrder.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>

        {/* Product Information */}
        <View className="bg-white px-4 py-4 mb-2">
          <View className="flex-row items-center mb-3">
            <MaterialIcons name="local-drink" size={20} color="#ff9fb2" />
            <Text className="text-lg font-bold text-gray-800 ml-2">Product Details</Text>
          </View>
          <View className="bg-gray-50 rounded-lg p-4">
            <View className="flex-row items-center mb-3">
              <View className="w-16 h-16 bg-white rounded-lg items-center justify-center">
                <MaterialIcons name="local-drink" size={32} color="#9ca3af" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="font-bold text-gray-800 text-base">
                  {preOrder.capacity} {preOrder.capacity_unit}
                </Text>
                <Text className="text-sm text-gray-500 mt-1">{preOrder.container_type}</Text>
              </View>
            </View>

            <View className="border-t border-gray-200 pt-3 mt-2">
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-600">Dispenser Type</Text>
                <Text className="text-gray-800 font-medium">
                  {preOrder.dispenser_type || "N/A"}
                </Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-600">Uses</Text>
                <Text className="text-gray-800 font-medium">{preOrder.uses || "N/A"}</Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-600">Quantity</Text>
                <Text className="text-gray-800 font-medium">{preOrder.quantity}</Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-600">Unit Price</Text>
                <Text className="text-gray-800 font-medium">
                  {convertNumberToVND(preOrder.unit_price)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Product Specifications */}
        <View className="bg-white px-4 py-4 mb-2">
          <View className="flex-row items-center mb-3">
            <MaterialIcons name="info" size={20} color="#ff9fb2" />
            <Text className="text-lg font-bold text-gray-800 ml-2">Specifications</Text>
          </View>
          <View className="space-y-2">
            {preOrder.manufacturing_date && (
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-600">Manufacturing Date</Text>
                <Text className="text-gray-800 font-medium">
                  {new Date(preOrder.manufacturing_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </View>
            )}
            {preOrder.expiry_date && (
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-600">Expiry Date</Text>
                <Text className="text-gray-800 font-medium">
                  {new Date(preOrder.expiry_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </View>
            )}
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Dimensions (L×W×H)</Text>
              <Text className="text-gray-800 font-medium">
                {preOrder.length} × {preOrder.width} × {preOrder.height} cm
              </Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-gray-600">Weight</Text>
              <Text className="text-gray-800 font-medium">{preOrder.weight} kg</Text>
            </View>
          </View>
        </View>

        {/* Instructions */}
        {preOrder.instructions && (
          <View className="bg-white px-4 py-4 mb-2">
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="description" size={20} color="#ff9fb2" />
              <Text className="text-lg font-bold text-gray-800 ml-2">Instructions</Text>
            </View>
            <Text className="text-gray-700 leading-6">{preOrder.instructions}</Text>
          </View>
        )}

        {/* Delivery Address */}
        <View className="bg-white px-4 py-4 mb-2">
          <View className="flex-row items-center mb-3">
            <MaterialIcons name="location-on" size={20} color="#ff9fb2" />
            <Text className="text-lg font-bold text-gray-800 ml-2">
              {preOrder.is_self_picked_up ? "Contact Information" : "Delivery Address"}
            </Text>
          </View>
          <View className="bg-gray-50 rounded-lg p-3">
            <Text className="font-semibold text-base text-gray-800">{preOrder.full_name}</Text>
            <Text className="text-gray-600 mt-1">{preOrder.phone_number}</Text>
            <Text className="text-gray-600 mt-1">{preOrder.email}</Text>
            {!preOrder.is_self_picked_up && (
              <>
                <View className="border-t border-gray-200 my-2" />
                <Text className="text-gray-600 mt-2">{preOrder.street}</Text>
                {preOrder.address_line2 && (
                  <Text className="text-gray-600">{preOrder.address_line2}</Text>
                )}
                <Text className="text-gray-600">
                  {preOrder.ward_name}, {preOrder.district_name}
                </Text>
                <Text className="text-gray-600">{preOrder.province_name}</Text>
                {preOrder.city && <Text className="text-gray-600">{preOrder.city}</Text>}
              </>
            )}
          </View>
        </View>

        {/* Attributes Description */}
        {preOrder.attributes_description &&
          typeof preOrder.attributes_description === "object" &&
          Object.keys(preOrder.attributes_description).length > 0 && (
            <View className="bg-white px-4 py-4 mb-2">
              <View className="flex-row items-center mb-3">
                <MaterialIcons name="list" size={20} color="#ff9fb2" />
                <Text className="text-lg font-bold text-gray-800 ml-2">Additional Attributes</Text>
              </View>
              <View className="bg-gray-50 rounded-lg p-3">
                <Text className="text-gray-700">
                  {JSON.stringify(preOrder.attributes_description, null, 2)}
                </Text>
              </View>
            </View>
          )}

        {/* Payment Information */}
        {preOrder.PaymentTx && (
          <View className="bg-white px-4 py-4 mb-2">
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="payment" size={20} color="#ff9fb2" />
              <Text className="text-lg font-bold text-gray-800 ml-2">Payment Information</Text>
            </View>
            <View className="space-y-2">
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-600">Order Code</Text>
                <Text className="text-gray-800 font-medium">
                  #{preOrder.PaymentTx.id.slice(0, 8)}
                </Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-600">Payment Status</Text>
                <View
                  className={`px-3 py-1 rounded-full ${getStatusColor(preOrder.PaymentTx.status).split(" ")[1]}`}
                >
                  <Text
                    className={`text-xs font-semibold ${getStatusColor(preOrder.PaymentTx.status).split(" ")[0]}`}
                  >
                    {getStatusText(preOrder.PaymentTx.status)}
                  </Text>
                </View>
              </View>
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-600">Currency</Text>
                <Text className="text-gray-800 font-medium">{preOrder.PaymentTx.method}</Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-600">Transaction Date</Text>
                <Text className="text-gray-800 font-medium">
                  {preOrder.PaymentTx.transaction_date}
                </Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-600">Updated At</Text>
                <Text className="text-gray-800 font-medium">{preOrder.PaymentTx.updated_at}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Order Summary */}
        <View className="bg-white px-4 py-4 mb-4">
          <View className="flex-row items-center mb-3">
            <MaterialIcons name="receipt" size={20} color="#ff9fb2" />
            <Text className="text-lg font-bold text-gray-800 ml-2">Order Summary</Text>
          </View>
          <View className="space-y-2">
            <View className="flex-row justify-between py-2">
              <Text className="text-gray-600">
                Subtotal ({preOrder.quantity} {preOrder.quantity > 1 ? "items" : "item"})
              </Text>
              <Text className="text-gray-800 font-medium">
                {convertNumberToVND(preOrder.unit_price * preOrder.quantity)}
              </Text>
            </View>
            <View className="border-t border-gray-200 pt-2 mt-2">
              <View className="flex-row justify-between">
                <Text className="text-lg font-bold text-gray-800">Total Amount</Text>
                <Text className="text-lg font-bold text-primary">
                  {convertNumberToVND(preOrder.total_amount)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {preOrder.status.toLowerCase() === "pending" && (
        <View className="bg-white px-4 py-3 border-t border-gray-200">
          <TouchableOpacity
            className="border border-red-500 rounded-lg py-4 items-center"
            onPress={() => {
              // Handle cancel pre-order
              alert("Cancel pre-order functionality coming soon");
            }}
          >
            <Text className="text-red-500 font-bold text-base">Cancel Pre-Order</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default PreOrderDetailScreen;
