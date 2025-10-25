import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function VerificationScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4">
        <Text>Verification Screen</Text>
      </View>
    </SafeAreaView>
  );
}

export default VerificationScreen;
