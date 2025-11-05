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

export {
  createShippingAddressThunk,
  getDistrictsThunk,
  getProvincesThunk,
  getShippingAddressesThunk,
  getWardsThunk,
};
