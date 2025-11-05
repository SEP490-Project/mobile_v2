import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";

const PaymentWebViewScreen = () => {
  const router = useRouter();
  const { paymentUrl } = useLocalSearchParams();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          height: 56,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#eee",
          backgroundColor: "#fff",
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "600", marginLeft: 12 }}>Thanh toán</Text>
      </View>

      <WebView
        source={{ uri: paymentUrl as string }}
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator
            size={"large"}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          />
        )}
        onNavigationStateChange={(navState) => {
          if (navState.url.includes("payment-success")) {
            router.replace("/payment-success");
          } else if (navState.url.includes("payment-failed")) {
            router.replace("/payment-failed");
          }
        }}
      />
    </SafeAreaView>
  );
};

export default PaymentWebViewScreen;
