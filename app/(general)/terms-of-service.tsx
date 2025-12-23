import { useTermPolicy } from "@/libs/hooks/useTermPolicy";
import { useAppDispatch } from "@/libs/stores";
import { termOfServiceThunk } from "@/libs/stores/termPolicyManager/thunk";
import TiptapRenderer from "@/libs/utils/tiptap/renderTiptapContent";
import { useEffect } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function TermsOfService() {
  const dispatch = useAppDispatch();
  const { loading, termOfService } = useTermPolicy();

  useEffect(() => {
    dispatch(termOfServiceThunk());
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
        <View className="px-4">{termOfService && <TiptapRenderer content={termOfService} />}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default TermsOfService;
