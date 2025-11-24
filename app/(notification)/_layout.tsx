import { Stack } from "expo-router";
import React from "react";

const NotificationLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "center",
        headerTintColor: "#fff",
        headerStyle: {
          backgroundColor: "#ff9fb2",
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: "My Notifications" }} />
      <Stack.Screen name="[id]" options={{ title: "Detail" }} />
    </Stack>
  );
};

export default NotificationLayout;
