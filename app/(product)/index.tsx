import { ProductCard } from "@/components/ui";
import { RootState, useAppDispatch } from "@/libs/stores";
import { getAllProductsThunk } from "@/libs/stores/productManager/thunk";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const ProductScreen = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const products = useSelector((state: RootState) => state.manageProducts.products?.data || []);
  const cartItems = useSelector((state: RootState) => state.manageCart.items);
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const { type } = useLocalSearchParams();

  const filteredProductsByType = products.filter((item) => item.type === type);

  useEffect(() => {
    dispatch(getAllProductsThunk());
  }, [dispatch]);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top + 10 }}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
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
      </View>

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
