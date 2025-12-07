import { AuthInput } from "@/components/guest";
import { AppDispatch, RootState } from "@/libs/stores";
import { getUserProfileThunk, updateProfileThunk } from "@/libs/stores/userManager/thunk";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";

const UpdateProfileSchema = yup.object().shape({
  full_name: yup
    .string()
    .min(2, "Full name must be at least 2 characters")
    .required("Full name is required"),
  username: yup
    .string()
    .min(3, "Username must be at least 3 characters")
    .required("Username is required"),
  phone: yup
    .string()
    .matches(/^[+]?[1-9]\d{1,14}$/, "Please enter a valid phone number")
    .required("Phone number is required"),
  date_of_birth: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .required("Date of birth is required"),
  avatar_url: yup
    .string()
    .nullable()
    .test("is-valid-avatar", "Please enter a valid image URL or pick an image", (value) => {
      if (!value) return true;
      if (value.startsWith("file://")) return true;
      if (value.startsWith("content://")) return true;
      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }),
  bank_account: yup.string().optional(),
  bank_account_holder: yup.string().optional(),
  bank_name: yup.string().optional(),
});

interface UpdateProfileData {
  avatar_url: string;
  bank_account: string;
  bank_account_holder: string;
  bank_name: string;
  date_of_birth: string;
  full_name: string;
  phone: string;
  username: string;
}

function UpdateProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { profile, loading } = useSelector((state: RootState) => state.manageUser);

  const [formData, setFormData] = useState<UpdateProfileData>({
    avatar_url: "",
    bank_account: "",
    bank_account_holder: "",
    bank_name: "",
    date_of_birth: "",
    full_name: "",
    phone: "",
    username: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageAsset, setSelectedImageAsset] = useState<any>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        avatar_url: profile.avatar_url || "",
        bank_account: profile.bank_account || "",
        bank_account_holder: profile.bank_account_holder || "",
        bank_name: profile.bank_name || "",
        date_of_birth: profile.date_of_birth || "",
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        username: profile.username || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!profile) {
      dispatch(getUserProfileThunk());
    }
  }, [dispatch, profile]);

  const handleInputChange = (field: keyof UpdateProfileData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrors({});

    try {
      const dataToValidate = {
        ...formData,
        date_of_birth: formData.date_of_birth,
      };

      await UpdateProfileSchema.validate(dataToValidate, { abortEarly: false });

      const result = await dispatch(updateProfileThunk(formData));

      if (updateProfileThunk.fulfilled.match(result)) {
        Alert.alert("Success", "Profile updated successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        throw new Error((result.payload as string) || "Update failed");
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const newErrors: any = {};
        err.inner.forEach((error) => {
          if (error.path) newErrors[error.path] = error.message;
        });
        setErrors(newErrors);
      } else {
        Alert.alert("Error", "Failed to update profile. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const pickImageFromLibrary = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Permission to access media library is required!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      aspect: [1, 1],
    });

    if (!pickerResult.canceled && pickerResult.assets[0]) {
      const asset = pickerResult.assets[0];
      setFormData((prev) => ({ ...prev, avatar_url: asset.uri }));
      setSelectedImageAsset(asset);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Permission to access camera is required!");
      return;
    }

    const pickerResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      aspect: [1, 1],
    });

    if (!pickerResult.canceled && pickerResult.assets[0]) {
      const asset = pickerResult.assets[0];
      setFormData((prev) => ({ ...prev, avatar_url: asset.uri }));
      setSelectedImageAsset(asset);
    }
  };

  const removeAvatar = () => {
    setFormData((prev) => ({ ...prev, avatar_url: "" }));
    setSelectedImageAsset(null);
  };

  if (loading && !profile) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-gray-600">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
              className="flex-1"
              showsVerticalScrollIndicator={false}
            >
              <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm shadow-black/5 border border-slate-100">
                <Text className="text-base font-semibold text-gray-800 mb-3">Profile picture</Text>
                <View className="items-center mb-4">
                  <View className="w-24 h-24 rounded-full items-center justify-center mb-3 border border-slate-200 bg-slate-50 overflow-hidden">
                    {formData.avatar_url ? (
                      <Image
                        source={{ uri: formData.avatar_url }}
                        className="w-full h-full rounded-full"
                        onError={() => {
                          setFormData((prev) => ({ ...prev, avatar_url: "" }));
                        }}
                      />
                    ) : (
                      <View className="w-full h-full rounded-full bg-blue-50 items-center justify-center">
                        <Text className="text-3xl font-bold text-blue-600">
                          {formData.full_name?.charAt(0).toUpperCase() || "U"}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View className="flex-row gap-x-2">
                    <TouchableOpacity
                      onPress={pickImageFromLibrary}
                      className="flex-row items-center px-3 py-2 bg-blue-50 rounded-lg"
                      activeOpacity={0.7}
                    >
                      <Ionicons name="images-outline" size={16} color="#3b82f6" />
                      <Text className="text-blue-600 font-medium text-xs ml-1">Gallery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={takePhoto}
                      className="flex-row items-center px-3 py-2 bg-green-50 rounded-lg"
                      activeOpacity={0.7}
                    >
                      <Ionicons name="camera-outline" size={16} color="#10b981" />
                      <Text className="text-green-600 font-medium text-xs ml-1">Camera</Text>
                    </TouchableOpacity>

                    {formData.avatar_url && (
                      <TouchableOpacity
                        onPress={removeAvatar}
                        className="flex-row items-center px-3 py-2 bg-red-50 rounded-lg"
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                        <Text className="text-red-600 font-medium text-xs ml-1">Remove</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>

              <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm shadow-black/5 border border-slate-100">
                <Text className="text-base font-semibold text-gray-800 mb-1">
                  Basic information
                </Text>
                <Text className="text-xs text-gray-500 mb-3">
                  These details are used for your account and receipts.
                </Text>

                <AuthInput
                  label="Full Name *"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChangeText={handleInputChange("full_name")}
                  error={errors.full_name}
                />

                <AuthInput
                  label="Username *"
                  placeholder="john_doe"
                  value={formData.username}
                  onChangeText={handleInputChange("username")}
                  error={errors.username}
                />

                <AuthInput
                  label="Phone Number *"
                  placeholder="+84901234567 or +1234567890"
                  value={formData.phone}
                  onChangeText={handleInputChange("phone")}
                  error={errors.phone}
                />

                <AuthInput
                  label="Date of Birth * (YYYY-MM-DD)"
                  placeholder="1990-01-01"
                  value={formData.date_of_birth}
                  onChangeText={handleInputChange("date_of_birth")}
                  error={errors.date_of_birth}
                />
              </View>

              <View className="bg-white rounded-2xl p-4 shadow-sm shadow-black/5 border border-slate-100">
                <Text className="text-base font-semibold text-gray-800 mb-1">Bank information</Text>
                <Text className="text-xs text-gray-500 mb-3">
                  Used for payouts and refunds (optional).
                </Text>

                <AuthInput
                  label="Bank Name"
                  placeholder="Techcombank, VietinBank, BIDV, etc."
                  value={formData.bank_name}
                  onChangeText={handleInputChange("bank_name")}
                  error={errors.bank_name}
                />

                <AuthInput
                  label="Account Holder Name"
                  placeholder="Trần Dần"
                  value={formData.bank_account_holder}
                  onChangeText={handleInputChange("bank_account_holder")}
                  error={errors.bank_account_holder}
                />

                <AuthInput
                  label="Account Number"
                  placeholder="123456789"
                  value={formData.bank_account}
                  onChangeText={handleInputChange("bank_account")}
                  error={errors.bank_account}
                />
              </View>
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 pb-4 pt-3">
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.85}
                className={`w-full py-3 rounded-xl items-center justify-center ${
                  isSubmitting ? "bg-primary" : "bg-primary/70"
                }`}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white font-semibold text-base">Save changes</Text>
                )}
              </TouchableOpacity>
            </View>

            {isSubmitting && (
              <View className="absolute inset-0 bg-black/20 justify-center items-center">
                <View className="bg-white rounded-2xl px-6 py-5 items-center shadow-lg">
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text className="mt-3 text-gray-800 font-medium text-sm">
                    Updating profile...
                  </Text>
                </View>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default UpdateProfileScreen;
