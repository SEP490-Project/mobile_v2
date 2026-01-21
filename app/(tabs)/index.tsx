import { convertNumberToVND } from "@/libs/helper/currency-helper";
import { useContent } from "@/libs/hooks/useContent";
import { RootState, useAppDispatch } from "@/libs/stores";
import { getAllCategoriesThunk } from "@/libs/stores/categoryManager/thunk";
import { getAllContents } from "@/libs/stores/contentManager/thunk";
import {
  getAllLimitedProductsThunk,
  getAllStandardProductsThunk,
} from "@/libs/stores/productManager/thunk";
import { Category } from "@/libs/types/category";
import { ListContent } from "@/libs/types/content";
import { Product } from "@/libs/types/product";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { MotiView } from "moti";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

const notfound300x200 = require("@/assets/images/not-found/300x200.png");

// --- Category Item ---
function CategoryItem({
  name,
  icon,
  categoryId,
  router,
}: {
  name: string;
  icon: string;
  categoryId: string;
  router: any;
}) {
  return (
    <TouchableOpacity
      className="items-center mr-4"
      onPress={() => {
        router.push({ pathname: "(product)", params: { category: categoryId } });
      }}
    >
      <View className="h-16 w-16 flex items-center justify-center bg-rose-50 border border-rose-100 p-3 rounded-full mb-1">
        <MaterialIcons name={icon as any} size={24} color="#F43F5E" />
      </View>
      <Text className="text-gray-600 text-xs font-medium">{name}</Text>
    </TouchableOpacity>
  );
}

// --- Section Item ---
function Section({
  title,
  products,
  delay = 0,
  router,
  type,
}: {
  title: string;
  products: Product[];
  delay?: number;
  router: any;
  type: "STANDARD" | "LIMITED";
}) {
  // Get price from the first variant or default variant
  const getProductPrice = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return 0;
    const defaultVariant = product.variants.find((v) => v.is_default);
    return defaultVariant?.price || product.variants[0].price;
  };

  if (products.length === 0) {
    return (
      <View className="mt-6">
        <View className="flex-row justify-between items-center px-4 mb-3">
          <Text className="text-xl font-bold text-gray-800">{title}</Text>
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => router.push({ pathname: "(product)", params: { type } })}
          >
            <Text className="text-rose-500 font-medium mr-1">See all</Text>
            <MaterialIcons name="chevron-right" size={20} color="#F43F5E" />
          </TouchableOpacity>
        </View>
        <View className="mx-4 py-8 bg-rose-50 rounded-2xl border border-rose-100 items-center">
          <View className="w-16 h-16 bg-white rounded-full items-center justify-center mb-3 shadow-sm">
            <MaterialIcons name="inventory-2" size={32} color="#FDA4AF" />
          </View>
          <Text className="text-gray-700 font-semibold text-base mb-1">No Products Yet</Text>
          <Text className="text-gray-400 text-sm text-center px-6">
            {type === "LIMITED"
              ? "Stay tuned for exclusive limited edition releases!"
              : "New products are coming soon. Check back later!"}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mt-6">
      <View className="flex-row justify-between items-center px-4 mb-3">
        <Text className="text-xl font-bold text-gray-800">{title}</Text>
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => router.push({ pathname: "(product)", params: { type } })}
        >
          <Text className="text-rose-500 font-medium mr-1">See all</Text>
          <MaterialIcons name="chevron-right" size={20} color="#F43F5E" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item, index }) => {
          return (
            <MotiView
              from={{ opacity: 0, translateY: 15 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: delay + index * 120, type: "timing" }}
              className="bg-white rounded-xl p-3 mr-4 border border-gray-100 shadow-sm w-44"
            >
              <TouchableOpacity
                onPress={() =>
                  router.push({ pathname: "/(product)/[product]", params: { product: item.id } })
                }
                className="relative"
              >
                <Image
                  source={{ uri: item.thumbnail_url?.[0] }}
                  className="w-full h-40 rounded-lg mb-3"
                />
                <Text numberOfLines={1} className="font-semibold text-gray-800 text-base">
                  {item.name}
                </Text>
                {item.brand_name && (
                  <View className="flex-row items-center my-1">
                    <MaterialIcons name="business" size={18} color="#9CA3AF" />
                    <Text className=" text-gray-600text-sm ml-1">{item.brand_name}</Text>
                  </View>
                )}
                <Text className="text-rose-600 font-bold text-lg mt-1">
                  {convertNumberToVND(getProductPrice(item))}
                </Text>
                {type === "LIMITED" && (
                  <View className="absolute top-2 right-2 bg-rose-500 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-bold">LIMITED</Text>
                  </View>
                )}
              </TouchableOpacity>
            </MotiView>
          );
        }}
      />
    </View>
  );
}

