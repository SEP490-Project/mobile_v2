import { Stack } from "expo-router";
import React from "react";

const UserLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="addresses" options={{ headerShown: false }} />
      {/* <Stack.Screen name="change-password" options={{ headerShown: false }} /> */}
    </Stack>
  );
};

export default UserLayout;
