import LimitedProductDetails from "@/components/product/LimitedProductDetails";
import StandardProductDetails from "@/components/product/StandardProductDetails";
import { RootState, useAppDispatch } from "@/libs/stores";
import { getProductDetailsThunk } from "@/libs/stores/productManager/thunk";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

export default function ProductDetail() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { product: productId } = useLocalSearchParams();

  const cartItems = useSelector((state: RootState) => state.manageCart.items);
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const productDetail = useSelector((state: RootState) => state.manageProducts.productDetail?.data);
  const loading = useSelector((state: RootState) => state.manageProducts.loading);

  useEffect(() => {
    if (productId && typeof productId === "string") {
      dispatch(getProductDetailsThunk(productId));
    }
  }, [productId, dispatch]);

  if (loading || !productDetail) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#ff9fb2" />
        <Text className="text-gray-500 mt-4">Loading product details...</Text>
      </View>
    );
  }

  const isLimitedEdition = productDetail?.type === "LIMITED";

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 bg-gray-50 rounded-full"
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-row gap-3">
          <TouchableOpacity className="p-2 bg-gray-50 rounded-full" activeOpacity={0.7}>
            <MaterialIcons name="share" size={24} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity
            className="p-2 bg-gray-50 rounded-full"
            activeOpacity={0.7}
            onPress={() => router.push("/(cart)")}
          >
            <MaterialIcons name="shopping-cart" size={24} color="#374151" />
            {cartItemCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-rose-500 rounded-full w-5 h-5 items-center justify-center">
                <Text className="text-white text-xs font-bold">
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {!isLimitedEdition ? (
        <StandardProductDetails productDetail={productDetail} />
      ) : (
        <LimitedProductDetails productDetail={productDetail} />
      )}
    </SafeAreaView>
  );
}
