import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";

const PaymentWebViewScreen = () => {
  const router = useRouter();
  const { paymentUrl } = useLocalSearchParams();

  const handleDeepLink = (url: string) => {
    if (url.startsWith("b-showsell://payment-success")) {
      router.replace("/payment-success");
      return true;
    } else if (url.startsWith("b-showsell://payment-failed")) {
      router.replace("/payment-failed");
      return true;
    }
    return false;
  };

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
        <Text style={{ fontSize: 18, fontWeight: "600", marginLeft: 12 }}>Payment</Text>
      </View>

      <WebView
        source={{ uri: paymentUrl as string }}
        originWhitelist={["*"]}
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator
            size={"large"}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
            color="#ff9fb2"
          />
        )}
        onShouldStartLoadWithRequest={(request) => {
          if (handleDeepLink(request.url)) {
            return false;
          }
          return true;
        }}
      />
    </SafeAreaView>
  );
};

export default PaymentWebViewScreen;
