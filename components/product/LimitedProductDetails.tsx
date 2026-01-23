import { convertNumberToVND } from "@/libs/helper/currency-helper";
import { useAuth } from "@/libs/hooks/useAuthen";
import { Product, Variant } from "@/libs/types/product";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useState } from "react";
import { Dimensions, Image, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import DetailRow from "./DetailRows";
import ProductReviews from "./ProductReviews";

const { width } = Dimensions.get("window");
const HEADER_HEIGHT = 220;

const LimitedProductDetails = ({ productDetail }: { productDetail: Product }) => {
  const [viewProduct, setViewProduct] = useState(false);

  const currentDate = new Date();
  const endDays = productDetail?.limited_product?.availability_end_date
    ? Math.ceil(
        (new Date(productDetail?.limited_product?.availability_end_date).getTime() -
          currentDate.getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;
  const startDays = productDetail?.limited_product?.availability_start_date
    ? Math.ceil(
        (new Date(productDetail.limited_product.availability_start_date).getTime() -
          currentDate.getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);
  const videoHeaderStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  const conceptVideoUrl = productDetail?.concept?.video_thumbnail;
  const videoPlayer = useVideoPlayer(conceptVideoUrl || "", (player) => {
    player.loop = true;
    player.muted = false;
  });

  useEffect(() => {
    if (!videoPlayer) return;

    if (scrollOffset.value > HEADER_HEIGHT / 2 || viewProduct) {
      videoPlayer.pause();
    }
  }, [videoPlayer, scrollOffset.value, viewProduct]);

  useFocusEffect(() => {
    if (videoPlayer) {
      videoPlayer.play();
    }
  });

  const bannerImages = productDetail.concept.banner_url
    ? productDetail.concept.banner_url.split(",").map((url) => url.trim())
    : [];

  return (
    <View className="flex-1 bg-white">
      <Animated.ScrollView scrollEventThrottle={16} ref={scrollRef}>
        {conceptVideoUrl && (
          <Animated.View
            style={[
              { width: width, height: HEADER_HEIGHT, backgroundColor: "black" },
              videoHeaderStyle,
            ]}
          >
            <VideoView
              player={videoPlayer}
              style={{ width: width, height: "100%" }}
              allowsPictureInPicture
              nativeControls={false}
            />
          </Animated.View>
        )}

        <View className="bg-white rounded-t-xl -mt-2">
          <View className="flex-row justify-between items-center p-4 ">
            <Text className="font-bold text-xl w-[50%]">{productDetail.concept.name}</Text>
            <View className="bg-red-600 rounded-xl">
              <Text className="font-semibold text-lg px-4 text-white">{endDays} days left</Text>
            </View>
          </View>
          <View className="px-4 pb-4">
            {productDetail.limited_product?.availability_start_date &&
              currentDate < new Date(productDetail.limited_product.availability_start_date) && (
                <DetailRow
                  label="Expected Delivery Date"
                  value={`${new Date(
                    productDetail.limited_product.availability_start_date,
                  ).toLocaleDateString()} (~${startDays} days)`}
                />
              )}
            {productDetail.limited_product?.availability_start_date && (
              <DetailRow
                label="End Date"
                value={`${new Date(
                  productDetail.limited_product?.availability_end_date,
                ).toLocaleDateString()} (~${endDays} days)`}
              />
            )}
          </View>
          <View className="flex-row justify-center items-center pb-4">
            <Text className="text-base text-center">{productDetail.concept.description}</Text>
          </View>

          <View>
            <Text className="font-semibold text-lg px-4 mb-2">Concept Banners</Text>
            {bannerImages.length > 0 && (
              <View className="mb-2 flex-row gap-4 p-2">
                {bannerImages?.map((url, index) => (
                  <Image
                    key={index}
                    source={{ uri: url }}
                    className={`h-40 rounded-lg border border-gray-300`}
                    style={{ width: Dimensions.get("window").width / 3 - 16 }}
                    resizeMode="cover"
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </Animated.ScrollView>

      <View className="px-4 pt-4 border-t border-gray-100 bg-white">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => {
              setViewProduct(true);
            }}
            className="flex-1 bg-rose-500 rounded-xl py-4 items-center justify-center shadow-lg"
            activeOpacity={0.7}
          >
            <Text className="text-white font-bold text-base">View Product</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ViewProductModal
        productDetail={productDetail}
        onClose={() => setViewProduct(false)}
        visible={viewProduct}
      />
    </View>
  );
};

const ViewProductModal = ({
  productDetail,
  onClose,
  visible,
}: {
  productDetail: Product;
  onClose: () => void;
  visible: boolean;
}) => {
  const router = useRouter();
  const { user } = useAuth();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  useEffect(() => {
    if (productDetail?.variants && productDetail.variants.length > 0) {
      const defaultVariant = productDetail.variants.find((v) => v.is_default);
      setSelectedVariant(defaultVariant || productDetail.variants[0]);
    }
  }, [productDetail]);

  const currentDate = new Date();
  const endDays = productDetail?.limited_product?.availability_end_date
    ? Math.ceil(
        (new Date(productDetail.limited_product?.availability_end_date).getTime() -
          currentDate.getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;

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
        type: "order",
      },
    });
  };

  const handlePreOrder = () => {
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
        type: "preorder",
      },
    });
  };

  const getDisplayImages = () => {
    if (selectedVariant?.images && selectedVariant.images.length > 0) {
      return selectedVariant.images?.map((img) => img.image_url);
    }
    return productDetail?.thumbnail_url || [];
  };

  const handleIncrementQuantity = () => {
    if (!selectedVariant) return;
    if (
      productDetail.limited_product &&
      quantity < productDetail.limited_product?.achievable_quantity
    ) {
      setQuantity(quantity + 1);
    } else {
      alert("You have reached the maximum orderable quantity for this product.");
    }
  };

  const handleDecrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const displayImages = getDisplayImages();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1 bg-white">
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
              {displayImages?.map((imageUrl, index) => (
                <Image
                  key={index}
                  source={{ uri: imageUrl }}
                  style={{ width, height: width * 0.8 }}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            {/* Image Indicators */}
            {displayImages?.length > 1 && (
              <View className="flex-row justify-center py-2">
                {displayImages?.map((_, index) => (
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
            <View className="absolute top-4 left-4 p-2 bg-black/50 rounded-full">
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <View className="absolute top-4 right-4 bg-rose-500 px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-bold">{endDays} days left</Text>
            </View>
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

                <View className="items-end">
                  <Text className="text-gray-500 text-sm mb-1">
                    {currentDate <
                    new Date(productDetail.limited_product?.availability_start_date || new Date())
                      ? "Pre-order Stock"
                      : "Available Stock"}
                  </Text>
                  <Text
                    className={`text-lg font-semibold ${
                      selectedVariant.current_stock > 10 ? "text-green-600" : "text-orange-600"
                    }`}
                  >
                    {productDetail.limited_product &&
                    currentDate >= new Date(productDetail.limited_product.availability_start_date)
                      ? selectedVariant.current_stock
                      : Number(selectedVariant.pre_order_limit || 0) -
                        Number(selectedVariant.pre_order_count || 0)}{" "}
                    available
                  </Text>
                </View>
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

            <View className="mb-6">
              <Text className="text-gray-800 font-semibold text-base mb-3">Quantity</Text>
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={handleDecrementQuantity}
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
                  onPress={handleIncrementQuantity}
                  className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center"
                  disabled={
                    !selectedVariant ||
                    quantity === (productDetail.limited_product?.achievable_quantity || 1)
                  }
                >
                  <MaterialIcons
                    name="add"
                    size={24}
                    color={
                      !selectedVariant ||
                      quantity === (productDetail.limited_product?.achievable_quantity || 1)
                        ? "#D1D5DB"
                        : "#374151"
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View className="pb-4">
              <Text className="text-gray-800 font-semibold text-base mb-1">Description</Text>
              <View>
                <Text className="text-primary">{selectedVariant?.story}</Text>
                <Text className="text-gray-600">{selectedVariant?.uses}</Text>
                <Text className="text-gray-600">{selectedVariant?.instructions}</Text>
              </View>
            </View>

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
                    <DetailRow
                      label="Height x Length x Width"
                      value={`${selectedVariant.height} cm x ${selectedVariant.length} cm x ${selectedVariant.width} cm`}
                    />
                  </>
                )}
                {selectedVariant.attributes && selectedVariant.attributes.length > 0 && (
                  <View className="py-2">
                    <Text className="text-gray-600 text-sm">Attributes:</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {selectedVariant.attributes?.map((attr) => (
                        <View
                          key={attr.ingredient}
                          className="bg-gray-200 rounded-md px-2 py-1 mt-1"
                        >
                          <Text className="text-gray-800 text-sm font-medium">
                            {`${attr.ingredient}: ${attr.value} ${attr.unit}`}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Reviews Section */}
          <ProductReviews productId={productDetail.id} className="px-4" />
        </ScrollView>
        {/* Action Buttons */}
        <View className="px-4 pt-4 border-t border-gray-100 bg-white">
          <View className="flex-row gap-3">
            {productDetail.limited_product &&
            currentDate >= new Date(productDetail.limited_product.availability_start_date) ? (
              <TouchableOpacity
                onPress={handleBuyNow}
                className="flex-1 bg-rose-500 rounded-xl py-4 items-center justify-center shadow-lg"
                activeOpacity={0.7}
                disabled={
                  Number(selectedVariant?.current_stock) > Number(selectedVariant?.max_stock)
                }
              >
                <Text className="text-white font-bold text-base">Buy Now</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handlePreOrder}
                className="flex-1 bg-rose-500 rounded-xl py-4 items-center justify-center shadow-lg"
                activeOpacity={0.7}
                disabled={
                  Number(selectedVariant?.pre_order_count) >
                  Number(selectedVariant?.pre_order_limit)
                }
              >
                <Text className="text-white font-bold text-base">Pre-order</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default LimitedProductDetails;
