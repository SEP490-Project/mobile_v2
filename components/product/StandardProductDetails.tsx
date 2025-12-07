import { convertNumberToVND } from "@/libs/helper/currency-helper";
import { useAuth } from "@/libs/hooks/useAuthen";
import { useAppDispatch } from "@/libs/stores";
import { addToCart } from "@/libs/stores/cartManager/slice";
import { Product, Variant } from "@/libs/types/product";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DetailRow from "./DetailRows";

const { width } = Dimensions.get("window");

const StandardProductDetails = ({ productDetail }: { productDetail: Product | undefined }) => {
  const { user } = useAuth();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    if (productDetail?.variants && productDetail.variants.length > 0) {
      const defaultVariant = productDetail.variants.find((v) => v.is_default);
      setSelectedVariant(defaultVariant || productDetail.variants[0]);
    }
  }, [productDetail]);

  const handleAddToCart = () => {
    if (!productDetail || !selectedVariant) return;

    dispatch(
      addToCart({
        product: productDetail,
        variant: selectedVariant,
        quantity,
      }),
    );

    Alert.alert("Success", `Added ${quantity} ${productDetail.name} to cart`, [
      {
        text: "Continue Shopping",
        style: "cancel",
      },
      {
        text: "View Cart",
        onPress: () => router.push("/(cart)"),
      },
    ]);
  };

  const handleBuyNow = () => {
    if (!productDetail || !selectedVariant) return;
    if (!user) {
      router.replace("/(auth)");
      return;
    }

    router.push({
      pathname: "/(checkout)",
      params: {
        productId: productDetail.id,
        variantId: selectedVariant.id,
        quantity: quantity.toString(),
      },
    });
  };

  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const getDisplayImages = () => {
    if (selectedVariant?.images && selectedVariant.images.length > 0) {
      return selectedVariant.images.map((img) => img.image_url);
    }
    return productDetail?.thumbnail_url || [];
  };

  const displayImages = getDisplayImages();

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View className="bg-gray-50">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setSelectedImageIndex(index);
            }}
          >
            {displayImages.map((imageUrl, index) => (
              <Image
                key={index}
                source={{ uri: imageUrl }}
                style={{ width, height: width * 0.8 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Image Indicators */}
          {displayImages.length > 1 && (
            <View className="flex-row justify-center py-2">
              {displayImages.map((_, index) => (
                <View
                  key={index}
                  className={`h-2 w-2 rounded-full mx-1 ${
                    index === selectedImageIndex ? "bg-rose-500" : "bg-gray-300"
                  }`}
                />
              ))}
            </View>
          )}
        </View>

        {/* Product Info */}
        <View className="px-4 py-4">
          <Text className="text-2xl font-bold text-gray-900 mb-2">{productDetail?.name}</Text>

          {/* Brand */}
          {productDetail?.brand_name && (
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="business" size={18} color="#9CA3AF" />
              <Text className="text-gray-600 ml-2 text-base">{productDetail?.brand_name}</Text>
            </View>
          )}

          {/* Category */}
          {productDetail?.category && (
            <View className="flex-row items-center mb-4">
              <MaterialIcons name="category" size={18} color="#9CA3AF" />
              <Text className="text-gray-600 ml-2">{productDetail?.category.name}</Text>
            </View>
          )}

          {/* Price */}
          {selectedVariant && (
            <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-gray-100">
              <View>
                <Text className="text-gray-500 text-sm mb-1">Price</Text>
                <Text className="text-3xl font-bold text-rose-600">
                  {convertNumberToVND(selectedVariant.price)}
                </Text>
              </View>
            </View>
          )}

          {/* Variant Selection */}
          {productDetail?.variants && productDetail?.variants.length > 1 && (
            <View className="mb-4">
              <Text className="text-gray-800 font-semibold text-base mb-3">
                Select Variant ({productDetail?.variants.length} available)
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {productDetail?.variants.map((variant) => (
                  <TouchableOpacity
                    key={variant.id}
                    onPress={() => {
                      setSelectedVariant(variant);
                      setQuantity(1);
                    }}
                    className={`mr-3 px-4 py-3 rounded-xl border-2 ${
                      selectedVariant?.id === variant.id
                        ? "border-rose-500 bg-rose-50"
                        : "border-gray-200 bg-white"
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`font-semibold ${
                        selectedVariant?.id === variant.id ? "text-rose-600" : "text-gray-700"
                      }`}
                    >
                      {variant.capacity} {variant.capacity_unit}
                    </Text>
                    <Text className="text-gray-500 text-xs mt-1">
                      {variant.container_type} - {variant.dispenser_type}
                    </Text>
                    <Text
                      className={`text-sm font-bold mt-1 ${
                        selectedVariant?.id === variant.id ? "text-rose-600" : "text-gray-800"
                      }`}
                    >
                      {convertNumberToVND(variant.price)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Quantity Selector */}

          <View className="mb-6">
            <Text className="text-gray-800 font-semibold text-base mb-3">Quantity</Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={decrementQuantity}
                className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center"
                disabled={quantity <= 1}
              >
                <MaterialIcons
                  name="remove"
                  size={24}
                  color={quantity <= 1 ? "#D1D5DB" : "#374151"}
                />
              </TouchableOpacity>

              <View className="mx-4 w-16 h-12 bg-gray-50 rounded-xl items-center justify-center">
                <Text className="text-xl font-bold text-gray-800">{quantity}</Text>
              </View>

              <TouchableOpacity
                onPress={incrementQuantity}
                className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center"
                disabled={!selectedVariant || quantity >= 10}
              >
                <MaterialIcons
                  name="add"
                  size={24}
                  color={!selectedVariant || quantity >= 10 ? "#D1D5DB" : "#374151"}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View className="border-t border-gray-100">
            <View className="border-b border-gray-100">
              <TouchableOpacity
                onPress={() => setDetailModalVisible(true)}
                className="my-3 flex-row justify-between items-center"
              >
                <Text className="text-gray-800 font-semibold text-base">Detailed Information</Text>
                <View className="flex-row items-center justify-center">
                  <Text className="text-gray-600">View</Text>
                  <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            </View>
            <View className="my-4">
              <Text className="text-gray-800 font-semibold text-base mb-1">Description</Text>
              <View>
                <Text className="text-gray-600">{productDetail?.description}</Text>
                <Text className="text-gray-600">{selectedVariant?.uses}</Text>
                <Text className="text-gray-600">{selectedVariant?.instructions}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="px-4 pt-4 border-t border-gray-100 bg-white">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handleAddToCart}
            className="flex-1 bg-white border-2 border-rose-500 rounded-xl py-4 items-center justify-center"
            activeOpacity={0.7}
          >
            <Text className="text-rose-500 font-bold text-base">Add to Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleBuyNow}
            className="flex-1 bg-rose-500 rounded-xl py-4 items-center justify-center shadow-lg"
            activeOpacity={0.7}
          >
            <Text className="text-white font-bold text-base">Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ProductDetailsModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        selectedVariant={selectedVariant}
      />
    </View>
  );
};

const ProductDetailsModal = ({
  visible,
  onClose,
  selectedVariant,
}: {
  visible: boolean;
  onClose: () => void;
  selectedVariant: Variant | null;
}) => {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={true}>
      {selectedVariant && (
        <View className="flex-1 justify-end bg-black/30" onTouchStart={onClose}>
          <SafeAreaView
            className="bg-gray-50 rounded-t-2xl p-4 h-fit z-50"
            onTouchStart={(e) => e.stopPropagation()}
          >
            <Text className="text-xl font-bold text-gray-900 mb-2">Detailed Information</Text>
            <DetailRow
              label="Capacity"
              value={`${selectedVariant.capacity} ${selectedVariant.capacity_unit}`}
            />
            <DetailRow label="Container" value={selectedVariant.container_type} />
            <DetailRow label="Dispenser" value={selectedVariant.dispenser_type} />

            {/* Dates */}
            {selectedVariant.manufacturing_date && (
              <DetailRow
                label="Manufacture Date"
                value={new Date(selectedVariant.manufacturing_date).toLocaleDateString()}
              />
            )}
            {selectedVariant.expiry_date && (
              <DetailRow
                label="Expiry Date"
                value={new Date(selectedVariant.expiry_date).toLocaleDateString()}
              />
            )}

            {/* Dimensions */}
            {(selectedVariant.weight ||
              selectedVariant.height ||
              selectedVariant.length ||
              selectedVariant.width) && (
              <>
                <DetailRow label="Weight" value={`${selectedVariant.weight} g`} />
                <DetailRow
                  label="Height x Length x Width"
                  value={`${selectedVariant.height} cm x ${selectedVariant.length} cm x ${selectedVariant.width} cm`}
                />
              </>
            )}
            <View>
              <TouchableOpacity
                onPress={onClose}
                className="w-full mt-4 bg-primary rounded-xl py-4 items-center justify-center"
              >
                <Text className="text-white font-bold text-center">Close</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      )}
    </Modal>
  );
};

export default StandardProductDetails;
