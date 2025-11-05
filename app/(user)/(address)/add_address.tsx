import { AuthInput } from "@/components/guest";
import { SearchableDropdown } from "@/components/ui";
import { RootState, useAppDispatch } from "@/libs/stores";
import { manageLocationActions } from "@/libs/stores/locationManager/slice";
import {
  createShippingAddressThunk,
  getDistrictsThunk,
  getProvincesThunk,
  getShippingAddressesThunk,
  getWardsThunk,
} from "@/libs/stores/locationManager/thunk";
import { CreateShippingAddressPayload } from "@/libs/types/location";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import * as yup from "yup";

const addAddressSchema = yup.object().shape({
  full_name: yup.string().required("Full name is required"),
  phone_number: yup
    .string()
    .matches(/^[0-9]{10,11}$/, "Phone number must be 10-11 digits")
    .required("Phone number is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  street: yup.string().required("Street address is required"),
  address_line_2: yup.string().optional(),
  city: yup.string().required("City is required"),
  country: yup.string().required("Country is required"),
  ghn_province_id: yup.number().required("Province is required"),
  ghn_district_id: yup.number().required("District is required"),
  ghn_ward_code: yup.string().required("Ward is required"),
  is_default: yup.boolean(),
  postal_code: yup.string().optional(),
  type: yup.string().optional(),
});

const AddAddress = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { provinces, districts, wards, loading } = useSelector(
    (state: RootState) => state.manageLocation,
  );

  const [formData, setFormData] = useState<CreateShippingAddressPayload>({
    full_name: "",
    phone_number: "",
    email: "",
    street: "",
    address_line_2: "",
    city: "",
    country: "Vietnam",
    ghn_province_id: 0,
    ghn_district_id: 0,
    ghn_ward_code: "",
    is_default: false,
    postal_code: "",
    type: "SHIPPING",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(getProvincesThunk());
  }, [dispatch]);

  const handleProvinceChange = (item: { id: string | number; name: string }) => {
    setFormData((prev) => ({
      ...prev,
      ghn_province_id: Number(item.id),
      ghn_district_id: 0,
      ghn_ward_code: "",
      city: item.name,
    }));
    dispatch(manageLocationActions.clearDistricts());
    dispatch(manageLocationActions.clearWards());
    dispatch(getDistrictsThunk(Number(item.id)));
  };

  const handleDistrictChange = (item: { id: string | number; name: string }) => {
    setFormData((prev) => ({
      ...prev,
      ghn_district_id: Number(item.id),
      ghn_ward_code: "",
    }));
    dispatch(manageLocationActions.clearWards());
    dispatch(getWardsThunk(Number(item.id)));
  };

  const handleWardChange = (item: { id: string | number; name: string }) => {
    setFormData((prev) => ({
      ...prev,
      ghn_ward_code: String(item.id),
    }));
  };

  const validateForm = async () => {
    try {
      await addAddressSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const validationErrors: Record<string, string> = {};
        err.inner.forEach((error) => {
          if (error.path) {
            validationErrors[error.path] = error.message;
          }
        });
        setErrors(validationErrors);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    const isValid = await validateForm();
    if (!isValid) {
      Alert.alert("Validation Error", "Please fill in all required fields correctly");
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(createShippingAddressThunk(formData)).unwrap();
      Alert.alert("Success", "Address added successfully", [
        {
          text: "OK",
          onPress: () => {
            dispatch(getShippingAddressesThunk());
            router.back();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error || "Failed to add address. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const provincesData = provinces.map((p) => ({
    id: p.ProvinceID,
    name: p.ProvinceName,
  }));

  const districtsData = districts.map((d) => ({
    id: d.DistrictID,
    name: d.DistrictName,
  }));

  const wardsData = wards.map((w) => ({
    id: w.WardCode,
    name: w.WardName,
  }));

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="relative flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 bg-gray-50 rounded-full absolute left-4 z-50"
              activeOpacity={0.7}
            >
              <MaterialIcons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-gray-800 font-semibold text-xl text-center w-full">
              Add New Address
            </Text>
          </View>

          {/* Form */}
          <View className="px-4 py-4">
            {/* Contact Information */}
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 mb-4">Contact Information</Text>

              <AuthInput
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.full_name}
                onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                error={errors.full_name}
              />

              <AuthInput
                label="Phone Number"
                placeholder="Enter your phone number"
                value={formData.phone_number}
                onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
                error={errors.phone_number}
              />

              <AuthInput
                label="Email"
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                error={errors.email}
              />
            </View>

            {/* Address Details */}
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 mb-4">Address Details</Text>

              <SearchableDropdown
                label="Province/City"
                placeholder="Select province"
                data={provincesData}
                selectedValue={formData.ghn_province_id || null}
                onSelect={handleProvinceChange}
                error={errors.ghn_province_id}
              />

              <SearchableDropdown
                label="District"
                placeholder="Select district"
                data={districtsData}
                selectedValue={formData.ghn_district_id || null}
                onSelect={handleDistrictChange}
                error={errors.ghn_district_id}
                disabled={!formData.ghn_province_id}
              />

              <SearchableDropdown
                label="Ward"
                placeholder="Select ward"
                data={wardsData}
                selectedValue={formData.ghn_ward_code || null}
                onSelect={handleWardChange}
                error={errors.ghn_ward_code}
                disabled={!formData.ghn_district_id}
              />

              <AuthInput
                label="Street Address"
                placeholder="Enter street address"
                value={formData.street}
                onChangeText={(text) => setFormData({ ...formData, street: text })}
                error={errors.street}
              />

              <AuthInput
                label="Address Line 2 (Optional)"
                placeholder="Apartment, suite, etc."
                value={formData.address_line_2}
                onChangeText={(text) => setFormData({ ...formData, address_line_2: text })}
              />

              <AuthInput
                label="Postal Code (Optional)"
                placeholder="Enter postal code"
                value={formData.postal_code}
                onChangeText={(text) => setFormData({ ...formData, postal_code: text })}
              />
            </View>

            {/* Settings */}
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-gray-800 font-semibold text-base">
                    Set as Default Address
                  </Text>
                  <Text className="text-gray-500 text-sm mt-1">
                    Use this address for future orders
                  </Text>
                </View>
                <Switch
                  value={formData.is_default}
                  onValueChange={(value) => setFormData({ ...formData, is_default: value })}
                  trackColor={{ false: "#D1D5DB", true: "#FCA5A5" }}
                  thumbColor={formData.is_default ? "#EF4444" : "#F3F4F6"}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting || loading}
              className={`rounded-xl py-4 items-center justify-center ${
                submitting || loading ? "bg-gray-300" : "bg-rose-500"
              }`}
              activeOpacity={0.7}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View className="flex-row items-center">
                  <MaterialIcons name="check" size={24} color="#fff" />
                  <Text className="text-white font-semibold text-lg ml-2">Save Address</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddAddress;
