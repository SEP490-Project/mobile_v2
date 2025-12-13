import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const mockReviews = [
  {
    id: "1",
    userName: "Sarah Johnson",
    rating: 5,
    comment:
      "Amazing product! The quality is outstanding and it works perfectly. Highly recommend to everyone!",
    date: "2024-12-10",
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3hWAKJbiafXXZmeLtzx5QUKEHR-wt5dQfGg&s",
    ],
  },
  {
    id: "2",
    userName: "Michael Chen",
    rating: 4,
    comment: "Good value for money. The product meets my expectations and arrived quickly.",
    date: "2024-12-08",
    images: [],
  },
  {
    id: "3",
    userName: "Emma Davis",
    rating: 3,
    comment: "It's okay, nothing special but does the job. Could be better for the price point.",
    date: "2024-12-05",
    images: [],
  },
  {
    id: "4",
    userName: "James Wilson",
    rating: 2,
    comment: "Not as described. The quality could be much better. Disappointed with this purchase.",
    date: "2024-12-03",
    images: [],
  },
  {
    id: "5",
    userName: "Lisa Brown",
    rating: 5,
    comment:
      "Absolutely love this! Exceeded my expectations. The packaging was perfect and product quality is top-notch.",
    date: "2024-12-01",
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3hWAKJbiafXXZmeLtzx5QUKEHR-wt5dQfGg&s",
    ],
  },
];

interface ProductReviewsProps {
  productId: string;
  className?: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, className = "" }) => {
  const [reviewSortBy, setReviewSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">(
    "newest",
  );
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const getSortedReviews = () => {
    // TODO: Replace with API call using productId
    const sorted = [...mockReviews];
    switch (reviewSortBy) {
      case "newest":
        return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case "oldest":
        return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case "highest":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "lowest":
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted;
    }
  };

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
    // TODO: Calculate from actual reviews data
    return 4.0;
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
                { key: "newest", label: "Newest First" },
                { key: "oldest", label: "Oldest First" },
                { key: "highest", label: "Highest Rating" },
                { key: "lowest", label: "Lowest Rating" },
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
        <Text className="ml-auto text-gray-600 text-sm">({mockReviews.length} reviews)</Text>
      </View>

      {/* Reviews List */}
      <FlatList
        data={getSortedReviews()}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View className="mb-4 p-4 border border-gray-100 rounded-lg">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1">
                <Text className="font-semibold text-gray-800">{item.userName}</Text>
                <View className="flex-row items-center mt-1">
                  {renderStars(item.rating)}
                  <Text className="ml-2 text-gray-500 text-sm">
                    {new Date(item.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>

            <Text className="text-gray-700 mb-3">{item.comment}</Text>

            {item.images.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {item.images.map((imageUrl, index) => (
                  <Image
                    key={index}
                    source={{ uri: imageUrl }}
                    className="w-20 h-20 rounded-lg mr-2"
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            )}
          </View>
        )}
      />
    </View>
  );
};

export default ProductReviews;
