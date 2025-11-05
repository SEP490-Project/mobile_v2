import manageOrder from "@/libs/services/manageOrder";
import { Response } from "@/libs/types/common";
import { OrderData, PlaceOrderAndPayResponse } from "@/libs/types/order";
import { createAsyncThunk } from "@reduxjs/toolkit";

const getOrdersThunk = createAsyncThunk(
  "orderManager/getOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await manageOrder.getOrders();
      return response.data as Response<OrderData[]>;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
    }
  },
);

const placeOrderAndPayThunk = createAsyncThunk(
  "orderManager/placeOrderAndPay",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await manageOrder.placeOrderAndPay(payload);
      return response.data as Response<PlaceOrderAndPayResponse>;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to place order");
    }
  },
);

export { getOrdersThunk, placeOrderAndPayThunk };
