import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function SearchScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4">
        <Text>Search Screen</Text>
      </View>
    </SafeAreaView>
  );
}

export default SearchScreen;
