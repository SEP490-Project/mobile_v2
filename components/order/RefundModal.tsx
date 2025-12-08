import React from "react";
import { KeyboardAvoidingView, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface RefundModalProps {
  visible: boolean;
  onClose: () => void;
  handleRefundOrder: (reason: string) => void;
}

const RefundModal = ({ visible, onClose, handleRefundOrder }: RefundModalProps) => {
  const [reason, setReason] = React.useState("");
  if (!visible) return null;

  return (
    <Modal transparent animationType="slide" visible={visible}>
      <SafeAreaView className="flex-1 justify-end bg-black/50">
        <KeyboardAvoidingView behavior="padding">
          <View className="bg-white rounded-t-lg p-6">
            <Text className="text-lg font-bold text-gray-800">Compensate Order</Text>
            <Text className="text-gray-600 mb-6">
              Please provide details and evidence for your compensation request.
            </Text>

            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-4"
              placeholder="Enter details"
              multiline
              numberOfLines={4}
              onChangeText={setReason}
              value={reason}
            />

            <View className="flex-row gap-4 mt-4">
              <TouchableOpacity
                className="flex-1 rounded-lg py-3 items-center border border-gray-300"
                onPress={onClose}
              >
                <Text className="text-gray-700 font-bold text-base">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-primary rounded-lg py-3 items-center"
                onPress={() => {
                  handleRefundOrder(reason);
                  setReason("");
                }}
              >
                <Text className="text-white font-bold text-base">Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default RefundModal;
