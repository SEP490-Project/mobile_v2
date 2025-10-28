import { AppDispatch, RootState } from "@/libs/stores";
import { getUserProfileThunk } from "@/libs/stores/userManager/thunk";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const MyProfile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { profile, loading, error } = useSelector((state: RootState) => state.manageUser);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    dispatch(getUserProfileThunk());
  }, [dispatch]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await dispatch(getUserProfileThunk());
    setRefreshing(false);
  }, [dispatch]);

  if (loading && !profile) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-gray-600">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text className="mt-4 text-xl font-semibold text-gray-800">Error Loading Profile</Text>
          <Text className="mt-2 text-gray-600 text-center">{error}</Text>
          <TouchableOpacity
            onPress={() => dispatch(getUserProfileThunk())}
            className="mt-6 bg-blue-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600">No profile data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const InfoRow = ({
    icon,
    label,
    value,
  }: {
    icon: string;
    label: string;
    value: string | number | boolean;
  }) => (
    <View className="flex-row items-start py-4 border-b border-gray-100">
      <View className="w-10">
        <Ionicons name={icon as any} size={20} color="#6b7280" />
      </View>
      <View className="flex-1">
        <Text className="text-sm text-gray-500 mb-1">{label}</Text>
        <Text className="text-base text-gray-800 font-medium">{value?.toString() || "N/A"}</Text>
      </View>
    </View>
  );

  const defaultAddress = profile.shipping_address.find((addr) => addr.is_default);

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
            My Profile
          </Text>
        </View>

        <ImageBackground
          source={require("@/assets/images/background/account-background.jpg")}
          resizeMode="cover"
          className="flex-1 justify-center px-6 py-8"
        >
          <View className="items-center">
            <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4">
              <Text className="text-4xl font-bold text-primary">
                {profile.full_name?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <Text className="text-2xl font-bold text-white mb-1">{profile.full_name}</Text>
            <Text className="text-blue-100">@{profile.username}</Text>
          </View>
        </ImageBackground>

        <View className="bg-white mx-4 mt-4 rounded-lg p-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-2">Personal Information</Text>
          <InfoRow icon="person-outline" label="Full Name" value={profile.full_name} />
          <InfoRow icon="mail-outline" label="Email" value={profile.email} />
          <InfoRow icon="call-outline" label="Phone" value={profile.phone} />
          <InfoRow
            icon="calendar-outline"
            label="Date of Birth"
            value={formatDate(profile.date_of_birth)}
          />
        </View>

        {/* {defaultAddress && (
          <View className="bg-white mx-4 mt-4 rounded-lg p-4 shadow-sm">
            <View className="flex-row items-center mb-3">
              <Ionicons name="location-outline" size={22} color="#3b82f6" />
              <Text className="text-lg font-bold text-gray-800 ml-2">Default Shipping Address</Text>
            </View>
            <View className="bg-gray-50 p-4 rounded-lg">
              <Text className="text-base font-semibold text-gray-800 mb-2">
                {defaultAddress.full_name}
              </Text>
              <Text className="text-sm text-gray-600 mb-1">{defaultAddress.phone_number}</Text>
              <Text className="text-sm text-gray-600 mb-1">{defaultAddress.email}</Text>
              <Text className="text-sm text-gray-600 mt-2">
                {defaultAddress.street}
                {defaultAddress.address_line_2 && `, ${defaultAddress.address_line_2}`}
              </Text>
              <Text className="text-sm text-gray-600">
                {defaultAddress.city}, {defaultAddress.postal_code}
              </Text>
              <Text className="text-sm text-gray-600">{defaultAddress.country}</Text>
            </View>
          </View>
        )} */}

        {/* {profile.shipping_address.length > 0 && (
          <View className="bg-white mx-4 mt-4 mb-6 rounded-lg p-4 shadow-sm">
            <View className="flex-row items-center mb-3">
              <Ionicons name="list-outline" size={22} color="#3b82f6" />
              <Text className="text-lg font-bold text-gray-800 ml-2">
                All Addresses ({profile.shipping_address.length})
              </Text>
            </View>
            {profile.shipping_address.map((address, index) => (
              <View
                key={address.id}
                className={`p-4 rounded-lg mb-3 ${
                  address.is_default ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
                }`}
              >
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-sm font-semibold text-gray-800">{address.type}</Text>
                  {address.is_default && (
                    <View className="bg-blue-500 px-2 py-1 rounded">
                      <Text className="text-xs text-white font-semibold">DEFAULT</Text>
                    </View>
                  )}
                </View>
                <Text className="text-sm text-gray-700 font-medium">{address.full_name}</Text>
                <Text className="text-sm text-gray-600">{address.phone_number}</Text>
                <Text className="text-sm text-gray-600 mt-1">{address.street}</Text>
                <Text className="text-sm text-gray-600">
                  {address.city}, {address.postal_code}
                </Text>
              </View>
            ))}
          </View>
        )} */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyProfile;
