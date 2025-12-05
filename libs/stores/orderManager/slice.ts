import { Response } from "@/libs/types/common";
import { OrderData, PlaceOrderAndPayResponse } from "@/libs/types/order";
import { PreOrderData } from "@/libs/types/pre-order";
import { createSlice } from "@reduxjs/toolkit";
import {
  createPreOrderThunk,
  getOrdersThunk,
  getPreOrdersThunk,
  placeOrderAndPayForLimitedProductThunk,
  placeOrderAndPayThunk,
  receiveOrderThunk,
  receivePreOrderThunk,
  requestCompensateOrderThunk,
  requestRefundOrderThunk,
} from "./thunk";

const orderManagerSlice = createSlice({
  name: "orderManager",
  initialState: {
    orderList: null as Response<OrderData[]> | null,
    preOrderList: null as Response<PreOrderData[]> | null,
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
      })
      .addCase(placeOrderAndPayForLimitedProductThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrderAndPayForLimitedProductThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.payOrderResult = action.payload;
        state.error = null;
      })
      .addCase(placeOrderAndPayForLimitedProductThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(receiveOrderThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(receiveOrderThunk.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(receiveOrderThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createPreOrderThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPreOrderThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.payOrderResult = action.payload;
        state.error = null;
      })
      .addCase(createPreOrderThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getPreOrdersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPreOrdersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.preOrderList = action.payload;
        state.error = null;
      })
      .addCase(getPreOrdersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(requestCompensateOrderThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestCompensateOrderThunk.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(requestCompensateOrderThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(requestRefundOrderThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestRefundOrderThunk.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(requestRefundOrderThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(receivePreOrderThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(receivePreOrderThunk.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(receivePreOrderThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { reducer: manageOrderReducer, actions: manageOrderActions } = orderManagerSlice;
