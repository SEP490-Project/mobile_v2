import { Stack } from "expo-router";
import React from "react";

const UserLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="(address)" options={{ headerShown: false }} />
      <Stack.Screen name="update-profile" options={{ headerShown: false }} />
    </Stack>
  );
};

export default UserLayout;
