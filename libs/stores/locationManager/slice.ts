import { Response } from "@/libs/types/common";
import { District, Province, ShippingAddressData, Ward } from "@/libs/types/location";
import { createSlice } from "@reduxjs/toolkit";
import {
  createShippingAddressThunk,
  getDistrictsThunk,
  getProvincesThunk,
  getShippingAddressesThunk,
  getWardsThunk,
} from "./thunk";

const locationSlice = createSlice({
  name: "locationManager",
  initialState: {
    shippingAddresses: null as Response<ShippingAddressData[]> | null,
    provinces: [] as Province[],
    districts: [] as District[],
    wards: [] as Ward[],
    loading: false,
    errors: null as string | null,
  },
  reducers: {
    clearDistricts: (state) => {
      state.districts = [];
    },
    clearWards: (state) => {
      state.wards = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getShippingAddressesThunk.pending, (state) => {
        state.loading = true;
        state.errors = null;
      })
      .addCase(getShippingAddressesThunk.fulfilled, (state, action) => {
        state.shippingAddresses = action.payload;
        state.loading = false;
        state.errors = null;
      })
      .addCase(getShippingAddressesThunk.rejected, (state, action) => {
        state.shippingAddresses = null;
        state.loading = false;
        state.errors = action.payload as string;
      })
      .addCase(createShippingAddressThunk.pending, (state) => {
        state.loading = true;
        state.errors = null;
      })
      .addCase(createShippingAddressThunk.fulfilled, (state) => {
        state.loading = false;
        state.errors = null;
      })
      .addCase(createShippingAddressThunk.rejected, (state, action) => {
        state.loading = false;
        state.errors = action.payload as string;
      })
      .addCase(getProvincesThunk.pending, (state) => {
        state.loading = true;
        state.errors = null;
      })
      .addCase(getProvincesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.provinces = action.payload?.data || [];
        state.errors = null;
      })
      .addCase(getProvincesThunk.rejected, (state, action) => {
        state.loading = false;
        state.errors = action.payload as string;
      })
      .addCase(getDistrictsThunk.pending, (state) => {
        state.loading = true;
        state.errors = null;
      })
      .addCase(getDistrictsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.districts = action.payload?.data || [];
        state.errors = null;
      })
      .addCase(getDistrictsThunk.rejected, (state, action) => {
        state.loading = false;
        state.errors = action.payload as string;
      })
      .addCase(getWardsThunk.pending, (state) => {
        state.loading = true;
        state.errors = null;
      })
      .addCase(getWardsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.wards = action.payload?.data || [];
        state.errors = null;
      })
      .addCase(getWardsThunk.rejected, (state, action) => {
        state.loading = false;
        state.errors = action.payload as string;
      });
  },
});

export const { reducer: manageLocationReducer, actions: manageLocationActions } = locationSlice;
