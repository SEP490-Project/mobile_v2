import { RootState, useAppDispatch } from "@/libs/stores";
import { getReviewThunk } from "@/libs/stores/reviewManager/thunk";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { FlatList, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";

interface ProductReviewsProps {
  productId: string;
  className?: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, className = "" }) => {
  const dispatch = useAppDispatch();
  const [reviewSortBy, setReviewSortBy] = useState<"asc" | "desc">("asc");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const { reviews, loading } = useSelector((state: RootState) => state.manageReview);
  const reviewsData = reviews?.data || [];

  useEffect(() => {
    dispatch(getReviewThunk({ productId, params: { order_direction: reviewSortBy } }));
  }, [productId, dispatch, reviewSortBy]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <MaterialIcons
        key={index}
        name={index < rating ? "star" : "star-border"}
        size={16}
        color={index < rating ? "#F59E0B" : "#D1D5DB"}
      />
    ));
  };

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case "newest":
        return "Newest First";
      case "oldest":
        return "Oldest First";
      case "highest":
        return "Highest Rating";
      case "lowest":
        return "Lowest Rating";
      default:
        return "Newest First";
    }
  };

  const getAverageRating = () => {
    if (!reviewsData || reviewsData.length === 0) return 0;
    const total = reviewsData.reduce((sum, review) => sum + review.rating_stars, 0);
    return total / reviewsData.length;
  };

  return (
    <View className={`mt-6 border-t border-gray-100 pt-4 ${className}`}>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-gray-800 font-semibold text-lg">Customer Reviews</Text>

        {/* Sort Dropdown */}
        <View className="relative">
          <TouchableOpacity
            onPress={() => setShowSortDropdown(!showSortDropdown)}
            className="flex-row items-center bg-gray-50 px-3 py-2 rounded-lg"
          >
            <Text className="text-gray-600 text-sm mr-1">{getSortLabel(reviewSortBy)}</Text>
            <MaterialIcons
              name={showSortDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          {showSortDropdown && (
            <View className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-36">
              {[
                { key: "asc", label: "Oldest First" },
                { key: "desc", label: "Newest First" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => {
                    setReviewSortBy(option.key as any);
                    setShowSortDropdown(false);
                  }}
                  className={`px-3 py-2 ${reviewSortBy === option.key ? "bg-rose-50" : ""}`}
                >
                  <Text
                    className={`text-sm ${
                      reviewSortBy === option.key ? "text-rose-600 font-medium" : "text-gray-700"
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
      {/* Average Rating */}
      <View className="flex-row items-center mb-4 p-3 bg-gray-50 rounded-lg">
        <View className="flex-row items-center">
          {renderStars(Math.round(getAverageRating()))}
          <Text className="ml-2 text-gray-800 font-semibold">
            {getAverageRating().toFixed(1)} out of 5
          </Text>
        </View>
        <Text className="ml-auto text-gray-600 text-sm">({reviewsData?.length} reviews)</Text>
      </View>
      {loading ? (
        <View className="items-center justify-center py-10">
          <Text className="text-gray-500">Loading reviews...</Text>
        </View>
      ) : (
        <View>
          {/* Reviews List */}
          <FlatList
            data={reviewsData || []}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View className="mb-4 p-4 border border-gray-100 rounded-lg">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-row items-start justify-between w-full">
                    <View>
                      <Text className="font-semibold text-gray-800">{item.user_name}</Text>
                      <Text className="text-gray-500 text-sm w-[200px]">
                        {item.product_variant_name}
                      </Text>
                    </View>
                    <View>
                      <View className="flex-row items-center mt-1">
                        {renderStars(item.rating_stars)}
                      </View>
                      <Text className="ml-2 text-gray-500 text-sm">
                        {new Date(item.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text className="text-gray-700 mb-3">{item.comment}</Text>

                {item.assets_url ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Image
                      source={{ uri: item.assets_url }}
                      className="w-20 h-20 rounded-lg mr-2"
                      resizeMode="cover"
                    />
                  </ScrollView>
                ) : null}
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
};

export default ProductReviews;
