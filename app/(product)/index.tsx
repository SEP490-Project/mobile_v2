import { InfiniteScrollList } from "@/components/common/InfiniteScrollList";
import { ProductCard } from "@/components/ui";
import { RootState, useAppDispatch } from "@/libs/stores";
import { getFilteredProductsThunk } from "@/libs/stores/productManager/thunk";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const ProductScreen = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [limit] = useState(6);

  const { filteredProducts, loadingFiltered, pagination } = useSelector(
    (state: RootState) => state.manageProducts,
  );
  const cartItems = useSelector((state: RootState) => state.manageCart.items);
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const { type, category } = useLocalSearchParams();

  const productData: any[] = filteredProducts || [];
  const currentDate = new Date();

  const loadData = useCallback(
    async (pageNum = 1, searchType = type, searchCategory = category) => {
      try {
        await dispatch(
          getFilteredProductsThunk({
            category_id: searchCategory as string,
            type: searchType as string,
            page: pageNum,
            limit,
          }),
        ).unwrap();
      } catch (error) {
        console.warn("Load data error:", error);
      }
    },
    [dispatch, limit, type, category],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData(1);
    setRefreshing(false);
  }, [loadData]);

  const handleLoadMore = useCallback(async () => {
    if (!pagination) return;
    if (loadingFiltered) return;
    if (pagination.page >= pagination.total_pages) return;

    const nextPage = pagination.page + 1;
    await loadData(nextPage);
  }, [pagination, loadingFiltered, loadData]);

  // const nextPage = pagination.page + 1;
  // await loadContents(nextPage, searchQuery);

  useFocusEffect(
    useCallback(() => {
      loadData(1);
    }, [loadData]),
  );

  const filterLimitedProducts = productData.filter(
    (item: any) =>
      item.type === "LIMITED" &&
      (!item.limited_product?.premiere_date ||
        (currentDate >= new Date(item.limited_product?.premiere_date || "") &&
          currentDate <= new Date(item.limited_product.availability_end_date))),
  );

  if (loadingFiltered) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#ff9fb2" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 bg-gray-50 rounded-full"
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-3xl font-extrabold text-primary">B-ShowSell</Text>
        </View>
        <View className="flex-row gap-3">
          <TouchableOpacity className="p-2 bg-gray-100 rounded-full">
            <MaterialIcons name="search" size={24} color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity
            className="p-2 bg-gray-50 rounded-full"
            activeOpacity={0.7}
            onPress={() => router.push("/(cart)")}
          >
            <MaterialIcons name="shopping-cart" size={24} color="#374151" />
            {cartItemCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-rose-500 rounded-full w-5 h-5 items-center justify-center">
                <Text className="text-white text-xs font-bold">
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View> */}

      <InfiniteScrollList
        data={type === "LIMITED" ? filterLimitedProducts : productData}
        keyExtractor={(item: any) => item.id}
        numColumns={2}
        onLoadMore={handleLoadMore}
        onRefresh={handleRefresh}
        loading={loadingFiltered}
        refreshing={refreshing}
        hasMore={pagination ? pagination.page < pagination.total_pages : false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 12 }}
        emptyText="No products found"
        renderItem={({ item }: { item: any }) => (
          <View className="mb-4">
            <ProductCard
              product={item}
              onPress={() =>
                router.push({ pathname: "/(product)/[product]", params: { product: item.id } })
              }
            />
          </View>
        )}
      />
    </View>
  );
};

export default ProductScreen;
