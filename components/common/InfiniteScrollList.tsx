// components/common/InfiniteScrollList.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from "react-native";

interface InfiniteScrollListProps<T> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  keyExtractor: (item: T) => string;
  onLoadMore: () => void;
  onRefresh: () => void;
  loading: boolean; // initial or general loading
  loadingMore?: boolean; // optional explicit loading-more flag
  refreshing: boolean;
  hasMore: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
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
  loadingMore,
  refreshing,
  hasMore,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  emptyText = "No data available",
}: InfiniteScrollListProps<T>) {
  // guard multiple onEndReached during momentum
  const onEndReachedCalledDuringMomentum = useRef(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Sync local isLoadingMore with explicit prop (preferred) or fallback to loading + data
  useEffect(() => {
    if (typeof loadingMore === "boolean") {
      setIsLoadingMore(loadingMore);
    } else {
      // when loading true but we already have data, treat as loading more
      setIsLoadingMore(!!(loading && data && data.length > 0));
    }
  }, [loadingMore, loading, data?.length]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore) return;
    if (isLoadingMore) return;
    if (loading) return; // another fetch in progress
    if (refreshing) return;
    if (data.length === 0) return;

    // momentum guard
    if (onEndReachedCalledDuringMomentum.current) return;

    onEndReachedCalledDuringMomentum.current = true;
    setIsLoadingMore(true);
    onLoadMore();
    // Do not unset isLoadingMore here — wait for prop change (loadingMore/loading)
  }, [hasMore, isLoadingMore, loading, refreshing, data.length, onLoadMore]);

  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View style={{ paddingVertical: 16, alignItems: "center" }}>
          <ActivityIndicator size="small" color="#ff9fb2" />
          <Text style={{ color: "#6b7280", marginTop: 8 }}>Loading more...</Text>
        </View>
      );
    }
    if (!hasMore && data.length > 0) {
      return (
        <View style={{ paddingVertical: 16, alignItems: "center" }}>
          <Text style={{ color: "#6b7280" }}>No more items to load</Text>
        </View>
      );
    }
    return null;
  };

  const renderEmpty = () => (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 80 }}>
      <Text style={{ color: "#6b7280", fontSize: 16 }}>{emptyText}</Text>
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
      onMomentumScrollBegin={() => {
        // allow next onEndReached
        onEndReachedCalledDuringMomentum.current = false;
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#ff9fb2"]}
          tintColor="#ff9fb2"
        />
      }
      ListFooterComponent={renderFooter()}
      ListEmptyComponent={renderEmpty()}
    />
  );
}
