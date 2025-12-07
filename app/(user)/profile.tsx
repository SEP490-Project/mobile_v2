import { AppDispatch, RootState } from "@/libs/stores";
import { getUserProfileThunk } from "@/libs/stores/userManager/thunk";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
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
          <ActivityIndicator size="large" color="#ff9fb2" />
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <ImageBackground
          source={require("@/assets/images/background/account-background.jpg")}
          resizeMode="cover"
          className="flex-1 justify-center px-6 py-8"
        >
          <View className="items-center">
            <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4">
              {profile.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  alt="Avatar"
                  className="w-full h-full rounded-full"
                />
              ) : (
                <Text className="text-4xl font-bold text-primary">
                  {profile.full_name?.charAt(0).toUpperCase() || "U"}
                </Text>
              )}
            </View>
            <Text className="text-2xl font-bold text-white mb-1">{profile.full_name}</Text>
            <Text className="text-blue-100">@{profile.username}</Text>

            <TouchableOpacity
              onPress={() => router.push("/(user)/update-profile")}
              className="mt-4 bg-white/20 border border-white/30 px-6 py-3 rounded-lg"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center">
                <Ionicons name="create-outline" size={18} color="white" />
                <Text className="text-white font-semibold ml-2">Edit Profile</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        <View className="bg-white mx-4 mt-4 rounded-lg p-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-2">Personal Information</Text>
          <InfoRow icon="person-outline" label="Full Name" value={profile.full_name} />
          <InfoRow icon="mail-outline" label="Email" value={profile.email} />
          <InfoRow icon="call-outline" label="Phone" value={profile.phone || "Not provided"} />
          <InfoRow
            icon="calendar-outline"
            label="Date of Birth"
            value={profile.date_of_birth ? formatDate(profile.date_of_birth) : "Not provided"}
          />
          <InfoRow icon="shield-outline" label="Role" value={profile.role} />
          <InfoRow
            icon="checkmark-circle-outline"
            label="Account Status"
            value={profile.is_active ? "Active" : "Inactive"}
          />
        </View>

        <View className="bg-white mx-4 mt-4 rounded-lg p-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-2">Account Activity</Text>
          <InfoRow icon="time-outline" label="Last Login" value={formatDate(profile.last_login)} />
          <InfoRow
            icon="calendar-outline"
            label="Account Created"
            value={formatDate(profile.created_at)}
          />
        </View>

        {profile.shipping_address && profile.shipping_address.length > 0 && (
          <View className="bg-white mx-4 my-4 rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-2">Shipping Addresses</Text>
            {profile.shipping_address.map((address, index) => (
              <View key={address.id} className="mb-4 last:mb-0">
                <View className="flex-row items-center mb-2">
                  <Text className="text-base font-semibold text-gray-800">{address.full_name}</Text>
                  {address.is_default && (
                    <View className="ml-2 bg-blue-100 px-2 py-1 rounded-full">
                      <Text className="text-xs text-blue-600 font-medium">Default</Text>
                    </View>
                  )}
                </View>
                <Text className="text-gray-600 mb-1">{address.phone_number}</Text>
                <Text className="text-gray-600 mb-1">{address.email}</Text>
                <Text className="text-gray-600">
                  {address.street}, {address.ward_name}, {address.district_name}, {address.city}
                </Text>
                {index < profile.shipping_address.length - 1 && (
                  <View className="mt-3 border-b border-gray-100" />
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyProfile;
