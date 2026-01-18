import { useNotification } from "@/libs/hooks/useNotification";
import { useAppDispatch } from "@/libs/stores";
import { markAsReadOne } from "@/libs/stores/notificationManager/thunk";
import { Notification } from "@/libs/types/notification";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const getSeverityColor = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case "high":
    case "critical":
      return "text-red-800 bg-red-100 border-red-200";
    case "medium":
      return "text-yellow-800 bg-yellow-100 border-yellow-200";
    case "low":
      return "text-green-800 bg-green-100 border-green-200";
    default:
      return "text-gray-800 bg-gray-100 border-gray-200";
  }
};

const getTypeIcon = (type: string): keyof typeof MaterialIcons.glyphMap => {
  switch (type?.toLowerCase()) {
    case "push":
      return "notifications";
    case "email":
      return "email";
    case "sms":
      return "sms";
    case "order":
      return "shopping-bag";
    case "promotion":
      return "local-offer";
    case "system":
      return "settings";
    default:
      return "notifications";
  }
};

function NotificationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { notifications, loading } = useNotification();

  const notification: Notification | undefined = useMemo(() => {
    return notifications?.find((n: Notification) => n.id === id);
  }, [notifications, id]);

  useEffect(() => {
    if (notification && !notification.is_read) {
      dispatch(markAsReadOne(notification.id));
    }
  }, [notification, dispatch]);

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const createdDate = new Date(dateString);
    const diffInMs = now.getTime() - createdDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}H ago`;
    if (diffInDays < 7) return `${diffInDays}D ago`;
    return `${Math.floor(diffInDays / 7)}W ago`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading || !notification) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ff9fb2" />
          <Text className="text-gray-500 mt-2">Loading notification...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const title =
    typeof notification.content_data === "object" &&
    notification.content_data &&
    "title" in notification.content_data
      ? (notification.content_data as any).title
      : "Notification";

  const body =
    typeof notification.content_data === "object" &&
    notification.content_data &&
    "body" in notification.content_data
      ? (notification.content_data as any).body
      : typeof notification.content_data === "string"
        ? notification.content_data
        : "No content available.";

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header Card */}
        <View className="bg-white mx-4 mt-4 rounded-2xl shadow-sm overflow-hidden">
          <View
            className={`p-4 border-l-4 ${notification.is_read ? "border-l-green-500" : "border-l-red-500"}`}
          >
            {/* Icon and Type */}
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <View
                  className={`w-12 h-12 rounded-full items-center justify-center ${
                    notification.is_read ? "bg-green-100" : "bg-pink-100"
                  }`}
                >
                  <MaterialIcons
                    name={getTypeIcon(notification.type)}
                    size={24}
                    color={notification.is_read ? "#22c55e" : "#ff9fb2"}
                  />
                </View>
                <View className="ml-3">
                  <Text className="text-xs text-gray-500 uppercase tracking-wide">
                    B-Showsell System
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {getTimeAgo(notification.created_at)}
                  </Text>
                </View>
              </View>

              {/* Status Badges */}
              <View className="flex-row items-center gap-2">
                {notification.severity && (
                  <View
                    className={`px-3 py-1 rounded-full border ${getSeverityColor(notification.severity)}`}
                  >
                    <Text className="text-xs font-medium capitalize">{notification.severity}</Text>
                  </View>
                )}
                <View
                  className={`px-3 py-1 rounded-full border ${
                    notification.is_read
                      ? "bg-green-100 border-green-200"
                      : "bg-red-100 border-red-200"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      notification.is_read ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {notification.is_read ? "Read" : "Unread"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Title */}
            <Text className="text-xl font-bold text-gray-900 mb-2">{title}</Text>

            {/* Body */}
            <Text className="text-base text-gray-700 leading-6">{body}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Back Button */}
      <View className="px-4 py-4 bg-white border-t border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary py-4 rounded-xl flex-row items-center justify-center"
          activeOpacity={0.8}
        >
          <MaterialIcons name="arrow-back" size={20} color="white" />
          <Text className="text-white font-semibold text-base ml-2">Back to Notifications</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default NotificationDetailScreen;
