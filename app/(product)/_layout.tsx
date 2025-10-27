import { Stack } from "expo-router";

const ProductLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[productId]" options={{ headerShown: false }} />
    </Stack>
  );
};

export default ProductLayout;
