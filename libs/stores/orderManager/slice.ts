import { Response } from "@/libs/types/common";
import { OrderData, PlaceOrderAndPayResponse } from "@/libs/types/order";
import { createSlice } from "@reduxjs/toolkit";
import { getOrdersThunk, placeOrderAndPayThunk } from "./thunk";

const orderManagerSlice = createSlice({
  name: "orderManager",
  initialState: {
    orderList: null as Response<OrderData[]> | null,
    payOrderResult: null as Response<PlaceOrderAndPayResponse> | null,
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getOrdersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrdersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.orderList = action.payload;
        state.error = null;
      })
      .addCase(getOrdersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(placeOrderAndPayThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrderAndPayThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.payOrderResult = action.payload;
        state.error = null;
      })
      .addCase(placeOrderAndPayThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { reducer: manageOrderReducer, actions: manageOrderActions } = orderManagerSlice;
