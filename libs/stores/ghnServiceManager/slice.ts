import { Response } from "@/libs/types/common";
import { CaculateDeliveryFeeResponse, DeliveryService } from "@/libs/types/ghn";
import { createSlice } from "@reduxjs/toolkit";
import { caculateDeliveryFeeThunk, getDeliveryServicesByDistrictThunk } from "./thunk";

const ghnServiceManagerSlice = createSlice({
  name: "ghnServiceManager",
  initialState: {
    deliveryServices: [] as Response<DeliveryService> | [],
    deliveryFee: null as Response<CaculateDeliveryFeeResponse> | null,
    loading: false,
    errors: null as any,
  },
  reducers: {
    setDeliveryServices: (state, action) => {
      state.deliveryServices = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(caculateDeliveryFeeThunk.pending, (state) => {
        state.loading = true;
        state.errors = null;
      })
      .addCase(caculateDeliveryFeeThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.deliveryFee = action.payload;
      })
      .addCase(caculateDeliveryFeeThunk.rejected, (state, action) => {
        state.loading = false;
        state.errors = action.payload;
      })
      .addCase(getDeliveryServicesByDistrictThunk.pending, (state) => {
        state.loading = true;
        state.errors = null;
      })
      .addCase(getDeliveryServicesByDistrictThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.deliveryServices = action.payload;
      })
      .addCase(getDeliveryServicesByDistrictThunk.rejected, (state, action) => {
        state.loading = false;
        state.errors = action.payload;
      });
  },
});

export const { reducer: ghnServiceManagerReducer, actions: ghnServiceManagerActions } =
  ghnServiceManagerSlice;
