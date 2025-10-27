import { Stack } from "expo-router";

const ProductLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[product]" options={{ headerShown: false }} />
    </Stack>
  );
};

export default ProductLayout;
