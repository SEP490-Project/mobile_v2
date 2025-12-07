import { Stack } from "expo-router";
import React from "react";

const UserLayout = () => {
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
      <Stack.Screen name="profile" options={{ title: "My Profile" }} />
      <Stack.Screen name="(address)" options={{ headerShown: false }} />
      <Stack.Screen name="update-profile" options={{ title: "Update Profile" }} />
    </Stack>
  );
};

export default UserLayout;
