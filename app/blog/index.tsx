import InfiniteScrollList from "@/components/common/InfiniteScrollList";
import { useContent } from "@/libs/hooks/useContent";
import { useAppDispatch } from "@/libs/stores";
import { getAllContents } from "@/libs/stores/contentManager/thunk";
import { ListContent } from "@/libs/types/content";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Component ---
function BlogsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { contents, loading, pagination } = useContent();
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate time ago from created_at
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

  const loadContents = useCallback(
    (page: number = 1, search: string = "", isRefresh: boolean = false) => {
      const filter = {
        page,
        limit: 10,
        sort_by: "created_at",
        sort_order: "desc" as const,
        ...(search && { search }),
        // You can add from_date and to_date filters here if needed
        // from_date: "2024-01-01",
        // to_date: "2024-12-31",
      };

      dispatch(getAllContents(filter));
      if (!isRefresh) {
        setCurrentPage(page);
      }
    },
    [dispatch],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await loadContents(1, searchQuery, true);
    setRefreshing(false);
  }, [loadContents, searchQuery]);

  const handleLoadMore = useCallback(() => {
    if (pagination && pagination.page < pagination.total_pages) {
      const nextPage = currentPage + 1;
      loadContents(nextPage, searchQuery);
    }
  }, [pagination, currentPage, loadContents, searchQuery]);

  const handleSearch = useCallback(() => {
    setSearchQuery(searchText);
    setCurrentPage(1);
    loadContents(1, searchText);
  }, [searchText, loadContents]);

  useFocusEffect(
    useCallback(() => {
      loadContents(1, searchQuery);
    }, [loadContents, searchQuery]),
  );
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-100">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-2xl font-extrabold text-gray-900">Beauty Blogs</Text>
          <TouchableOpacity className="p-2 bg-gray-100 rounded-full">
            <MaterialIcons name="notifications-none" size={22} color="#4B5563" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-50 rounded-lg px-3 py-2">
          <MaterialIcons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-gray-700"
            placeholder="Search blogs..."
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchText("");
                setSearchQuery("");
                setCurrentPage(1);
                loadContents(1, "");
              }}
            >
              <MaterialIcons name="clear" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content List */}
      <InfiniteScrollList<ListContent>
        data={contents || []}
        keyExtractor={(item) => item.id}
        onLoadMore={handleLoadMore}
        onRefresh={handleRefresh}
        loading={loading}
        refreshing={refreshing}
        hasMore={pagination ? pagination.page < pagination.total_pages : false}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        emptyText="No blogs found"
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push({ pathname: "/blog/[id]", params: { id: item.id } })}
            activeOpacity={0.7}
          >
            <View className="bg-white mb-4 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <Image
                source={{ uri: item.thumbnail_url || "https://via.placeholder.com/400x200" }}
                className="w-full h-48"
                resizeMode="cover"
              />
              <View className="p-4">
                <Text className="text-lg font-bold text-gray-800 mb-1" numberOfLines={2}>
                  {item.title}
                </Text>
                {item.blog?.excerpt && (
                  <Text className="text-gray-500 text-sm mb-3" numberOfLines={2}>
                    {item.blog.excerpt}
                  </Text>
                )}
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <MaterialIcons name="access-time" size={16} color="#9CA3AF" />
                    <Text className="text-gray-500 text-sm ml-1">
                      {getTimeAgo(item.created_at)}
                    </Text>
                  </View>
                  {item.blog?.read_time && (
                    <View className="flex-row items-center">
                      <MaterialIcons name="menu-book" size={16} color="#9CA3AF" />
                      <Text className="text-gray-500 text-sm ml-1">
                        {item.blog.read_time} min read
                      </Text>
                    </View>
                  )}
                </View>
                {item.blog?.tags && item.blog.tags.length > 0 && (
                  <View className="flex-row flex-wrap mt-2">
                    {item.blog.tags.slice(0, 3).map((tag, index) => (
                      <View key={index} className="bg-rose-100 px-2 py-1 rounded-full mr-1 mb-1">
                        <Text className="text-rose-600 text-xs">{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

export default BlogsScreen;
