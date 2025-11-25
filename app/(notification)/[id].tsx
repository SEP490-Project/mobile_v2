import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

function NotificationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View>
      <Text>Notification Detail</Text>
    </View>
  );
}

export default NotificationDetailScreen;
