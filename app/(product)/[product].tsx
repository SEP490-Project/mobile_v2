import { convertNumberToVND } from "@/libs/helper/currency-helper";
import { RootState, useAppDispatch } from "@/libs/stores";
import { addToCart } from "@/libs/stores/cartManager/slice";
import { getProductDetailsThunk } from "@/libs/stores/productManager/thunk";
import { Variant } from "@/libs/types/product";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const { width } = Dimensions.get("window");

export default function ProductDetail() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { product: productId } = useLocalSearchParams();

  const productDetail = useSelector((state: RootState) => state.manageProducts.productDetail?.data);
  const loading = useSelector((state: RootState) => state.manageProducts.loading);
  const cartItems = useSelector((state: RootState) => state.manageCart.items);
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedBannerIndex, setSelectedBannerIndex] = useState(0);

  const currentDate = new Date();

  // Setup video player for concept video
  const conceptVideoUrl = productDetail?.concept?.video_thumbnail;
  const videoPlayer = useVideoPlayer(conceptVideoUrl || "", (player) => {
    player.loop = true;
    player.muted = false;
  });

  useEffect(() => {
    if (productId && typeof productId === "string") {
      dispatch(getProductDetailsThunk(productId));
    }
  }, [productId, dispatch]);

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

    router.push({
      pathname: "/(checkout)",
      params: {
        productId: productDetail.id,
        variantId: selectedVariant.id,
        quantity: quantity.toString(),
      },
    });
  };

  const handlePreOrder = () => {
    if (!productDetail || !selectedVariant) return;

    router.push({
      pathname: "/(checkout)",
      params: {
        productId: productDetail.id,
        variantId: selectedVariant.id,
        quantity: quantity.toString(),
        type: "preorder",
      },
    });
  };

  const incrementQuantity = () => {
    if (
      selectedVariant &&
      quantity < selectedVariant.current_stock &&
      productDetail?.type === "LIMITED"
    ) {
      setQuantity(quantity + 1);
    } else if (quantity < 10) {
      setQuantity(quantity + 1);
    }
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

  if (loading || !productDetail) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#ff9fb2" />
        <Text className="text-gray-500 mt-4">Loading product details...</Text>
      </View>
    );
  }

  const displayImages = getDisplayImages();
  const isLimitedEdition = productDetail.type === "LIMITED";
  const hasConcept = isLimitedEdition && productDetail.concept;
  const bannerImages =
    hasConcept && productDetail.concept.banner_url
      ? productDetail.concept.banner_url.split(",").map((url) => url.trim())
      : [];

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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Concept Section - Only for Limited Products with Concept */}
        {hasConcept && (
          <View className="bg-gradient-to-b from-rose-50 to-white px-4 py-6">
            {/* Concept Header */}
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <MaterialIcons name="stars" size={24} color="#f43f5e" />
                <Text className="text-2xl font-bold text-gray-900 ml-2">
                  {productDetail.concept.name}
                </Text>
              </View>
              {productDetail.concept.description && (
                <Text className="text-gray-600 leading-6 text-base">
                  {productDetail.concept.description}
                </Text>
              )}
            </View>

            {/* Concept Video */}
            {conceptVideoUrl && (
              <View className="mb-4">
                <Text className="text-gray-800 font-semibold text-base mb-3">Concept Video</Text>
                <View
                  className="rounded-2xl overflow-hidden shadow-lg bg-black"
                  style={{ height: 220 }}
                >
                  <VideoView
                    player={videoPlayer}
                    style={{ width: "100%", height: "100%" }}
                    allowsFullscreen
                    allowsPictureInPicture
                    nativeControls
                  />
                </View>
              </View>
            )}

            {/* Concept Banner Images */}
            {bannerImages.length > 0 && (
              <View className="mb-2">
                <Text className="text-gray-800 font-semibold text-base mb-3">
                  Concept Gallery ({bannerImages.length} images)
                </Text>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
                    setSelectedBannerIndex(index);
                  }}
                >
                  {bannerImages.map((imageUrl, index) => (
                    <View
                      key={index}
                      style={{
                        width: width - 32,
                        marginRight: index === bannerImages.length - 1 ? 0 : 0,
                      }}
                    >
                      <Image
                        source={{ uri: imageUrl }}
                        style={{ width: width - 32, height: (width - 32) * 0.6 }}
                        className="rounded-2xl"
                        resizeMode="cover"
                      />
                    </View>
                  ))}
                </ScrollView>

                {/* Banner Image Indicators */}
                {bannerImages.length > 1 && (
                  <View className="flex-row justify-center mt-3">
                    {bannerImages.map((_, index) => (
                      <View
                        key={index}
                        className={`h-2 w-2 rounded-full mx-1 ${
                          index === selectedBannerIndex ? "bg-rose-500" : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Concept Dates */}
            {productDetail.concept.created_at && (
              <View className="mt-2 bg-white rounded-xl p-4 shadow-sm">
                <View className="flex-row items-center">
                  <MaterialIcons name="event" size={18} color="#9CA3AF" />
                  <Text className="text-gray-600 text-sm ml-2">
                    Launched:{" "}
                    {new Date(productDetail.concept.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

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

          {/* Limited Edition Badge */}
          {isLimitedEdition && (
            <View className="absolute top-4 right-4 bg-rose-500 px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-bold">
                {/* {days <= 1 ? `${hours} hr ${minutes} min ${seconds} ` : `${days} days`} */}
                LIMITED
              </Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View className="px-4 py-4">
          <Text className="text-2xl font-bold text-gray-900 mb-2">{productDetail.name}</Text>

          {/* Brand */}
          {productDetail.brand_name && (
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="business" size={18} color="#9CA3AF" />
              <Text className="text-gray-600 ml-2 text-base">{productDetail.brand_name}</Text>
            </View>
          )}

          {/* Category */}
          {productDetail.category && (
            <View className="flex-row items-center mb-4">
              <MaterialIcons name="category" size={18} color="#9CA3AF" />
              <Text className="text-gray-600 ml-2">{productDetail.category.name}</Text>
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
              {isLimitedEdition && (
                <View className="items-end">
                  <Text className="text-gray-500 text-sm mb-1">Stock</Text>
                  <Text
                    className={`text-lg font-semibold ${
                      selectedVariant.current_stock > 10 ? "text-green-600" : "text-orange-600"
                    }`}
                  >
                    {currentDate >= new Date(productDetail.limited_product.availability_start_date)
                      ? selectedVariant.current_stock
                      : Number(selectedVariant.pre_order_limit || 0) -
                        Number(selectedVariant.pre_order_count || 0)}{" "}
                    available
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Variant Selection */}
          {productDetail.variants && productDetail.variants.length > 1 && (
            <View className="mb-4">
              <Text className="text-gray-800 font-semibold text-base mb-3">
                Select Variant ({productDetail.variants.length} available)
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {productDetail.variants.map((variant) => (
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
          {/* {!isLimitedEdition && ( */}
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
                disabled={
                  !selectedVariant ||
                  (quantity >= selectedVariant.current_stock && isLimitedEdition)
                }
              >
                <MaterialIcons
                  name="add"
                  size={24}
                  color={
                    !selectedVariant ||
                    (quantity >= selectedVariant.current_stock && isLimitedEdition)
                      ? "#D1D5DB"
                      : "#374151"
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
          {/* )} */}

          {/* Description */}
          {productDetail.description && (
            <View className="mb-6">
              <Text className="text-gray-800 font-semibold text-base mb-2">Description</Text>
              <Text className="text-gray-600 leading-6">{productDetail.description}</Text>
            </View>
          )}

          {/* Variant Details */}
          {selectedVariant && (
            <View className="mb-6 bg-gray-50 rounded-xl p-4">
              <Text className="text-gray-800 font-semibold text-base mb-3">Product Details</Text>

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
                  {selectedVariant.weight > 0 && (
                    <DetailRow label="Weight" value={`${selectedVariant.weight} g`} />
                  )}
                  {selectedVariant.height > 0 && (
                    <DetailRow label="Height" value={`${selectedVariant.height} cm`} />
                  )}
                  {selectedVariant.length > 0 && (
                    <DetailRow label="Length" value={`${selectedVariant.length} cm`} />
                  )}
                  {selectedVariant.width > 0 && (
                    <DetailRow label="Width" value={`${selectedVariant.width} cm`} />
                  )}
                </>
              )}

              {/* Instructions */}
              {selectedVariant.instructions && (
                <View className="mt-2 pt-2">
                  <Text className="text-gray-700 text-sm font-medium mb-1">Instructions:</Text>
                  <Text className="text-gray-600 text-sm leading-5">
                    {selectedVariant.instructions}
                  </Text>
                </View>
              )}

              {/* Uses */}
              {selectedVariant.uses && (
                <View className="mt-2 pt-2 border-t border-gray-200">
                  <Text className="text-gray-700 text-sm font-medium mb-1">Uses:</Text>
                  <Text className="text-gray-600 text-sm leading-5">{selectedVariant.uses}</Text>
                </View>
              )}

              {/* Story */}
              {selectedVariant.story && (
                <View className="mt-2 pt-2 border-t border-gray-200">
                  <Text className="text-gray-700 text-sm font-medium mb-1">Story:</Text>
                  <Text className="text-gray-600 text-sm leading-5">{selectedVariant.story}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {productDetail.type === "STANDARD" ||
      (currentDate >= new Date(productDetail.limited_product.availability_start_date) &&
        isLimitedEdition) ? (
        <View className="px-4 py-4 border-t border-gray-100 bg-white">
          <View className="flex-row gap-3">
            {!isLimitedEdition && (
              <TouchableOpacity
                onPress={handleAddToCart}
                className="flex-1 bg-white border-2 border-rose-500 rounded-xl py-4 items-center justify-center"
                activeOpacity={0.7}
              >
                <Text className="text-rose-500 font-bold text-base">Add to Cart</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleBuyNow}
              className="flex-1 bg-rose-500 rounded-xl py-4 items-center justify-center shadow-lg"
              activeOpacity={0.7}
              disabled={
                isLimitedEdition
                  ? Number(selectedVariant?.current_stock) > Number(selectedVariant?.max_stock)
                  : false
              }
            >
              <Text className="text-white font-bold text-base">
                {isLimitedEdition ? "Buy Now" : "Checkout Now"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View className="px-4 py-4 border-t border-gray-100 bg-white">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handlePreOrder}
              className="flex-1 bg-rose-500 rounded-xl py-4 items-center justify-center shadow-lg"
              activeOpacity={0.7}
              disabled={
                Number(selectedVariant?.pre_order_count) > Number(selectedVariant?.pre_order_limit)
              }
            >
              <Text className="text-white font-bold text-base">Pre-order</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// Helper component for detail rows
const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row justify-between py-2 border-b border-gray-200">
    <Text className="text-gray-600 text-sm">{label}:</Text>
    <Text className="text-gray-800 text-sm font-medium">{value}</Text>
  </View>
);
