import manageLocation from "@/libs/services/manageLocation";
import { Response } from "@/libs/types/common";
import { CreateShippingAddressPayload, ShippingAddressData } from "@/libs/types/location";
import { createAsyncThunk } from "@reduxjs/toolkit";

const createShippingAddressThunk = createAsyncThunk(
  "locationManager/createShippingAddress",
  async (data: CreateShippingAddressPayload, { rejectWithValue }) => {
    try {
      const response = await manageLocation.createShippingAddress(data);
      return response.data as Response<ShippingAddressData>;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create shipping address");
    }
  },
);

const getShippingAddressesThunk = createAsyncThunk(
  "locationManager/getShippingAddresses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await manageLocation.getShippingAddresses();
      return response.data as Response<ShippingAddressData[]>;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch shipping addresses");
    }
  },
);

const getShippingAddressByIdThunk = createAsyncThunk(
  "locationManager/getShippingAddressById",
  async (addressId: string, { rejectWithValue }) => {
    try {
      const response = await manageLocation.getShippingAddressById(addressId);
      return response.data as Response<ShippingAddressData>;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch shipping address");
    }
  },
);

const updateShippingAddressThunk = createAsyncThunk(
  "locationManager/updateShippingAddress",
  async (
    { addressId, data }: { addressId: string; data: CreateShippingAddressPayload },
    { rejectWithValue },
  ) => {
    try {
      const response = await manageLocation.updateShippingAddress(addressId, data);
      return response.data as Response<ShippingAddressData>;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update shipping address");
    }
  },
);

const deleteShippingAddressThunk = createAsyncThunk(
  "locationManager/deleteShippingAddress",
  async (addressId: string, { rejectWithValue }) => {
    try {
      const response = await manageLocation.deleteShippingAddress(addressId);
      return response.data as Response<any>;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete shipping address");
    }
  },
);

const getProvincesThunk = createAsyncThunk(
  "locationManager/getProvinces",
  async (_, { rejectWithValue }) => {
    try {
      const response = await manageLocation.getProvincesByGHN();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch provinces");
    }
  },
);

const getDistrictsThunk = createAsyncThunk(
  "locationManager/getDistricts",
  async (provinceId: number, { rejectWithValue }) => {
    try {
      const response = await manageLocation.getDistrictsByGHNFromProvince(provinceId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch districts");
    }
  },
);

const getWardsThunk = createAsyncThunk(
  "locationManager/getWards",
  async (districtId: number, { rejectWithValue }) => {
    try {
      const response = await manageLocation.getWardsByGHNFromDistrict(districtId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch wards");
    }
  },
);

const setDefaultShippingAddressThunk = createAsyncThunk(
  "locationManager/setDefaultShippingAddress",
  async (addressId: string, { rejectWithValue }) => {
    try {
      const response = await manageLocation.setDefaultAddress(addressId);
      return response.data as any;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to set default shipping address",
      );
    }
  },
);

export {
  createShippingAddressThunk,
  deleteShippingAddressThunk,
  getDistrictsThunk,
  getProvincesThunk,
  getShippingAddressByIdThunk,
  getShippingAddressesThunk,
  getWardsThunk,
  setDefaultShippingAddressThunk,
  updateShippingAddressThunk,
};
