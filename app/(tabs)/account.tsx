import { useAuth } from "@/libs/hooks/useAuthen";
import { useAppDispatch } from "@/libs/stores";
import { logout } from "@/libs/stores/authenManager/thunk";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function AccountScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const dispatch = useAppDispatch();

  const handleAuthPress = () => {
    router.push("/(auth)");
  };

  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await dispatch(logout()).unwrap();
            Alert.alert("Logged out", "You have logged out of your account.");

            router.replace("/(tabs)");
          } catch (err) {
            Alert.alert("Logout failed", "Please try again later.");
          }
        },
      },
    ]);
  };

  const AUTH_AVATAR = "https://randomuser.me/api/portraits/men/32.jpg";

  return (
    <ImageBackground
      source={require("@/assets/images/background/account-background.jpg")}
      resizeMode="cover"
      className="flex-1 justify-center"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="flex items-center justify-center pt-16 pb-8">
          {isAuthenticated ? (
            <Image
              source={{ uri: AUTH_AVATAR }}
              className="w-32 h-32 rounded-full border-4 border-white shadow-xl"
            />
          ) : (
            <View className="w-32 h-32 rounded-full border-white flex items-center justify-center">
              <MaterialIcons name="account-circle" size={100} color="#ffffff" />
            </View>
          )}

          <Text className="text-4xl font-bold mt-3 text-white">
            {isAuthenticated ? user.username : "My Account"}
          </Text>

          {isAuthenticated ? (
            <View className="flex-row items-center mt-1">
              <MaterialIcons name="email" size={16} color="#F3F4F6" />
              <Text className="text-gray-100 text-lg ml-1">{user.email}</Text>
            </View>
          ) : (
            <Text className="text-gray-100 text-base mt-1">Sign in to manage your profile</Text>
          )}
        </View>

        {/* Content */}
        <View className="bg-white rounded-3xl p-6 shadow-xl">
          {isAuthenticated ? (
            <>
              {accountMenuItems.map((item) => (
                <MenuItem key={item.route} {...item} router={router} />
              ))}

              <View className="my-4 border-t border-gray-100 pt-4">
                <LogoutButton onLogout={handleLogout} />
              </View>
            </>
          ) : (
            <>
              <TouchableOpacity
                className="bg-primary py-4 rounded-2xl items-center shadow-lg mb-6"
                onPress={handleAuthPress}
              >
                <Text className="text-white font-bold text-lg">Sign In or Register</Text>
              </TouchableOpacity>
              <View className="mb-4 border-b border-gray-100"></View>
            </>
          )}

          <Text className="text-gray-700 font-semibold text-base mb-3 mt-2">
            General Information:
          </Text>

          {commonMenuItems.map((item) => (
            <MenuItem key={item.route} {...item} router={router} />
          ))}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

// ---------------- MENU DATA ----------------

const accountMenuItems = [
  {
    iconName: "person",
    name: "My Profile",
    route: "/(user)/profile",
    bgColor: "#E9F3FF",
    iconColor: "#3B82F6",
  },
  {
    iconName: "location-on",
    name: "Shipping Addresses",
    route: "/(user)/(address)/addresses",
    bgColor: "#FEF3C7",
    iconColor: "#F59E0B",
  },
  {
    iconName: "receipt-long",
    name: "My Orders",
    route: "/orders",
    bgColor: "#F0FDF4",
    iconColor: "#10B981",
  },
  {
    iconName: "shopping-cart",
    name: "My Carts",
    route: "/carts",
    bgColor: "#FEF2F2",
    iconColor: "#EF4444",
  },
  {
    iconName: "lock",
    name: "Change Password",
    route: "/change-password",
    bgColor: "#FFF7ED",
    iconColor: "#F59E0B",
  },
  {
    iconName: "notifications",
    name: "Notifications",
    route: "/notification",
    bgColor: "#F3E8FF",
    iconColor: "#9333EA",
  },
];

const commonMenuItems = [
  {
    iconName: "help-outline",
    name: "Help Center & FAQs",
    route: "/(general)",
    bgColor: "#E5F7FF",
    iconColor: "#06B6D4",
  },
  {
    iconName: "info-outline",
    name: "About Us",
    route: "/(general)/about",
    bgColor: "#FFE4E6",
    iconColor: "#F43F5E",
  },
];

// ---------------- COMPONENTS ----------------

const MenuItem = ({ iconName, name, route, bgColor, iconColor, isLogout = false, router }: any) => (
  <TouchableOpacity
    className={`flex-row items-center justify-between p-4 rounded-xl mb-3 ${
      isLogout ? "bg-red-50 border border-red-100" : "bg-gray-50"
    } shadow-sm`}
    onPress={() => router.push(route)}
  >
    <View className="flex-row items-center gap-3">
      <View
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <MaterialIcons name={iconName} size={24} color={iconColor} />
      </View>
      <Text className={`text-base font-semibold ${isLogout ? "text-red-600" : "text-gray-800"}`}>
        {name}
      </Text>
    </View>
    {!isLogout && <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />}
  </TouchableOpacity>
);

const LogoutButton = ({ onLogout }: { onLogout: () => void }) => (
  <TouchableOpacity
    className="flex-row items-center justify-between p-4 rounded-xl mb-3 bg-red-50 border border-red-100 shadow-sm"
    onPress={onLogout}
  >
    <View className="flex-row items-center gap-3">
      <View
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: "#FEE2E2" }}
      >
        <MaterialIcons name="logout" size={24} color="#EF4444" />
      </View>
      <Text className="text-base font-semibold text-red-600">Log Out</Text>
    </View>
  </TouchableOpacity>
);

export default AccountScreen;
