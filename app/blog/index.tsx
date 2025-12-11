import InfiniteScrollList from "@/components/common/InfiniteScrollList";
import { useContent } from "@/libs/hooks/useContent";
import { useAppDispatch } from "@/libs/stores";
import { getAllContents } from "@/libs/stores/contentManager/thunk";
import type { ListContent } from "@/libs/types/content";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Animated, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { setSearchToggleListener } from "./_layout";

function BlogsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { contents = [], loading = false, loadingMore = false, pagination = null } = useContent();

  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchAnimation] = useState(new Animated.Value(0));

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
    async (page: number = 1, search: string = "") => {
      const filter: any = {
        page,
        limit: 5,
        sort_by: "created_at",
        sort_order: "desc",
      };
      if (search) filter.search = search;

      try {
        await dispatch(getAllContents(filter)).unwrap?.();
      } catch (err) {
        console.warn("Load contents error:", err);
      }
    },
    [dispatch],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadContents(1, searchQuery);
    setRefreshing(false);
  }, [loadContents, searchQuery]);

  const handleLoadMore = useCallback(async () => {
    if (!pagination) return;
    if (loading || loadingMore) return;
    if (pagination.page >= pagination.total_pages) return;

    const nextPage = pagination.page + 1;
    await loadContents(nextPage, searchQuery);
  }, [pagination, loading, loadingMore, loadContents, searchQuery]);

  const handleSearch = useCallback(() => {
    setSearchQuery(searchText);
    loadContents(1, searchText);
  }, [searchText, loadContents]);

  const toggleSearch = useCallback(() => {
    const toValue = showSearch ? 0 : 1;
    setShowSearch(!showSearch);

    Animated.timing(searchAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showSearch, searchAnimation]);

  useEffect(() => {
    // Set up the search toggle listener
    setSearchToggleListener(toggleSearch);

    // Cleanup on unmount
    return () => {
      setSearchToggleListener(() => {});
    };
  }, [toggleSearch]);

  useFocusEffect(
    useCallback(() => {
      loadContents(1, searchQuery);
    }, [loadContents, searchQuery]),
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Floating Search Bar */}
      {showSearch && (
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            transform: [
              {
                translateY: searchAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-100, 0],
                }),
              },
            ],
            opacity: searchAnimation,
          }}
          className="bg-white shadow-lg border-b border-gray-200"
        >
          <View className="px-4 py-3">
            <View className="flex-row items-center bg-gray-50 rounded-lg px-3 py-2">
              <MaterialIcons name="search" size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-2 text-gray-700"
                placeholder="Search blogs..."
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                autoFocus={showSearch}
              />
              <TouchableOpacity
                onPress={() => {
                  if (searchText.length > 0) {
                    // Clear search text and reset results
                    setSearchText("");
                    setSearchQuery("");
                    loadContents(1, "");
                  } else {
                    // Close search bar if no text
                    toggleSearch();
                  }
                }}
                className="ml-2"
              >
                <MaterialIcons
                  name={searchText.length > 0 ? "clear" : "close"}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
              <TouchableOpacity className="ml-2">
                <MaterialIcons name="mic" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      <InfiniteScrollList<ListContent>
        data={contents || []}
        keyExtractor={(item) => item.id}
        onLoadMore={handleLoadMore}
        onRefresh={handleRefresh}
        loading={loading}
        loadingMore={loadingMore}
        refreshing={refreshing}
        hasMore={pagination ? pagination.page < pagination.total_pages : false}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        emptyText="No blogs found"
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push({ pathname: "/blog/[id]", params: { id: item.id } })}
            activeOpacity={0.7}
            className="mb-3"
          >
            <View className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
              <Image
                source={{ uri: item.thumbnail_url || "https://via.placeholder.com/400x200" }}
                className="w-full h-48"
                resizeMode="cover"
              />
              <View className="p-3">
                <Text className="text-lg font-bold text-gray-800 mb-1" numberOfLines={2}>
                  {item.title}
                </Text>

                {item.blog?.excerpt && (
                  <Text className="text-gray-500 text-sm mb-2" numberOfLines={2}>
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
                  <View className="flex-row flex-wrap mt-3">
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
