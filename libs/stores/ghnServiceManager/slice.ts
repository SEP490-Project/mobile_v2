import { Response } from "@/libs/types/common";
import { CaculateDeliveryFeeResponse } from "@/libs/types/ghn";
import { createSlice } from "@reduxjs/toolkit";
import { caculateDeliveryFeeThunk } from "./thunk";

const ghnServiceManagerSlice = createSlice({
  name: "ghnServiceManager",
  initialState: {
    deliveryFee: null as Response<CaculateDeliveryFeeResponse> | null,
    loading: false,
    errors: null as any,
  },
  reducers: {},
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
      });
  },
});

export const { reducer: ghnServiceManagerReducer, actions: ghnServiceManagerActions } =
  ghnServiceManagerSlice;
