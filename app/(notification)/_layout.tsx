import { Stack } from "expo-router";
import React from "react";

const NotificationLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "center",
        headerTintColor: "#ff9fb2",
        headerStyle: {
          backgroundColor: "#fff",
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: "My Notifications" }} />
      <Stack.Screen name="[id]" options={{ title: "Notification Detail" }} />
    </Stack>
  );
};

export default NotificationLayout;
