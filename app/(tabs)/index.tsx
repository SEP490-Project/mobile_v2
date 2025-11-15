import Header from "@/components/layout/Header";
import { convertNumberToVND } from "@/libs/helper/currency-helper";
import { RootState, useAppDispatch } from "@/libs/stores";
import { getAllCategoriesThunk } from "@/libs/stores/categoryManager/thunk";
import { getAllProductsThunk } from "@/libs/stores/productManager/thunk";
import { Category } from "@/libs/types/category";
import { Product } from "@/libs/types/product";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { MotiView } from "moti";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

// --- Dữ liệu ---
const blogPosts = [
  {
    id: "1",
    title: "How to Build a Simple Skincare Routine",
    image:
      "https://theorganiccompoundingpharmacy.com/cdn/shop/articles/How_to_Build_a_Simple_Skincare_Routine_for_Beginners.png?v=1737490654&width=480",
  },
  {
    id: "2",
    title: "Top 5 Makeup Trends of 2025",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPAgEcdWsdoPpihyfXEqQBdpnWkriNEh1COA&s",
  },
  {
    id: "3",
    title: "Haircare Secrets from Professionals",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOdR5A8qlKaImozYZTXFDf3U7UtyGVkcP2Bw&s",
  },
];

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

  const { loading: productsLoading, products } = useSelector(
    (state: RootState) => state.manageProducts,
  );
  const { loading: categoriesLoading, categories } = useSelector(
    (state: RootState) => state.manageCategories,
  );

  const productsData: Product[] = products?.data || [];
  const categoriesData: Category[] = categories?.data || [];

  const parentCategories = categoriesData.filter((item) => !item.parent_category);
  const insets = useSafeAreaInsets();

  useFocusEffect(() => {
    dispatch(getAllProductsThunk());
  });

  useFocusEffect(() => {
    dispatch(getAllCategoriesThunk());
  });

  if (productsLoading && categoriesLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#ff9fb2" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top + 10 }}
      showsVerticalScrollIndicator={false}
    >
      <Header />

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
        title="Latest Products"
        products={productsData.filter((item) => item.type === "STANDARD")}
        delay={100}
        router={router}
        type="STANDARD"
      />
      <Section
        title="Limited Edition Products"
        products={productsData.filter((item) => item.type === "LIMITED")}
        delay={400}
        router={router}
        type="LIMITED"
      />

      {/* Beauty Blog */}
      <View className="mt-6 px-4 pb-8">
        <Text className="text-xl font-bold text-gray-800 mb-4">Beauty Blog</Text>
        {blogPosts.map((post, i) => (
          <MotiView
            key={post.id}
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: i * 150, type: "timing" }}
            className="flex-row items-center mb-4 bg-white rounded-xl p-3 border border-gray-100 shadow-sm"
          >
            <Image source={{ uri: post.image }} className="w-24 h-24 rounded-lg mr-4" />
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800 mb-1" numberOfLines={2}>
                {post.title}
              </Text>
              <TouchableOpacity className="flex-row items-center mt-1">
                <Text className="text-sm text-rose-500 font-medium">Read More</Text>
                <MaterialIcons name="arrow-right-alt" size={18} color="#F43F5E" />
              </TouchableOpacity>
            </View>
          </MotiView>
        ))}
      </View>
    </ScrollView>
  );
}

export default HomeScreen;
