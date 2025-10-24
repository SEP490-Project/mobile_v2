import { MaterialIcons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";

export default function StackLayout() {
  return (
    <Stack
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
      <Stack.Screen name="index" options={{ headerTitle: () => null }} />
      <Stack.Screen name="signup" options={{ headerTitle: () => null }} />
      <Stack.Screen name="forgot" options={{ headerTitle: () => null }} />
    </Stack>
  );
}
