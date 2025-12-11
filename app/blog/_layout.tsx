import { MaterialIcons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { TouchableOpacity } from "react-native";

// Simple event emitter for search toggle
let searchToggleListener: (() => void) | null = null;

export const setSearchToggleListener = (listener: () => void) => {
  searchToggleListener = listener;
};

export const triggerSearchToggle = () => {
  if (searchToggleListener) {
    searchToggleListener();
  }
};

const BlogLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "center",
        headerTintColor: "#ff9fb2",
        headerStyle: {
          backgroundColor: "#fff",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={() => ({
          title: "Blogs",
          headerRight: () => (
            <TouchableOpacity onPress={triggerSearchToggle} style={{ marginRight: 15 }}>
              <MaterialIcons name="search" size={24} color="#ff9fb2" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen name="[id]" />
    </Stack>
  );
};

export default BlogLayout;
