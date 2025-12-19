import { useTermPolicy } from "@/libs/hooks/useTermPolicy";
import { useAppDispatch } from "@/libs/stores";
import { privacyPolicyThunk } from "@/libs/stores/termPolicyManager/thunk";
import TiptapRenderer from "@/libs/utils/tiptap/renderTiptapContent";
import { useEffect } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function PrivacyPolicy() {
  const dispatch = useAppDispatch();
  const { loading, privacyPolicy } = useTermPolicy();

  useEffect(() => {
    dispatch(privacyPolicyThunk());
  }, [dispatch]);

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#ff9fb2" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        <View className="px-4">{privacyPolicy && <TiptapRenderer content={privacyPolicy} />}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default PrivacyPolicy;
