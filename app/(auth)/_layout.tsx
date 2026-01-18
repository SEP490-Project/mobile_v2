import { useAuth } from "@/libs/hooks/useAuthen";
import { MaterialIcons } from "@expo/vector-icons";
import { Redirect, Stack, router } from "expo-router";
import React from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";

export default function AuthStackLayout() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#ff9fb2" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={({ navigation, route }) => ({
        headerShown: true,
        headerTitleAlign: "center",
        headerTintColor: "#ff9fb2",
        headerShadowVisible: false,
        animation: "slide_from_bottom",
        headerLeft: ({ canGoBack }) => {
          const handleBack = () => {
            if (router.canGoBack()) {
              router.back();
              return;
            }

            if (canGoBack) {
              navigation.goBack();
              return;
            }

            navigation.navigate("(tabs)");
          };

          return (
            <TouchableOpacity onPress={handleBack}>
              <MaterialIcons
                name="chevron-left"
                size={route.name === "index" ? 28 : 32}
                color="#ff9fb2"
              />
            </TouchableOpacity>
          );
        },
      })}
    >
      <Stack.Screen
        name="index"
        options={{ headerTitle: () => null, animation: "slide_from_left" }}
      />
      <Stack.Screen name="signup" options={{ headerTitle: () => null }} />
      <Stack.Screen name="forgot" options={{ headerTitle: () => null }} />
      <Stack.Screen name="reset-password" options={{ headerTitle: () => null }} />
    </Stack>
  );
}