// --- HomeScreen ---
function HomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = React.useState(false);

  const { loadingLimited, loadingStandard, allLimitedProducts, allStandardProducts } = useSelector(
    (state: RootState) => state.manageProducts,
  );
  const { loading: categoriesLoading, categories } = useSelector(
    (state: RootState) => state.manageCategories,
  );
  const { contents } = useContent();

  const standardProductsData: Product[] = allStandardProducts?.data || [];
  const limitedProductsData: Product[] = allLimitedProducts?.data || [];
  const categoriesData: Category[] = categories?.data || [];

  const parentCategories = categoriesData.filter((item) => !item.parent_category);
  const currentDate = new Date();

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(getAllLimitedProductsThunk({ limit: 5 })),
        dispatch(getAllStandardProductsThunk({ limit: 5 })),

        dispatch(getAllCategoriesThunk()).unwrap(),
        dispatch(
          getAllContents({
            page: 1,
            limit: 5,
            sort_by: "created_at",
            sort_order: "desc",
          }),
        ).unwrap(),
      ]);
    } catch (error) {
      console.warn("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(getAllLimitedProductsThunk({ limit: 5 }));
      dispatch(getAllStandardProductsThunk({ limit: 5 }));

      dispatch(getAllCategoriesThunk());
      dispatch(
        getAllContents({
          page: 1,
          limit: 5,
          sort_by: "created_at",
          sort_order: "desc",
        }),
      );
    }, [dispatch]),
  );

  if (loadingLimited && loadingStandard && categoriesLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#ff9fb2" />
      </View>
    );
  }

  const filterLimitedProducts = limitedProductsData.filter(
    (item) =>
      item.type === "LIMITED" &&
      (!item.limited_product?.premiere_date ||
        (currentDate >= new Date(item.limited_product?.premiere_date || "") &&
          currentDate <= new Date(item.limited_product.availability_end_date))),
  );

  return (
    <ScrollView
      className="flex-1 bg-white"
      // style={{ paddingTop: insets.top + 10 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#ff9fb2"]}
          tintColor="#ff9fb2"
        />
      }
    >
      {/* Categories */}
      <FlatList
        data={parentCategories}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
        renderItem={({ item }) => (
          <CategoryItem
            name={item.name}
            icon={item?.icon || "spa"}
            categoryId={item.id}
            router={router}
          />
        )}
      />

      {/* Sections */}
      <Section
        title="Standard Products"
        products={standardProductsData}
        delay={100}
        router={router}
        type="STANDARD"
      />
      <Section
        title="Limited Edition Products"
        products={filterLimitedProducts}
        delay={400}
        router={router}
        type="LIMITED"
      />

      {/* Beauty Blog */}
      <View className="mt-6 pb-8">
        <View className="flex-row justify-between items-center px-4 mb-3">
          <Text className="text-xl font-bold text-gray-800">Latest Blog</Text>
          <TouchableOpacity className="flex-row items-center" onPress={() => router.push("/blog")}>
            <Text className="text-rose-500 font-medium mr-1">See all</Text>
            <MaterialIcons name="chevron-right" size={20} color="#F43F5E" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={contents || []}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item, index }: { item: ListContent; index: number }) => {
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

            return (
              <MotiView
                from={{ opacity: 0, translateY: 15 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 700 + index * 120, type: "timing" }}
                className="bg-white rounded-xl p-3 mr-4 border border-gray-100 shadow-sm w-64"
              >
                <TouchableOpacity
                  onPress={() => router.push({ pathname: "/blog/[id]", params: { id: item.id } })}
                  className="relative"
                >
                  <Image
                    source={item.thumbnail_url ? { uri: item.thumbnail_url } : notfound300x200}
                    className="w-full h-40 rounded-lg mb-3"
                    resizeMode="cover"
                  />
                  <Text numberOfLines={2} className="font-semibold text-gray-800 text-base mb-2">
                    {item.title}
                  </Text>
                  <View className="flex-row items-center">
                    <MaterialIcons name="access-time" size={16} color="#9CA3AF" />
                    <Text className="text-gray-500 text-sm ml-1">
                      {getTimeAgo(item.created_at)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </MotiView>
            );
          }}
        />
      </View>
    </ScrollView>
  );
}

export default HomeScreen;
