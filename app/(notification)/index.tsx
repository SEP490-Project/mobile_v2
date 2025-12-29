import { InfiniteScrollList } from "@/components/common/InfiniteScrollList";
import { useAuth } from "@/libs/hooks/useAuthen";
import { useNotification } from "@/libs/hooks/useNotification";
import { useAppDispatch } from "@/libs/stores";
import {
  getNotificationThunk,
  markAsReadAll,
  markAsReadOne,
} from "@/libs/stores/notificationManager/thunk";
import { Notifications } from "@/libs/types/notification";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function NotificationScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { notifications = [], loading = false, pagination = null } = useNotification();
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
        status: "SENT",
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
    if (loading) return;
    if (pagination.page >= pagination.total_pages) return;

    const nextPage = pagination.page + 1;
    await loadNotifications(nextPage, isReadFilter);
  }, [pagination, loading, loadNotifications, isReadFilter]);

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

  const handleMarkAllAsRead = useCallback(() => {
    Alert.alert("Mark All as Read", "Are you sure you want to mark all notifications as read?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Mark All",
        style: "default",
        onPress: async () => {
          try {
            await dispatch(markAsReadAll()).unwrap();
            await loadNotifications(1, isReadFilter, true);
          } catch (err) {
            console.warn("Mark all as read error:", err);
            Alert.alert("Error", "Failed to mark all notifications as read");
          }
        },
      },
    ]);
  }, [dispatch, loadNotifications, isReadFilter]);

  const handleNotificationPress = useCallback(
    async (item: Notifications) => {
      try {
        if (!item.is_read) {
          await dispatch(markAsReadOne(item.id)).unwrap();
        }

        router.push({ pathname: "/(notification)/[id]", params: { id: item.id } });
      } catch (err) {
        console.warn("Mark as read error:", err);
        router.push({ pathname: "/(notification)/[id]", params: { id: item.id } });
      }
    },
    [dispatch, router],
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-4 border-b border-gray-100 shadow-sm">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xl font-bold text-gray-900">Notifications</Text>
          <TouchableOpacity
            onPress={handleMarkAllAsRead}
            className="bg-blue-500 px-4 py-2 rounded-lg flex-row items-center"
          >
            <MaterialIcons name="done-all" size={16} color="white" />
            <Text className="text-white text-sm font-medium ml-1">Mark All Read</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row flex-wrap gap-2 mb-3">
          <TouchableOpacity
            onPress={toggleUnreadFilter}
            className={`px-4 py-2 rounded-full flex-row items-center ${
              isReadFilter === false ? "bg-red-500" : "bg-gray-100"
            }`}
          >
            <MaterialIcons
              name="circle"
              size={12}
              color={isReadFilter === false ? "white" : "#EF4444"}
            />
            <Text
              className={`text-sm font-medium ml-1 ${
                isReadFilter === false ? "text-white" : "text-gray-700"
              }`}
            >
              Unread
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleReadFilter}
            className={`px-4 py-2 rounded-full flex-row items-center ${
              isReadFilter === true ? "bg-green-500" : "bg-gray-100"
            }`}
          >
            <MaterialIcons
              name="check-circle"
              size={12}
              color={isReadFilter === true ? "white" : "#10B981"}
            />
            <Text
              className={`text-sm font-medium ml-1 ${
                isReadFilter === true ? "text-white" : "text-gray-700"
              }`}
            >
              Read
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-end gap-3">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-2">Start Date</Text>
            <TouchableOpacity
              onPress={() => setShowStartPicker(true)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 flex-row items-center"
            >
              <MaterialIcons name="calendar-today" size={18} color="#6B7280" />
              <Text className="text-sm text-gray-700 ml-2 flex-1">
                {startDate || "Select start date"}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-2">End Date</Text>
            <TouchableOpacity
              onPress={() => setShowEndPicker(true)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 flex-row items-center"
            >
              <MaterialIcons name="calendar-today" size={18} color="#6B7280" />
              <Text className="text-sm text-gray-700 ml-2 flex-1">
                {endDate || "Select end date"}
              </Text>
            </TouchableOpacity>
          </View>

          {(startDate || endDate) && (
            <TouchableOpacity
              onPress={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="bg-red-100 border border-red-200 rounded-lg p-3"
            >
              <MaterialIcons name="clear" size={20} color="#EF4444" />
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
        refreshing={refreshing}
        hasMore={pagination ? pagination.page < pagination.total_pages : false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        emptyText="No notifications found"
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleNotificationPress(item)}
            activeOpacity={0.8}
            className="mb-3"
          >
            <View
              className={`bg-white rounded-2xl shadow-sm border-l-4 overflow-hidden ${
                item.is_read ? "border-l-gray-300 bg-white" : "border-l-red-500 bg-red-50"
              }`}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <View className="p-4">
                <View className="flex-row items-start">
                  <View className="mr-3 mt-1">
                    {item.is_read ? (
                      <View className="w-3 h-3 rounded-full bg-gray-300" />
                    ) : (
                      <View className="w-3 h-3 rounded-full bg-red-500">
                        <View className="w-full h-full rounded-full bg-red-400 animate-pulse" />
                      </View>
                    )}
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-start justify-between mb-2">
                      <Text
                        className={`text-base font-semibold flex-1 mr-2 ${
                          item.is_read ? "text-gray-700" : "text-gray-900"
                        }`}
                        numberOfLines={2}
                      >
                        {typeof item.content_data === "object" &&
                        item.content_data &&
                        "title" in (item.content_data as any)
                          ? (item.content_data as any).title
                          : typeof item.content_data === "string"
                            ? item.content_data
                            : JSON.stringify(item.content_data)}
                      </Text>

                      <View
                        className={`px-2 py-1 rounded-full ${
                          item.is_read
                            ? "bg-gray-100 border border-gray-200"
                            : "bg-red-100 border border-red-200"
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            item.is_read ? "text-gray-600" : "text-red-700"
                          }`}
                        >
                          {item.is_read ? "Read" : "New"}
                        </Text>
                      </View>
                    </View>

                    <Text
                      className={`text-sm mb-3 leading-5 ${
                        item.is_read ? "text-gray-500" : "text-gray-700"
                      }`}
                      numberOfLines={3}
                    >
                      {typeof item.content_data === "object" &&
                      item.content_data &&
                      "body" in (item.content_data as any)
                        ? (item.content_data as any).body
                        : typeof item.content_data === "string"
                          ? item.content_data
                          : "No content available."}
                    </Text>

                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <MaterialIcons
                          name="access-time"
                          size={16}
                          color={item.is_read ? "#9CA3AF" : "#6B7280"}
                        />
                        <Text
                          className={`text-xs ml-1 ${
                            item.is_read ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {getTimeAgo(item.created_at)}
                        </Text>
                      </View>

                      <MaterialIcons
                        name="chevron-right"
                        size={20}
                        color={item.is_read ? "#D1D5DB" : "#9CA3AF"}
                      />
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
