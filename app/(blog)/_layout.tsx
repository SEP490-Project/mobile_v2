import { Stack } from "expo-router";

const BlogLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
};

export default BlogLayout;
