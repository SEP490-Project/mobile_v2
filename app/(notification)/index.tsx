import InfiniteScrollList from "@/components/common/InfiniteScrollList";
import { useAuth } from "@/libs/hooks/useAuthen";
import { useNotification } from "@/libs/hooks/useNotification";
import { useAppDispatch } from "@/libs/stores";
import { getNotificationThunk } from "@/libs/stores/notificationManager/thunk";
import { Notifications } from "@/libs/types/notification";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function NotificationScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    notifications = [],
    loading = false,
    loadingMore = false,
    pagination = null,
  } = useNotification();
  const [refreshing, setRefreshing] = useState(false);
  const [isReadFilter, setIsReadFilter] = useState<boolean | undefined>(undefined);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const { user } = useAuth();

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

  const loadNotifications = useCallback(
    async (page: number = 1, readFilter?: boolean | undefined, isRefresh: boolean = false) => {
      const filter: any = {
        page,
        limit: 10,
        user_id: user?.id,
        type: "PUSH",
      };

      if (readFilter !== undefined) {
        filter.is_read = readFilter;
      }

      if (startDate) {
        filter.start_date = startDate;
      }

      if (endDate) {
        filter.end_date = endDate;
      }

      try {
        await dispatch(getNotificationThunk(filter)).unwrap?.();
      } catch (err) {
        console.warn("Load notifications error:", err);
      }
    },
    [dispatch, user?.id, startDate, endDate],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications(1, isReadFilter, true);
    setRefreshing(false);
  }, [loadNotifications, isReadFilter]);

  const handleLoadMore = useCallback(async () => {
    if (!pagination) return;
    if (loading || loadingMore) return;
    if (pagination.page >= pagination.total_pages) return;

    const nextPage = pagination.page + 1;
    await loadNotifications(nextPage, isReadFilter);
  }, [pagination, loading, loadingMore, loadNotifications, isReadFilter]);

  useFocusEffect(
    useCallback(() => {
      loadNotifications(1, isReadFilter);
    }, [loadNotifications, isReadFilter]),
  );

  const toggleUnreadFilter = useCallback(() => {
    const next = isReadFilter === false ? undefined : false;
    setIsReadFilter(next);
    loadNotifications(1, next);
  }, [isReadFilter, loadNotifications]);

  const toggleReadFilter = useCallback(() => {
    const next = isReadFilter === true ? undefined : true;
    setIsReadFilter(next);
    loadNotifications(1, next);
  }, [isReadFilter, loadNotifications]);

  const handleStartDateChange = useCallback((event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowStartPicker(false);
    }
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split("T")[0];
      setStartDate(dateStr);
    }
  }, []);

  const handleEndDateChange = useCallback((event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowEndPicker(false);
    }
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split("T")[0];
      setEndDate(dateStr);
    }
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-3 border-b border-gray-100">
        <View className="flex-row flex-wrap gap-2 mb-2">
          <TouchableOpacity
            onPress={toggleUnreadFilter}
            className={`px-3 py-1.5 rounded-full ${isReadFilter === false ? "bg-rose-500" : "bg-gray-100"}`}
          >
            <Text className={`text-xs ${isReadFilter === false ? "text-white" : "text-gray-700"}`}>
              Unread
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleReadFilter}
            className={`px-3 py-1.5 rounded-full ${isReadFilter === true ? "bg-rose-500" : "bg-gray-100"}`}
          >
            <Text className={`text-xs ${isReadFilter === true ? "text-white" : "text-gray-700"}`}>
              Read
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center gap-2">
          <View className="flex-1">
            <Text className="text-xs text-gray-600 mb-1">Start Date</Text>
            <TouchableOpacity
              onPress={() => setShowStartPicker(true)}
              className="bg-gray-50 rounded-lg px-3 py-2 flex-row items-center"
            >
              <MaterialIcons name="calendar-today" size={16} color="#6B7280" />
              <Text className="text-xs text-gray-700 ml-2">{startDate || "Select date"}</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1">
            <Text className="text-xs text-gray-600 mb-1">End Date</Text>
            <TouchableOpacity
              onPress={() => setShowEndPicker(true)}
              className="bg-gray-50 rounded-lg px-3 py-2 flex-row items-center"
            >
              <MaterialIcons name="calendar-today" size={16} color="#6B7280" />
              <Text className="text-xs text-gray-700 ml-2">{endDate || "Select date"}</Text>
            </TouchableOpacity>
          </View>

          {(startDate || endDate) && (
            <TouchableOpacity
              onPress={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="bg-gray-100 rounded-lg p-2 mt-4"
            >
              <MaterialIcons name="clear" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showStartPicker && (
        <DateTimePicker
          value={startDate ? new Date(startDate) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleStartDateChange}
          maximumDate={new Date()}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate ? new Date(endDate) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleEndDateChange}
          maximumDate={new Date()}
          minimumDate={startDate ? new Date(startDate) : undefined}
        />
      )}

      <InfiniteScrollList<Notifications>
        data={notifications || []}
        keyExtractor={(item) => item.id}
        onLoadMore={handleLoadMore}
        onRefresh={handleRefresh}
        loading={loading}
        loadingMore={loadingMore}
        refreshing={refreshing}
        hasMore={pagination ? pagination.page < pagination.total_pages : false}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        emptyText="No notifications found"
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({ pathname: "/(notification)/[id]", params: { id: item.id } })
            }
            activeOpacity={0.7}
          >
            <View
              className={`bg-white mb-3 rounded-xl shadow-sm border overflow-hidden ${
                item.status === "unread" ? "border-rose-200 bg-rose-50" : "border-gray-100"
              }`}
            >
              <View className="p-4">
                <View className="flex-row items-start">
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text
                        className="text-base font-semibold text-gray-800 flex-1"
                        numberOfLines={2}
                      >
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)} Notification
                      </Text>
                      <View className={`px-2 py-0.5 rounded-full ml-2`}>
                        <Text className="text-xs font-medium">{item.status}</Text>
                      </View>
                    </View>

                    <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
                      {typeof item.content_data === "string"
                        ? item.content_data
                        : JSON.stringify(item.content_data)}
                    </Text>

                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <MaterialIcons name="access-time" size={14} color="#9CA3AF" />
                        <Text className="text-gray-500 text-xs ml-1">
                          {getTimeAgo(item.created_at)}
                        </Text>
                      </View>
                      {item.delivery_attempts && item.delivery_attempts.length > 0 && (
                        <Text className="text-gray-500 text-xs">
                          {item.delivery_attempts.length} attempt(s)
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

export default NotificationScreen;
