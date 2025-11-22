import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentFailedScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", padding: 24 }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <MaterialIcons name="cancel" size={100} color="#ef4444" />

        <Text style={{ fontSize: 24, fontWeight: "700", marginTop: 20 }}>Payment Failed</Text>

        <Text
          style={{
            marginTop: 8,
            fontSize: 16,
            color: "#666",
            textAlign: "center",
          }}
        >
          Something went wrong during the payment process. Please try again.
        </Text>

        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/orders")}
          style={{
            marginTop: 32,
            backgroundColor: "#ef4444",
            paddingVertical: 12,
            paddingHorizontal: 28,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
