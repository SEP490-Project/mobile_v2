import Header from "@/components/layout/Header";
import { ProductCard } from "@/components/ui";
import { RootState, useAppDispatch } from "@/libs/stores";
import { getAllProductsThunk } from "@/libs/stores/productManager/thunk";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const ProductScreen = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const products = useSelector((state: RootState) => state.manageProducts.products?.data || []);
  const { type } = useLocalSearchParams();

  const filteredProductsByType = products.filter((item) => item.type === type);

  useEffect(() => {
    dispatch(getAllProductsThunk());
  }, [dispatch]);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top + 10 }}>
      <Header />

      {/* <View className="px-4 py-4 flex-row items-center justify-between border-b border-gray-100">
        <View>
          <Text className="text-2xl font-bold text-gray-800">{getTypeTitle()}</Text>
          <Text className="text-sm text-gray-500 mt-1">
            {filteredProductsByType.length}{" "}
            {filteredProductsByType.length === 1 ? "product" : "products"}
          </Text>
        </View>
        <MaterialIcons name="filter-list" size={24} color="#9CA3AF" />
      </View> */}

      <FlatList
        data={filteredProductsByType}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <View className="w-[48%] mb-4">
            <ProductCard
              product={item}
              onPress={() =>
                router.push({ pathname: "/(product)/[product]", params: { product: item.id } })
              }
            />
          </View>
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <MaterialIcons name="shopping-bag" size={64} color="#E5E7EB" />
            <Text className="text-gray-400 text-lg mt-4">No products found</Text>
          </View>
        }
      />
    </View>
  );
};

export default ProductScreen;
