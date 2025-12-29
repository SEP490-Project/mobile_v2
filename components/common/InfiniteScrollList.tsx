import { LegendList } from "@legendapp/list";
import React, { useCallback, useRef } from "react";
import { RefreshControl, StyleProp, Text, View, ViewStyle } from "react-native";

interface InfiniteScrollListProps<T> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  keyExtractor: (item: T) => string;

  onLoadMore: () => void;
  onRefresh: () => void;

  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;

  contentContainerStyle?: StyleProp<ViewStyle>;
  showsVerticalScrollIndicator?: boolean;
  emptyText?: string;
  numColumns?: number;
}

export function InfiniteScrollList<T>({
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
  numColumns = 1,
}: InfiniteScrollListProps<T>) {
  const onEndReachedCalledDuringMomentum = useRef(true);

  const handleLoadMore = useCallback(() => {
    if (!hasMore) return;
    if (loading || refreshing) return;
    if (data.length === 0) return;
    if (onEndReachedCalledDuringMomentum.current) return;

    onEndReachedCalledDuringMomentum.current = true;
    onLoadMore();
  }, [hasMore, loading, refreshing, data.length, onLoadMore]);

  const renderEmpty = () => (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 80,
      }}
    >
      <Text style={{ color: "#6b7280", fontSize: 16 }}>{emptyText}</Text>
    </View>
  );

  return (
    <LegendList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.6}
      onMomentumScrollBegin={() => {
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
      ListEmptyComponent={renderEmpty()}
    />
  );
}
0;
