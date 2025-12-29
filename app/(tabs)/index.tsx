import { convertNumberToVND } from "@/libs/helper/currency-helper";
import { useContent } from "@/libs/hooks/useContent";
import { RootState, useAppDispatch } from "@/libs/stores";
import { getAllCategoriesThunk } from "@/libs/stores/categoryManager/thunk";
import { getAllContents } from "@/libs/stores/contentManager/thunk";
import { getAllProductsThunk } from "@/libs/stores/productManager/thunk";
import type { Category } from "@/libs/types/category";
import type { Product } from "@/libs/types/product";
import { MaterialIcons } from "@expo/vector-icons";
import { LegendList } from "@legendapp/list";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

/* -------------------------------------------------------------------------- */
/*                                   ASSETS                                   */
/* -------------------------------------------------------------------------- */

const notfound150 = require("@/assets/images/not-found/150.png");
const notfound300x200 = require("@/assets/images/not-found/300x200.png");

/* -------------------------------------------------------------------------- */
/*                                   UTILS                                    */
/* -------------------------------------------------------------------------- */

function getImageSource(url?: string, fallback?: any) {
  if (url && typeof url === "string" && url.startsWith("http")) {
    return { uri: url };
  }
  return fallback;
}

function timeAgo(dateString: string) {
  const now = Date.now();
  const created = new Date(dateString).getTime();
  const hours = Math.floor((now - created) / 36e5);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}H ago`;
  if (hours < 168) return `${Math.floor(hours / 24)}D ago`;
  return `${Math.floor(hours / 168)}W ago`;
}

/* -------------------------------------------------------------------------- */
/*                                   SCREEN                                   */
/* -------------------------------------------------------------------------- */

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);

  const { loadingAll: productsLoading, allProducts } = useSelector(
    (state: RootState) => state.manageProducts,
  );
  const { loading: categoriesLoading, categories } = useSelector(
    (state: RootState) => state.manageCategories,
  );
  const { contents } = useContent();

  /* ------------------------------- MEMO DATA ------------------------------- */

  const productsData = useMemo<Product[]>(() => allProducts?.data || [], [allProducts?.data]);

  const categoriesData = useMemo<Category[]>(() => categories?.data || [], [categories?.data]);

  const parentCategories = useMemo(
    () => categoriesData.filter((c) => !c.parent_category),
    [categoriesData],
  );

  const standardProducts = useMemo(
    () => productsData.filter((p) => p.type === "STANDARD").slice(0, 5),
    [productsData],
  );

  const limitedProducts = useMemo(() => {
    const now = Date.now();
    return productsData
      .filter((p) => {
        if (p.type !== "LIMITED") return false;
        const start = p.limited_product?.premiere_date
          ? new Date(p.limited_product.premiere_date).getTime()
          : -Infinity;
        const end = p.limited_product?.availability_end_date
          ? new Date(p.limited_product.availability_end_date).getTime()
          : Infinity;
        return now >= start && now <= end;
      })
      .slice(0, 5);
  }, [productsData]);

  /* ------------------------------ DATA LOADING ------------------------------ */

  const loadData = useCallback(() => {
    dispatch(getAllProductsThunk());
    dispatch(getAllCategoriesThunk());
    dispatch(
      getAllContents({
        page: 1,
        limit: 5,
        sort_by: "created_at",
        sort_order: "desc",
      }),
    );
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(getAllProductsThunk()),
        dispatch(getAllCategoriesThunk()),
        dispatch(
          getAllContents({
            page: 1,
            limit: 5,
            sort_by: "created_at",
            sort_order: "desc",
          }),
        ),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (productsLoading && categoriesLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#ff9fb2" />
      </View>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                                   RENDER                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <ScrollView
      className="flex-1 bg-white"
      removeClippedSubviews
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#ff9fb2"]}
          tintColor="#ff9fb2"
        />
      }
    >
      {/* ----------------------------- CATEGORIES ----------------------------- */}
      <LegendList
        data={parentCategories}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="items-center mr-4"
            onPress={() => router.push({ pathname: "/(product)", params: { category: item.id } })}
          >
            <View className="h-16 w-16 items-center justify-center bg-rose-50 border border-rose-100 rounded-full mb-1">
              <MaterialIcons name={(item.icon || "spa") as any} size={24} color="#F43F5E" />
            </View>
            <Text className="text-gray-600 text-xs font-medium">{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* -------------------------- STANDARD PRODUCTS -------------------------- */}
      <Section
        title="Standard Products"
        products={standardProducts}
        type="STANDARD"
        router={router}
      />

      {/* -------------------------- LIMITED PRODUCTS --------------------------- */}
      <Section
        title="Limited Edition Products"
        products={limitedProducts}
        type="LIMITED"
        router={router}
      />

      {/* -------------------------------- BLOG -------------------------------- */}
      <View className="mt-6 pb-8">
        <Header title="Latest Blog" onPress={() => router.push("/blog")} />

        <LegendList
          data={contents || []}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item, index }) => {
            const Card = (
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/blog/[id]", params: { id: item.id } })}
                className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm w-64"
              >
                <Image
                  source={getImageSource(item.thumbnail_url, notfound300x200)}
                  style={{ width: "100%", height: 160, borderRadius: 12, marginBottom: 12 }}
                  contentFit="cover"
                  cachePolicy="disk"
                />
                <Text numberOfLines={2} className="font-semibold text-gray-800 text-base mb-2">
                  {item.title}
                </Text>
                <View className="flex-row items-center">
                  <MaterialIcons name="access-time" size={16} color="#9CA3AF" />
                  <Text className="text-gray-500 text-sm ml-1">{timeAgo(item.created_at)}</Text>
                </View>
              </TouchableOpacity>
            );

            return index === 0 ? (
              <MotiView
                from={{ opacity: 0, translateY: 12 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ duration: 300 }}
                className="mr-4"
              >
                {Card}
              </MotiView>
            ) : (
              <View className="mr-4">{Card}</View>
            );
          }}
        />
      </View>
    </ScrollView>
  );
}

/* -------------------------------------------------------------------------- */
/*                               SUB COMPONENTS                               */
/* -------------------------------------------------------------------------- */

function Header({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <View className="flex-row justify-between items-center px-4 mb-3">
      <Text className="text-xl font-bold text-gray-800">{title}</Text>
      <TouchableOpacity className="flex-row items-center" onPress={onPress}>
        <Text className="text-rose-500 font-medium mr-1">See all</Text>
        <MaterialIcons name="chevron-right" size={20} color="#F43F5E" />
      </TouchableOpacity>
    </View>
  );
}

function Section({
  title,
  products,
  type,
  router,
}: {
  title: string;
  products: Product[];
  type: "STANDARD" | "LIMITED";
  router: any;
}) {
  const getPrice = (p: Product) =>
    p.variants?.find((v) => v.is_default)?.price ?? p.variants?.[0]?.price ?? 0;

  return (
    <View className="mt-6">
      <Header
        title={title}
        onPress={() => router.push({ pathname: "(product)", params: { type } })}
      />

      <LegendList
        data={products}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item, index }) => {
          const Card = (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(product)/[product]",
                  params: { product: item.id },
                })
              }
              className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm w-44"
            >
              <Image
                source={getImageSource(item.thumbnail_url?.[0], notfound150)}
                style={{ width: "100%", height: 160, borderRadius: 12, marginBottom: 12 }}
                contentFit="cover"
                cachePolicy="disk"
              />
              <Text numberOfLines={1} className="font-semibold text-gray-800 text-base">
                {item.name}
              </Text>
              {item.brand_name && (
                <View className="flex-row items-center my-1">
                  <MaterialIcons name="business" size={16} color="#9CA3AF" />
                  <Text className="text-gray-600 text-sm ml-1">{item.brand_name}</Text>
                </View>
              )}
              <Text className="text-rose-600 font-bold text-lg mt-1">
                {convertNumberToVND(getPrice(item))}
              </Text>
              {type === "LIMITED" && (
                <View className="absolute top-2 right-2 bg-rose-500 px-3 py-1 rounded-full">
                  <Text className="text-white text-xs font-bold">LIMITED</Text>
                </View>
              )}
            </TouchableOpacity>
          );

          return index === 0 ? (
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 300 }}
              className="mr-4"
            >
              {Card}
            </MotiView>
          ) : (
            <View className="mr-4">{Card}</View>
          );
        }}
      />
    </View>
  );
}
