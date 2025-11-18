import { Stack } from "expo-router";
import React from "react";

const OrderLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="order-detail" options={{ headerShown: false }} />
      <Stack.Screen name="pre-order-detail" options={{ headerShown: false }} />
    </Stack>
  );
};

export default OrderLayout;
