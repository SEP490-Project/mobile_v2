import { AuthInput } from "@/components/guest";
import { SearchableDropdown } from "@/components/ui";
import { RootState, useAppDispatch } from "@/libs/stores";
import { manageLocationActions } from "@/libs/stores/locationManager/slice";
import {
  createShippingAddressThunk,
  deleteShippingAddressThunk,
  getDistrictsThunk,
  getProvincesThunk,
  getShippingAddressesThunk,
  getWardsThunk,
  setDefaultShippingAddressThunk,
  updateShippingAddressThunk,
} from "@/libs/stores/locationManager/thunk";
import { CreateShippingAddressPayload } from "@/libs/types/location";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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

const EditAddress = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { addressId } = useLocalSearchParams<{ addressId: string }>();

  const { provinces, districts, wards, loading, shippingAddresses } = useSelector(
    (state: RootState) => state.manageLocation,
  );

  const isEditMode = addressId !== "new";
  const existingAddress = shippingAddresses?.data?.find((addr) => addr.id === addressId);

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
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(getProvincesThunk());
  }, [dispatch]);

  // Load existing address data in edit mode
  useEffect(() => {
    if (isEditMode && existingAddress) {
      setFormData({
        full_name: existingAddress.full_name,
        phone_number: existingAddress.phone_number,
        email: existingAddress.email,
        street: existingAddress.street,
        address_line_2: existingAddress.address_line_2 || "",
        city: existingAddress.city,
        country: existingAddress.country,
        ghn_province_id: existingAddress.ghn_province_id,
        ghn_district_id: existingAddress.ghn_district_id,
        ghn_ward_code: existingAddress.ghn_ward_code,
        is_default: existingAddress.is_default,
        postal_code: existingAddress.postal_code || "",
        type: existingAddress.type,
      });

      // Load districts and wards for existing address
      if (existingAddress.ghn_province_id) {
        dispatch(getDistrictsThunk(existingAddress.ghn_province_id));
      }
      if (existingAddress.ghn_district_id) {
        dispatch(getWardsThunk(existingAddress.ghn_district_id));
      }
    }
  }, [isEditMode, existingAddress, dispatch]);

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
      if (isEditMode && addressId) {
        await dispatch(updateShippingAddressThunk({ addressId, data: formData })).unwrap();
        Alert.alert("Success", "Address updated successfully", [
          {
            text: "OK",
            onPress: () => {
              dispatch(getShippingAddressesThunk());
              router.back();
            },
          },
        ]);
      } else {
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
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error || `Failed to ${isEditMode ? "update" : "add"} address. Please try again.`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !addressId) return;

    Alert.alert("Delete Address", "Are you sure you want to delete this address?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeleting(true);
          try {
            await dispatch(deleteShippingAddressThunk(addressId)).unwrap();
            Alert.alert("Success", "Address deleted successfully", [
              {
                text: "OK",
                onPress: () => {
                  dispatch(getShippingAddressesThunk());
                  router.back();
                },
              },
            ]);
          } catch (error: any) {
            Alert.alert("Error", error || "Failed to delete address. Please try again.");
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  const handleDefaultToggle = async (value: boolean) => {
    if (isEditMode && addressId && value && !existingAddress?.is_default) {
      // Only call API if in edit mode, turning ON default, and it's not already default
      try {
        await dispatch(setDefaultShippingAddressThunk(addressId)).unwrap();
        setFormData({ ...formData, is_default: value });
        dispatch(getShippingAddressesThunk());
      } catch (error: any) {
        Alert.alert("Error", error || "Failed to set default address. Please try again.");
      }
    } else {
      // For new addresses or turning off default, just update local state
      setFormData({ ...formData, is_default: value });
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
              {isEditMode ? "Edit Address" : "Add New Address"}
            </Text>
            {isEditMode && (
              <TouchableOpacity
                onPress={handleDelete}
                className="p-2 bg-red-50 rounded-full absolute right-4 z-50"
                activeOpacity={0.7}
                disabled={deleting}
              >
                <MaterialIcons name="delete" size={24} color="#EF4444" />
              </TouchableOpacity>
            )}
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
                  onValueChange={handleDefaultToggle}
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
                  <Text className="text-white font-semibold text-lg ml-2">
                    {isEditMode ? "Update Address" : "Save Address"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditAddress;
