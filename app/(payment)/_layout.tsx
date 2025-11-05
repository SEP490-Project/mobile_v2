import { Stack } from "expo-router";
import React from "react";

const PaymentLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="payment-failed" options={{ headerShown: false }} />
      <Stack.Screen name="payment-success" options={{ headerShown: false }} />
    </Stack>
  );
};

export default PaymentLayout;
