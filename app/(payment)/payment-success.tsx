import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentSuccessScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", padding: 24 }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <MaterialIcons name="check-circle" size={100} color="#4ade80" />

        <Text style={{ fontSize: 24, fontWeight: "700", marginTop: 20 }}>Payment Successful!</Text>

        <Text
          style={{
            marginTop: 8,
            fontSize: 16,
            color: "#666",
            textAlign: "center",
          }}
        >
          Thank you for your payment. Your order has been confirmed successfully.
        </Text>

        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/orders")}
          style={{
            marginTop: 32,
            backgroundColor: "#4ade80",
            paddingVertical: 12,
            paddingHorizontal: 28,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>View Orders</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
