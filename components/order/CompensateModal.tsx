import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Image, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

export const CompensateModal = ({
  visible,
  onClose,
  handleCompensateOrder,
}: {
  visible: boolean;
  onClose: () => void;
  handleCompensateOrder: (reason: string, file: File) => void;
}) => {
  const [reason, setReason] = React.useState("");
  const [imageUri, setImageUri] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [asset, setAsset] = React.useState<any>(null);

  if (!visible) return null;

  const pickFile = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access media library is required!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
      aspect: [4, 3],
    });
    console.log(pickerResult);

    if (!pickerResult.canceled && pickerResult.assets[0]) {
      const asset = pickerResult.assets[0];
      setImageUri(asset.uri);
      setFileName(asset.fileName || "image.jpg");
      setAsset(asset);
    }
  };

  return (
    <Modal transparent animationType="slide" visible={visible}>
      <View className="flex-1 justify-end bg-black/50">
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

          <View>
            <TouchableOpacity
              className="border border-gray-300 rounded-lg p-3 mb-4 items-center"
              onPress={pickFile}
            >
              <Text className="text-gray-600">Select Evidence File</Text>
            </TouchableOpacity>
            <View className="items-center">
              {imageUri && (
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: 200, height: 200, borderRadius: 10 }}
                  resizeMode="contain"
                />
              )}
            </View>
          </View>

          <View className="flex-row gap-4 mt-4">
            <TouchableOpacity
              className="flex-1 rounded-lg py-3 items-center border border-gray-300"
              onPress={onClose}
            >
              <Text className="text-gray-700 font-bold text-base">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-primary rounded-lg py-3  items-center"
              onPress={() => {
                if (!imageUri || !reason.trim()) {
                  alert("Please provide both reason and evidence file");
                  return;
                }
                // Create a File-like object for React Native
                const file = {
                  uri: imageUri,
                  name: fileName || "image.jpg",
                  type: asset.type || "image/jpeg",
                } as any;
                handleCompensateOrder(reason, file);
                onClose();
              }}
            >
              <Text className="text-white font-bold text-base">Submit Request</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
