import { MaterialIcons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";

export default function StackLayout() {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerTitleAlign: "center",
        headerTintColor: "#ff9fb2",
        headerShadowVisible: false,
        headerLeft: ({ canGoBack }) =>
          canGoBack ? (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons name="chevron-left" size={32} color="#ff9fb2" />
            </TouchableOpacity>
          ) : null,
      })}
    >
      <Stack.Screen
        name="index"
        options={{ title: "Help Center & FAQs", headerTitleAlign: "left" }}
      />
      <Stack.Screen name="about" options={{ title: "About Us", headerTitleAlign: "left" }} />
      <Stack.Screen
        name="privacy-policy"
        options={{ title: "Privacy Policy", headerTitleAlign: "left" }}
      />
      <Stack.Screen
        name="terms-of-service"
        options={{ title: "Terms of Service", headerTitleAlign: "left" }}
      />
    </Stack>
  );
}
