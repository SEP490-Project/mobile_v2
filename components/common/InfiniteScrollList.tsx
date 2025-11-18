import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from "react-native";

interface InfiniteScrollListProps<T> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  keyExtractor: (item: T) => string;
  onLoadMore: () => void;
  onRefresh: () => void;
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  contentContainerStyle?: object;
  showsVerticalScrollIndicator?: boolean;
  emptyText?: string;
}

export default function InfiniteScrollList<T>({
  data,
  renderItem,
  keyExtractor,
  onLoadMore,
  onRefresh,
  loading,
  refreshing,
  hasMore,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  emptyText = "No data available",
}: InfiniteScrollListProps<T>) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = useCallback(() => {
    if (!loading && !isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      onLoadMore();
      // Reset loading state after a short delay
      setTimeout(() => setIsLoadingMore(false), 1000);
    }
  }, [loading, isLoadingMore, hasMore, onLoadMore]);

  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color="#ff9fb2" />
          <Text className="text-gray-500 text-sm mt-2">Loading more...</Text>
        </View>
      );
    }
    if (!hasMore && data.length > 0) {
      return (
        <View className="py-4 items-center">
          <Text className="text-gray-500 text-sm">No more items to load</Text>
        </View>
      );
    }
    return null;
  };

  const renderEmpty = () => (
    <View className="flex-1 justify-center items-center py-20">
      <Text className="text-gray-500 text-lg">{emptyText}</Text>
    </View>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.3}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#ff9fb2"]}
          tintColor="#ff9fb2"
        />
      }
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
    />
  );
}
