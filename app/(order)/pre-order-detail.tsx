import { CompensateModal } from "@/components/order/CompensateModal";
import RefundModal from "@/components/order/RefundModal";
import { convertNumberToVND } from "@/libs/helper/currency-helper";
import { RootState, useAppDispatch } from "@/libs/stores";
import {
  receivePreOrderThunk,
  requestCompensatePreOrderThunk,
  requestRefundPreOrderThunk,
} from "@/libs/stores/orderManager/thunk";
import { PreOrderData } from "@/libs/types/pre-order";
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
    case "pre_ordered":
      return "text-purple-800 bg-purple-100";
    case "awaiting_pickup":
      return "text-yellow-800 bg-yellow-100";
    case "in_transit":
      return "text-blue-800 bg-blue-100";
    case "delivered":
      return "text-green-800 bg-green-100";
    case "shipped":
      return "text-orange-800 bg-orange-100";
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
  const [showCompensateModal, setShowCompensateModal] = React.useState(false);
  const [showRefundModal, setShowRefundModal] = React.useState(false);
  const [zoomedIn, setZoomedIn] = React.useState(false);

  const { loading } = useSelector((state: RootState) => state.manageOrder);

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

  const handleCompensatePreOrder = async (reason: string, file: any) => {
    const formData = new FormData();
    formData.append("reason", reason);
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);

    const result = await dispatch(
      requestCompensatePreOrderThunk({ preOrderId: preOrder.id, formData }),
    );

    if (requestCompensatePreOrderThunk.fulfilled.match(result)) {
      alert("Compensation request submitted successfully.");
      setShowCompensateModal(false);
      router.back();
    } else {
      alert(result.payload || "Failed to submit compensation request.");
    }
  };

  const handleReceivePreOrder = async () => {
    const result = await dispatch(receivePreOrderThunk(preOrder.id));

    console.log("Receive pre-order result:", result);
    if (receivePreOrderThunk.fulfilled.match(result)) {
      alert("Pre-order received successfully.");
      router.back();
    } else {
      alert(result.payload || "Failed to receive pre-order. Please try again.");
    }
  };

  const handleRefundPreOrder = async (reason: string) => {
    const formData = new FormData();
    formData.append("reason", reason);

    const result = await dispatch(
      requestRefundPreOrderThunk({ preOrderId: preOrder.id, reason: formData }),
    );

    if (requestRefundPreOrderThunk.fulfilled.match(result)) {
      alert("Refund request submitted successfully.");
      setShowRefundModal(false);
      router.back();
    } else {
      alert(result.payload || "Failed to submit refund request. Please try again.");
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

  const handleCopyToClipboard = async (text: string | undefined) => {
    if (text) {
      await Clipboard.setStringAsync(text);
    }
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
            <View className="flex flex-row gap-2">
              <Text className="text-sm text-gray-500">Pre-Order ID</Text>
              <TouchableOpacity
                onPress={() => handleCopyToClipboard(preOrder.id)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="content-copy" size={14} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <Text className="font-mono text-sm text-gray-700">#{preOrder.id.slice(0, 8)}</Text>
          </View>
          {preOrder.ghn_order_code && (
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex flex-row gap-2">
                <Text className="text-sm text-gray-500">GHN Order Code</Text>
                <TouchableOpacity
                  onPress={() => handleCopyToClipboard(preOrder.ghn_order_code)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="content-copy" size={14} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <Text className="text-sm text-gray-700">{preOrder.ghn_order_code}</Text>
            </View>
          )}

          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-gray-500">Status</Text>
            <View
              className={`px-3 py-1 rounded-full ${getStatusColor(preOrder.status).split(" ")[1]}`}
            >
              <Text
                className={`text-xs font-semibold ${getStatusColor(preOrder.status).split(" ")[0]}`}
              >
                {getStatusText(
                  preOrder.status.toLowerCase() === "shipped" ? "Picked Up" : preOrder.status,
                )}
              </Text>
            </View>
          </View>
          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-sm text-gray-500">Pickup Method</Text>
            <Text
              className={`text-sm font-medium rounded-full px-3 ${preOrder.is_self_picked_up ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800"}`}
            >
              {preOrder.is_self_picked_up ? "In-Store Pickup" : "Home Delivery"}
            </Text>
          </View>
          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-sm text-gray-500">Created Date</Text>
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

        {(preOrder.status === "COMPENSATED" || preOrder.status === "REFUNDED") && (
          <View className="bg-yellow-50 px-4 py-3 mb-2 mx-4 rounded-lg border border-yellow-200">
            <Text className="text-yellow-800 font-medium text-center">
              {preOrder.status === "COMPENSATED"
                ? "This pre-order has been compensated."
                : "This pre-order has been refunded."}{" "}
              {"\n"}
              The Image below is the staff {preOrder.status} proof.
            </Text>
            <TouchableOpacity
              className="mt-2 rounded-lg"
              activeOpacity={0.8}
              onPress={() => setZoomedIn(true)}
            >
              <Image
                source={{ uri: preOrder.staff_resource || "" }}
                style={{ width: "100%", height: 200, borderRadius: 12, marginTop: 10 }}
              />
            </TouchableOpacity>
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
              </>
            )}
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
                <Image
                  source={{ uri: preOrder.images?.[0]?.image_url }}
                  style={{ width: 64, height: 64, borderRadius: 12 }}
                />
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

            {/* Review Button for RECEIVED or COMPLETED Status */}
            {preOrder.is_reviewed === false &&
              (preOrder.status.toLowerCase() === "received" ||
                preOrder.status.toLowerCase() === "completed") && (
                <TouchableOpacity
                  className="mt-4 bg-primary rounded-lg py-3 px-4 items-center"
                  onPress={() =>
                    router.push({
                      pathname: "/(review)",
                      params: {
                        referenceId: preOrder.id,
                        orderType: "PREORDER",
                        productName: `${preOrder.capacity} ${preOrder.capacity_unit} (${preOrder.container_type} - ${preOrder.dispenser_type})`,
                        imageUrl: preOrder.images?.[0]?.image_url || "",
                      },
                    })
                  }
                  activeOpacity={0.7}
                >
                  <Text className="text-white font-semibold">Write a Review</Text>
                </TouchableOpacity>
              )}
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
              {/* <View className="flex-row justify-between py-2">
                <Text className="text-gray-600">Updated At</Text>
                <Text className="text-gray-800 font-medium">{preOrder.PaymentTx.updated_at}</Text>
              </View> */}
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

      {preOrder.status.toLowerCase() === "paid" && (
        <View className="bg-white px-4 py-3 border-t border-gray-200">
          <TouchableOpacity
            className="bg-primary rounded-lg py-4 items-center"
            onPress={() => {
              setShowRefundModal(true);
            }}
          >
            <Text className="text-white font-bold text-base">Request Refund</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Delivered Status - Show Received and Compensate Buttons */}
      {preOrder.status.toLowerCase() === "delivered" && (
        <View className="bg-white px-4 py-3 border-t border-gray-200">
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 border border-primary rounded-lg py-4 items-center"
              onPress={() => setShowCompensateModal(true)}
            >
              <Text className="text-primary font-bold text-base">Compensate Pre-order</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-primary rounded-lg py-4 items-center"
              onPress={handleReceivePreOrder}
            >
              <Text className="text-white font-bold text-base">Receive Pre-order</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Compensate Modal */}
      <CompensateModal
        visible={showCompensateModal}
        onClose={() => setShowCompensateModal(false)}
        handleCompensateOrder={handleCompensatePreOrder}
      />
      <RefundModal
        visible={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        handleRefundOrder={handleRefundPreOrder}
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
              source={{ uri: preOrder.staff_resource || "" }}
              style={{ width: "90%", height: "70%", borderRadius: 12 }}
              resizeMode="contain"
            />
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default PreOrderDetailScreen;
