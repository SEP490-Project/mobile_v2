import { convertNumberToVND } from "@/libs/helper/currency-helper";
import { RootState, useAppDispatch } from "@/libs/stores";
import { clearCart } from "@/libs/stores/cartManager/slice";
import { caculateDeliveryFeeThunk } from "@/libs/stores/ghnServiceManager/thunk";
import { getShippingAddressesThunk } from "@/libs/stores/locationManager/thunk";
import {
  createPreOrderThunk,
  placeOrderAndPayForLimitedProductThunk,
  placeOrderAndPayThunk,
} from "@/libs/stores/orderManager/thunk";
import { getProductDetailsThunk } from "@/libs/stores/productManager/thunk";
import {
  CreateOrderPayload,
  CreateOrderPayloadItem,
  CreatePreOrderPayload,
} from "@/libs/types/order";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const CheckoutScreen = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { productId, variantId, quantity, type } = useLocalSearchParams();
  const cartItems = useSelector((state: RootState) => state.manageCart.items);

  const isBuyNowCheckout = !!(productId && variantId && quantity);
  const isPreOrderCheckout = type === "preorder";

  const productDetail = useSelector((state: RootState) => state.manageProducts.productDetail?.data);
  const { deliveryFee, loading: ghnLoading } = useSelector(
    (state: RootState) => state.manageGhnService,
  );
  const shippingAddresses = useSelector(
    (state: RootState) => state.manageLocation.shippingAddresses,
  );
  const { loading: orderLoading } = useSelector((state: RootState) => state.manageOrder);

  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [userNote, setUserNote] = useState<string>("");
  const [isSelfPickup, setIsSelfPickup] = useState<boolean>(false);

  // Determine checkout items based on checkout type
  const checkoutItems = useMemo(() => {
    if (isBuyNowCheckout && productDetail) {
      const selectedVariant = productDetail.variants?.find((v) => v.id === variantId);
      if (selectedVariant) {
        return [
          {
            product: productDetail,
            variant: selectedVariant,
            quantity: parseInt(quantity as string) || 1,
          },
        ];
      }
    }
    // Cart checkout - return all cart items
    return cartItems.map((item) => ({
      product: item.product,
      variant: item.variant,
      quantity: item.quantity,
    }));
  }, [isBuyNowCheckout, productDetail, variantId, quantity, cartItems]);

  // Fetch product details if it's a Buy Now checkout
  useEffect(() => {
    if (isBuyNowCheckout && productId) {
      dispatch(getProductDetailsThunk(productId as string));
    }
    dispatch(getShippingAddressesThunk());
  }, [dispatch, productId, isBuyNowCheckout]);

  useEffect(() => {
    if (shippingAddresses?.data && shippingAddresses.data.length > 0) {
      const defaultAddress = shippingAddresses.data.find((addr) => addr.is_default);
      setSelectedAddress(defaultAddress || shippingAddresses.data[0]);
    }
  }, [shippingAddresses]);

  // Calculate delivery fee based on checkout items
  useEffect(() => {
    if (selectedAddress && checkoutItems.length > 0) {
      const payload = {
        items: checkoutItems.map((item) => ({
          height: item.variant.height || 0,
          length: item.variant.length || 0,
          name: item.product.name || "",
          price: item.variant.price || 0,
          quantity: item.quantity,
          weight: item.variant.weight || 0,
          width: item.variant.width || 0,
        })),
        to_district_id: selectedAddress.ghn_district_id || 0,
        to_ward_code: selectedAddress.ghn_ward_code || "",
      };
      dispatch(caculateDeliveryFeeThunk(payload));
    }
  }, [selectedAddress, checkoutItems, dispatch]);

  // Calculate totals
  const subtotal = checkoutItems.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  const shippingFee = deliveryFee?.data?.total || 0;
  const total = subtotal + shippingFee;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert("Error", "Please select a delivery address");
      return;
    }

    if (checkoutItems.length === 0) {
      Alert.alert("Error", "No items to checkout");
      return;
    }

    const orderItems: CreateOrderPayloadItem[] = checkoutItems.map((item) => ({
      height: item.variant.height || 0,
      length: item.variant.length || 0,
      quantity: item.quantity,
      variant_id: item.variant.id,
      weight: item.variant.weight || 0,
      width: item.variant.width || 0,
    }));

    const payload: CreateOrderPayload = {
      cancel_url: "b-showsell://payment-failed",
      success_url: "b-showsell://payment-success",
      order: {
        is_self_pickup: isSelfPickup,
        user_note: userNote,
        address_id: selectedAddress.id,
        items: orderItems,
      },
    };

    try {
      const result = await dispatch(
        productDetail?.type === "LIMITED"
          ? placeOrderAndPayForLimitedProductThunk(payload)
          : placeOrderAndPayThunk(payload),
      ).unwrap();

      // Clear cart if this was a cart checkout
      if (!isBuyNowCheckout) {
        dispatch(clearCart());
      }

      // Check if payment URL exists in response
      if (result?.data?.payment_tx?.checkoutUrl) {
        const paymentUrl = result.data.payment_tx.checkoutUrl;
        Alert.alert(
          "Order Created!",
          "Your order has been created. You will be redirected to payment.",
          [
            {
              text: "Pay Now",
              onPress: () => {
                router.push({ pathname: "/(payment)", params: { paymentUrl } });
              },
            },
            {
              text: "Pay Later",
              style: "cancel",
              onPress: () => router.push("/(tabs)/orders"),
            },
          ],
        );
      } else {
        Alert.alert("Success", "Order placed successfully!", [
          {
            text: "OK",
            onPress: () => router.push("/(tabs)/orders"),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert("Error", error || "Failed to place order");
    }
  };

  const handlePreOrder = async () => {
    if (!selectedAddress) {
      Alert.alert("Error", "Please select a delivery address");
      return;
    }

    if (!variantId) {
      Alert.alert("Error", "No product variant selected");
      return;
    }

    const payload: CreatePreOrderPayload = {
      address_id: selectedAddress.id,
      cancel_url: "b-showsell://payment-failed",
      success_url: "b-showsell://payment-success",
      is_self_pickup: isSelfPickup,
      variant_id: variantId as string,
      user_note: userNote,
    };

    console.log("Pre-order payload:", payload);

    try {
      const result = await dispatch(createPreOrderThunk(payload)).unwrap();

      // Check if payment URL exists in response
      if (result?.data?.payment_tx?.checkoutUrl) {
        const paymentUrl = result.data.payment_tx.checkoutUrl;
        Alert.alert(
          "Pre-Order Created!",
          "Your pre-order has been created. You will be redirected to payment.",
          [
            {
              text: "Pay Now",
              onPress: () => {
                router.push({ pathname: "/(payment)", params: { paymentUrl } });
              },
            },
            {
              text: "Pay Later",
              style: "cancel",
              onPress: () => router.push("/(tabs)/orders"),
            },
          ],
        );
      } else {
        Alert.alert("Success", "Pre-order placed successfully!", [
          {
            text: "OK",
            onPress: () => router.push("/(tabs)/orders"),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert("Error", error || "Failed to place pre-order");
    }
  };

  // Show loading for Buy Now checkout if product details aren't loaded
  if (isBuyNowCheckout && !productDetail) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#ff9fb2" />
      </SafeAreaView>
    );
  }

  // Show error if no items to checkout
  if (checkoutItems.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text className="text-gray-500">No items to checkout</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (ghnLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#ff9fb2" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="relative flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 bg-gray-50 rounded-full absolute left-4 z-50"
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-gray-600 font-semibold text-2xl text-center w-full">My Orders</Text>
        </View>

        {/* Delivery Address Section */}
        <View className="bg-white px-4 py-4 mb-2">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-800">Delivery Address</Text>
            <TouchableOpacity onPress={() => router.push("/(user)/(address)/addresses")}>
              <Text className="text-primary text-sm">Change</Text>
            </TouchableOpacity>
          </View>
          {selectedAddress ? (
            <View className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <Text className="font-semibold text-base text-gray-800">
                {selectedAddress.full_name}
              </Text>
              <Text className="text-gray-600 mt-1">{selectedAddress.phone_number}</Text>
              <Text className="text-gray-600 mt-2">{selectedAddress.street}</Text>
              <Text className="text-gray-600">
                {selectedAddress.ward_name}, {selectedAddress.district_name},{" "}
                {selectedAddress.province_name}
              </Text>
              {selectedAddress.is_default && (
                <View className="mt-2">
                  <Text className="text-xs text-primary font-medium">Default Address</Text>
                </View>
              )}
            </View>
          ) : (
            <TouchableOpacity
              className="border border-dashed border-gray-300 rounded-lg p-4 items-center"
              onPress={() => router.push("/(user)/(address)/add_address")}
            >
              <Text className="text-gray-500">+ Add Delivery Address</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Order Items Section */}
        <View className="bg-white px-4 py-4 mb-2">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Order Items ({checkoutItems.length})
          </Text>
          {checkoutItems.map((item, index) => (
            <View key={index} className="flex-row border border-gray-200 rounded-lg p-3 mb-2">
              {item.variant.images && item.variant.images.length > 0 && (
                <Image
                  source={{ uri: item.variant.images[0].image_url }}
                  className="w-20 h-20 rounded-lg"
                  resizeMode="cover"
                />
              )}
              <View className="flex-1 ml-3">
                <Text className="font-semibold text-gray-800" numberOfLines={2}>
                  {item.product.name}
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  {item.variant.capacity} {item.variant.capacity_unit}
                </Text>
                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-primary font-bold">
                    {convertNumberToVND(item.variant.price)}
                  </Text>
                  <Text className="text-gray-600">x {item.quantity}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/*Selected self pickup*/}
        <View className="bg-white px-4 py-4 mb-2">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-800">Self Pickup</Text>
            <TouchableOpacity
              onPress={() => setIsSelfPickup((prev) => !prev)}
              className={`w-6 h-6 rounded-full border-2 ${
                isSelfPickup ? "border-primary bg-primary" : "border-gray-300 bg-white"
              } items-center justify-center`}
            >
              {isSelfPickup && <View className="w-3 h-3 rounded-full bg-white" />}
            </TouchableOpacity>
          </View>
          <Text className="text-gray-600">
            Choose this option if you prefer to pick up your order yourself at our place.
          </Text>
        </View>

        {/* User Note */}
        <View className="bg-white px-4 py-4 mb-2">
          <Text className="text-lg font-bold text-gray-800 mb-3">Order Note</Text>
          <View className="border border-gray-300 rounded-lg p-3 bg-gray-50">
            <TextInput
              className="text-gray-600"
              placeholder="Add a note to your order (e.g., delivery instructions)"
              multiline
              numberOfLines={4}
              onChangeText={(text) => setUserNote(text)}
              value={userNote}
            />
          </View>
        </View>

        {/* Order Summary Section */}
        <View className="bg-white px-4 py-4 mb-2">
          <Text className="text-lg font-bold text-gray-800 mb-3">Order Summary</Text>
          <View className="space-y-2">
            <View className="flex-row justify-between py-2">
              <Text className="text-gray-600">
                Subtotal ({checkoutItems.reduce((sum, item) => sum + item.quantity, 0)} items)
              </Text>
              <Text className="text-gray-800 font-medium">{convertNumberToVND(subtotal)}</Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-gray-600">Shipping Fee</Text>
              <Text className="text-gray-800 font-medium">
                {isSelfPickup || productDetail?.type === "LIMITED"
                  ? convertNumberToVND(0)
                  : convertNumberToVND(shippingFee)}
              </Text>
            </View>
            <View className="border-t border-gray-200 pt-2 mt-2">
              <View className="flex-row justify-between">
                <Text className="text-lg font-bold text-gray-800">Total</Text>
                <Text className="text-lg font-bold text-gray-800">
                  {isSelfPickup || productDetail?.type === "LIMITED"
                    ? convertNumberToVND(total - shippingFee)
                    : convertNumberToVND(total)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View className="bg-white px-4 py-3 border-t border-gray-200">
        <TouchableOpacity
          className={`rounded-lg py-4 items-center ${
            orderLoading || !selectedAddress ? "bg-gray-300" : "bg-primary"
          }`}
          onPress={isPreOrderCheckout ? handlePreOrder : handlePlaceOrder}
          disabled={orderLoading || !selectedAddress}
        >
          {orderLoading ? (
            <ActivityIndicator size="large" color="#ff9fb2" />
          ) : (
            <Text className="text-white font-bold text-lg">
              {isPreOrderCheckout ? "Place Pre-Order" : "Place Order"} -{" "}
              {isSelfPickup || productDetail?.type === "LIMITED"
                ? convertNumberToVND(total - shippingFee)
                : convertNumberToVND(total)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CheckoutScreen;
