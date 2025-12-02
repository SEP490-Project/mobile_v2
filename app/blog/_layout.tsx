import { Stack } from "expo-router";

const BlogLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "center",
        headerTintColor: "#fff",
        headerStyle: {
          backgroundColor: "#ff9fb2",
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Blogs" }} />
      <Stack.Screen name="[id]" />
    </Stack>
  );
};

export default BlogLayout;
