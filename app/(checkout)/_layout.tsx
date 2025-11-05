import { Stack } from "expo-router";
import React from "react";

const CheckoutLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
};

export default CheckoutLayout;
