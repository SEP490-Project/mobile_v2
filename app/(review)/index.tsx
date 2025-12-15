import { RootState, useAppDispatch } from "@/libs/stores";
import { createReviewThunk } from "@/libs/stores/reviewManager/thunk";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
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

const ReviewScreen = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { referenceId, orderType, productName, imageUrl } = useLocalSearchParams();

  const { loading } = useSelector((state: RootState) => state.manageReview);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please grant permission to access your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      Alert.alert("Error", "Please write a comment for your review.");
      return;
    }

    const formData = new FormData();
    formData.append("reference_id", referenceId as string);
    formData.append("order_type", orderType as string);
    formData.append("rating", rating.toString());
    formData.append("comment", comment);

    if (selectedImage) {
      const imageFile = {
        uri: selectedImage.uri,
        name: selectedImage.fileName || `review_${Date.now()}.jpg`,
        type: selectedImage.mimeType || "image/jpeg",
      } as any;
      formData.append("assets", imageFile);
    }

    const result = await dispatch(createReviewThunk(formData));

    if (createReviewThunk.fulfilled.match(result)) {
      Alert.alert("Success", "Your review has been submitted successfully.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } else {
      const errorMessage = result.payload as any;
      Alert.alert("Error", errorMessage || "Failed to submit review. Please try again.");
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
        <Text className="text-xl font-bold text-gray-900">Write a Review</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Product Info */}
        <View className="bg-white px-4 py-4 mb-2">
          <Text className="text-base text-gray-600 mb-2">Reviewing:</Text>
          <View className="flex-row items-center gap-2">
            {imageUrl ? (
              <View className="w-20 h-20 bg-gray-100 rounded-2xl items-center justify-center">
                <Image
                  source={{ uri: imageUrl as string }}
                  style={{ width: 64, height: 64, borderRadius: 12 }}
                />
              </View>
            ) : null}
            <Text className="text-lg font-semibold text-gray-800">{productName}</Text>
          </View>
        </View>

        {/* Rating Section */}
        <View className="bg-white px-4 py-4 mb-2">
          <Text className="text-base font-semibold text-gray-800 mb-3">Rating</Text>
          <View className="flex-row justify-center items-center gap-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                <MaterialIcons
                  name={star <= rating ? "star" : "star-border"}
                  size={40}
                  color={star <= rating ? "#FFD700" : "#D1D5DB"}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text className="text-center text-gray-600 mt-2">
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent"}
          </Text>
        </View>

        {/* Comment Section */}
        <View className="bg-white px-4 py-4 mb-2">
          <Text className="text-base font-semibold text-gray-800 mb-3">Your Review</Text>
          <TextInput
            className="bg-gray-50 rounded-lg p-3 text-gray-800 min-h-32 border border-gray-200"
            placeholder="Share your experience with this product..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={comment}
            onChangeText={setComment}
          />
        </View>

        {/* Image Upload Section */}
        <View className="bg-white px-4 py-4 mb-2">
          <Text className="text-base font-semibold text-gray-800 mb-3">Add Photo (Optional)</Text>
          {selectedImage ? (
            <View className="relative">
              <Image
                source={{ uri: selectedImage.uri }}
                className="w-full h-64 rounded-lg"
                resizeMode="cover"
              />
              <TouchableOpacity
                className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
                onPress={() => setSelectedImage(null)}
              >
                <MaterialIcons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              className="border-2 border-dashed border-gray-300 rounded-lg py-12 items-center justify-center bg-gray-50"
              onPress={handlePickImage}
              activeOpacity={0.7}
            >
              <MaterialIcons name="add-photo-alternate" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-2">Tap to add a photo</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View className="bg-white px-4 py-3 border-t border-gray-200">
        <TouchableOpacity
          className="bg-primary rounded-lg py-4 items-center"
          onPress={handleSubmitReview}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Submit Review</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ReviewScreen;
