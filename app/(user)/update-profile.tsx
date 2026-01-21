import { AuthInput } from "@/components/guest";
import { SearchableDropdown } from "@/components/ui/searchable-dropdown";
import { useBank } from "@/libs/hooks/useBank";
import { AppDispatch, RootState } from "@/libs/stores";
import { bankList } from "@/libs/stores/bankManager/thunk";
import { uploadFilesThunk } from "@/libs/stores/fileManager/thunk";
import { getUserProfileThunk, updateProfileThunk } from "@/libs/stores/userManager/thunk";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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
    .test("phone-format", "Please enter a valid phone number", (value) => {
      if (!value) return false;
      // Accept both 0xxxxxxxxx and +84xxxxxxxxx formats
      const phoneRegex = /^(0\d{9}|\+84\d{9})$/;
      return phoneRegex.test(value.replace(/\s/g, ""));
    })
    .required("Phone number is required"),
  date_of_birth: yup
    .string()
    .test("date-format", "Date of birth is required", (value) => {
      if (!value) return false;
      // Accept both YYYY-MM-DD and ISO format
      const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}.\d{3}Z)?$/;
      return dateRegex.test(value);
    })
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

// Phone formatting functions
const formatPhoneForDisplay = (phone: string): string => {
  if (!phone) return "";
  // Convert +84xxxxxxxxx to 0xxxxxxxxx for display
  if (phone.startsWith("+84")) {
    return "0" + phone.substring(3);
  }
  return phone;
};

const formatPhoneForSubmit = (phone: string): string => {
  if (!phone) return "";
  const cleaned = phone.replace(/\s/g, "");
  // Convert 0xxxxxxxxx to +84xxxxxxxxx for submit
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    return "+84" + cleaned.substring(1);
  }
  return cleaned;
};

function UpdateProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, loading } = useSelector((state: RootState) => state.manageUser);
  const { bank: banks, loading: bankLoading } = useBank();

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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageAsset, setSelectedImageAsset] = useState<any>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (profile) {
      setFormData({
        avatar_url: profile.avatar_url || "",
        bank_account: profile.bank_info?.bank_account_holder || "", // số tài khoản (1234567890)
        bank_account_holder: profile.bank_info?.bank_account || "", // tên chủ tài khoản (TRANMAIQUANGKHAI)
        bank_name: profile.bank_info?.bank_name || "",
        date_of_birth: profile.date_of_birth || "",
        full_name: profile.full_name || "",
        phone: formatPhoneForDisplay(profile.phone || ""),
        username: profile.username || "",
      });

      // Set initial date for picker
      if (profile.date_of_birth) {
        const date = new Date(profile.date_of_birth);
        if (!isNaN(date.getTime())) {
          setSelectedDate(date);
        }
      }
    }
  }, [profile]);

  useEffect(() => {
    if (!profile) {
      dispatch(getUserProfileThunk());
    }
  }, [dispatch, profile]);

  useEffect(() => {
    dispatch(bankList());
  }, [dispatch]);

  const handleInputChange = (field: keyof UpdateProfileData) => (value: string) => {
    let processedValue = value;

    // Special handling for account holder name
    if (field === "bank_account_holder") {
      // Don't trim while typing, allow spaces, but convert to uppercase
      processedValue = value.toUpperCase();
    } else if (field === "phone") {
      // Format phone number as user types
      const cleaned = value.replace(/\s/g, "");
      // Only allow numbers and + at start
      const phoneOnly = cleaned.replace(/[^0-9+]/g, "");

      if (phoneOnly.startsWith("+84")) {
        processedValue = phoneOnly;
      } else if (phoneOnly.startsWith("0")) {
        processedValue = phoneOnly;
      } else if (phoneOnly.startsWith("84")) {
        processedValue = "+" + phoneOnly;
      } else {
        processedValue = phoneOnly;
      }
    } else if (field === "full_name") {
      // Don't trim full_name while typing, allow spaces
      processedValue = value;
    } else {
      // For other fields, trim as usual
      processedValue = value.trim();
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setSelectedDate(selectedDate);
      // Format as ISO string with timezone for server
      const formattedDate = selectedDate.toISOString();
      setFormData((prev) => ({ ...prev, date_of_birth: formattedDate }));
      if (errors.date_of_birth) {
        setErrors((prev) => ({ ...prev, date_of_birth: "" }));
      }
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const getChangedFields = () => {
    if (!profile) return formData;

    const changedData: Partial<UpdateProfileData> = {};

    Object.keys(formData).forEach((key) => {
      const field = key as keyof UpdateProfileData;
      let originalValue = "";
      let currentValue = formData[field] || "";

      // Map original values correctly from profile structure
      if (field === "bank_account") {
        originalValue = profile.bank_info?.bank_account_holder || ""; // số tài khoản
      } else if (field === "bank_account_holder") {
        originalValue = profile.bank_info?.bank_account || ""; // tên chủ tài khoản
      } else if (field === "bank_name") {
        originalValue = profile.bank_info?.bank_name || "";
      } else {
        originalValue = profile[field] || "";
      }

      // Special handling for account holder name - trim for comparison
      if (field === "bank_account_holder") {
        originalValue = originalValue.trim();
        currentValue = currentValue.trim();
      } else if (field === "phone") {
        // Compare formatted phone numbers
        originalValue = formatPhoneForDisplay(originalValue);
        currentValue = formatPhoneForDisplay(currentValue);
      }

      if (originalValue !== currentValue) {
        if (field === "bank_account_holder") {
          changedData[field] = currentValue;
        } else if (field === "phone") {
          changedData[field] = formatPhoneForSubmit(currentValue);
        } else if (field === "full_name") {
          changedData[field] = currentValue.trim(); // Only trim when submitting
        } else {
          changedData[field] = formData[field];
        }
      }
    });

    return changedData;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrors({});

    try {
      // Prepare data for validation with properly formatted data
      const dataToValidate = {
        ...formData,
        bank_account_holder: formData.bank_account_holder?.trim() || "",
        phone: formatPhoneForSubmit(formData.phone || ""),
        date_of_birth: formData.date_of_birth,
        full_name: formData.full_name?.trim() || "",
      };

      await UpdateProfileSchema.validate(dataToValidate, { abortEarly: false });

      const changedData = getChangedFields();

      if (Object.keys(changedData).length === 0) {
        Alert.alert("No Changes", "No changes detected to save.");
        setIsSubmitting(false);
        return;
      }

      // Handle avatar upload if changed
      if (changedData.avatar_url !== undefined && selectedImageAsset) {
        try {
          const file = {
            uri: selectedImageAsset.uri,
            name: selectedImageAsset.fileName || `avatar_${Date.now()}.jpg`,
            type: selectedImageAsset.mimeType || selectedImageAsset.type || "image/jpeg",
          };

          const filePayload = {
            userId: profile?.id ?? "",
            files: [file] as unknown as File[],
          };

          const uploadResult = await dispatch(uploadFilesThunk(filePayload as any));

          if (uploadFilesThunk.fulfilled.match(uploadResult)) {
            const uploadedFiles = uploadResult.payload;
            if (Array.isArray(uploadedFiles) && uploadedFiles.length > 0) {
              const first = uploadedFiles[0];
              changedData.avatar_url = typeof first === "string" ? first : (first?.url ?? "");
            }
          } else {
            console.error("Upload failed:", uploadResult);
            throw new Error("Failed to upload image. Please try again.");
          }
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error("Failed to upload image. Please try again.");
        }
      }

      // Ensure account holder name is properly trimmed before sending
      if (changedData.bank_account_holder !== undefined) {
        changedData.bank_account_holder = changedData.bank_account_holder.trim();
      }

      // Ensure phone number is properly formatted before sending
      if (changedData.phone !== undefined) {
        changedData.phone = formatPhoneForSubmit(changedData.phone);
      }

      const result = await dispatch(updateProfileThunk(changedData));

      if (updateProfileThunk.fulfilled.match(result)) {
        Alert.alert("Success", "Profile updated successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
        setSelectedImageAsset(null);
      } else {
        console.error("Update profile failed:", result);
        const errorMessage =
          result.error?.message ||
          (typeof result.payload === "string" ? result.payload : "Update failed");
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error("HandleSubmit error:", err);
      if (err instanceof yup.ValidationError) {
        const newErrors: any = {};
        err.inner.forEach((error) => {
          if (error.path) newErrors[error.path] = error.message;
        });
        setErrors(newErrors);
      } else {
        let errorMessage = "Failed to update profile. Please try again.";

        if (typeof err === "string") {
          errorMessage = err;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        } else if (err && typeof err === "object" && "message" in err) {
          errorMessage = String(err.message);
        }

        Alert.alert("Error", errorMessage);
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

  const handleBankSelect = (bank: { id: string | number; name: string }) => {
    // Find the actual bank by ID and use its original name
    const selectedBank = banks.find((b) => b.id === bank.id);
    if (selectedBank) {
      setFormData((prev) => ({ ...prev, bank_name: selectedBank.name }));
    }
    if (errors.bank_name) {
      setErrors((prev) => ({ ...prev, bank_name: "" }));
    }
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
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 16 : 0}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
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
                  placeholder="0901234567"
                  value={formData.phone}
                  onChangeText={handleInputChange("phone")}
                  error={errors.phone}
                />

                {/* Date of Birth Picker */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Date of Birth *</Text>
                  <TouchableOpacity
                    onPress={showDatePickerModal}
                    className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text
                        className={`text-base ${
                          formData.date_of_birth ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {formData.date_of_birth
                          ? new Date(formData.date_of_birth).toLocaleDateString()
                          : "Select date of birth"}
                      </Text>
                      <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                    </View>
                  </TouchableOpacity>
                  {errors.date_of_birth && (
                    <Text className="text-red-500 text-xs mt-1">{errors.date_of_birth}</Text>
                  )}
                </View>
              </View>

              <View className="bg-white rounded-2xl p-4 shadow-sm shadow-black/5 border border-slate-100">
                <Text className="text-base font-semibold text-gray-800 mb-1">Bank information</Text>
                <Text className="text-xs text-gray-500 mb-3">
                  Used for payouts and refunds (optional).
                </Text>

                <SearchableDropdown
                  label="Bank Name"
                  placeholder="Select bank"
                  data={banks.map((bank) => ({
                    id: bank.id,
                    name: `${bank.name} (${bank.shortName})`,
                  }))}
                  selectedValue={banks.find((bank) => bank.name === formData.bank_name)?.id || null}
                  onSelect={handleBankSelect}
                  error={errors.bank_name}
                  disabled={bankLoading}
                />

                <AuthInput
                  label="Account Holder Name"
                  placeholder="Account Holder Name"
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

            <View
              className="absolute left-0 right-0 bg-white border-t border-slate-200 px-4 pb-4 pt-3"
              style={{
                bottom: insets.bottom || 8,
              }}
            >
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.85}
                className={`w-full py-3 rounded-xl items-center justify-center ${
                  isSubmitting ? "bg-primary/70" : "bg-primary"
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

            {/* DateTimePicker Modal */}
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
              />
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default UpdateProfileScreen;
