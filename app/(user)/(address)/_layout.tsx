import { Stack } from "expo-router";

const AddressLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="addresses" options={{ headerShown: false }} />
      <Stack.Screen name="add_address" options={{ headerShown: false }} />
    </Stack>
  );
};

export default AddressLayout;
