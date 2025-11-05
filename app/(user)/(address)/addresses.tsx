import { RootState, useAppDispatch } from "@/libs/stores";
import { getShippingAddressesThunk } from "@/libs/stores/locationManager/thunk";
import { ShippingAddressData } from "@/libs/types/location";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const ShippingAddressCard: React.FC<{ address: ShippingAddressData }> = ({ address }) => {
  return (
    <TouchableOpacity className="bg-white p-4 rounded-lg shadow mb-4 mx-4">
      <View className="flex flex-row items-center gap-1 mb-1">
        <Text className="text-lg font-semibold">{address.full_name}</Text>
        <Text className="text-lg text-gray-500"> | </Text>
        <Text className="text-gray-600">{address.phone_number}</Text>
      </View>
      <Text className="text-gray-600">{address.email}</Text>
      <Text className="text-gray-600">{address.street}</Text>
      <Text className="text-gray-600">
        {address.ward_name}, {address.district_name}, {address.province_name}, {address.country}
      </Text>
      <View className="flex-row mt-2 items-center">
        {address.is_default && (
          <Text className="text-sm text-primary border border-primary font-medium px-2 rounded-lg">
            Default
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const MyAddresses = () => {
  const dispatch = useAppDispatch();
  const { shippingAddresses, loading, errors } = useSelector(
    (state: RootState) => state.manageLocation,
  );
  const shippingAddressesData = shippingAddresses?.data || [];
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    dispatch(getShippingAddressesThunk());
    setRefreshing(false);
  }, [dispatch]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="relative flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 bg-gray-50 rounded-full absolute left-4 z-50"
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-gray-600 font-semibold text-2xl text-center w-full">
            Shipping Addresses
          </Text>
        </View>
        <View className="mt-4">
          {errors && <Text className="text-red-500 text-center mb-4 px-4">{errors}</Text>}
          {shippingAddressesData?.map((address) => (
            <ShippingAddressCard key={address.id} address={address} />
          ))}
        </View>
        <TouchableOpacity
          onPress={() => {
            router.push("/add_address");
          }}
        >
          <View className="bg-primary mx-4 mb-6 rounded-lg p-4 items-center flex-row justify-center gap-2">
            <MaterialIcons name="add-location" size={24} color="white" />
            <Text className="text-white font-semibold text-lg">Add New Address</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyAddresses;
