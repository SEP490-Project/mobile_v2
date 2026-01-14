import { RootState, useAppDispatch } from "@/libs/stores";
import {
  getShippingAddressesThunk,
  setDefaultShippingAddressThunk,
} from "@/libs/stores/locationManager/thunk";
import { ShippingAddressData } from "@/libs/types/location";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const ShippingAddressCard: React.FC<{
  address: ShippingAddressData;
  onPress: () => void;
  onSetDefault: () => void;
}> = ({ address, onPress, onSetDefault }) => {
  return (
    <View className="bg-white p-4 rounded-lg shadow mb-4 mx-4">
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View className="flex flex-row items-center justify-between mb-1">
          <View className="flex flex-row items-center gap-1 flex-1">
            <Text className="text-lg font-semibold">{address.full_name}</Text>
            <Text className="text-lg text-gray-500"> | </Text>
            <Text className="text-gray-600">{address.phone_number}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
        </View>
        <Text className="text-gray-600">{address.email}</Text>
        <Text className="text-gray-600">{address.street}</Text>
        <Text className="text-gray-600">
          {address.ward_name}, {address.district_name}, {address.province_name}, {address.country}
        </Text>
      </TouchableOpacity>
      <View className="flex-row mt-3 items-center justify-between">
        {address.is_default ? (
          <Text className="text-sm text-primary border border-primary font-medium px-2 py-1 rounded-lg">
            Default
          </Text>
        ) : (
          <TouchableOpacity
            onPress={onSetDefault}
            className="bg-gray-100 px-3 py-1.5 rounded-lg"
            activeOpacity={0.7}
          >
            <Text className="text-sm text-gray-700 font-medium">Set as Default</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const MyAddresses = () => {
  const dispatch = useAppDispatch();
  const { shippingAddresses, errors, loading } = useSelector(
    (state: RootState) => state.manageLocation,
  );
  const shippingAddressesData = shippingAddresses?.data || [];
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  const onCall = React.useCallback(() => {
    dispatch(getShippingAddressesThunk());
  }, [dispatch]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    dispatch(getShippingAddressesThunk());
    setRefreshing(false);
  }, [dispatch]);

  useEffect(() => {
    onCall();
  }, [onCall]);

  const handleSetDefault = async (addressId: string) => {
    try {
      await dispatch(setDefaultShippingAddressThunk(addressId)).unwrap();
      Alert.alert("Success", "Default address updated successfully");
      dispatch(getShippingAddressesThunk());
    } catch (error: any) {
      Alert.alert("Error", error || "Failed to set default address. Please try again.");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#ff9fb2" />
      </View>
    );
  }

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
            <ShippingAddressCard
              key={address.id}
              address={address}
              onPress={() => router.push(`/(user)/(address)/${address.id}`)}
              onSetDefault={() => handleSetDefault(address.id)}
            />
          ))}
        </View>
        <TouchableOpacity
          onPress={() => {
            router.push("/(user)/(address)/new");
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
