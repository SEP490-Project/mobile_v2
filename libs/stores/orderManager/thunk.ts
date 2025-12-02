import manageOrder from "@/libs/services/manageOrder";
import { Response } from "@/libs/types/common";
import { OrderData, PlaceOrderAndPayResponse } from "@/libs/types/order";
import { PreOrderData } from "@/libs/types/pre-order";
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

const placeOrderAndPayForLimitedProductThunk = createAsyncThunk(
  "orderManager/placeOrderAndPayForLimitedProduct",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await manageOrder.placeOrderAndPayForLimitedProduct(payload);
      return response.data as Response<PlaceOrderAndPayResponse>;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to place order for limited product",
      );
    }
  },
);

const receiveOrderThunk = createAsyncThunk(
  "orderManager/receiveOrder",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await manageOrder.receiveOrder(orderId);
      return response.data as any;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to receive order");
    }
  },
);

const createPreOrderThunk = createAsyncThunk(
  "orderManager/createPreOrder",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await manageOrder.createAPreoOrder(payload);
      return response.data as Response<PlaceOrderAndPayResponse>;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create pre-order");
    }
  },
);

const getPreOrdersThunk = createAsyncThunk(
  "orderManager/getPreOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await manageOrder.getPreOrders();
      return response.data as Response<PreOrderData[]>;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch pre-orders");
    }
  },
);

const requestCompensateOrderThunk = createAsyncThunk(
  "orderManager/requestCompensateOrder",
  async ({ orderId, file }: { orderId: string; file: FormData }, { rejectWithValue }) => {
    try {
      const response = await manageOrder.requestCompensateOrder(orderId, file);
      return response.data as any;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to request order compensation",
      );
    }
  },
);

const requestRefundOrderThunk = createAsyncThunk(
  "orderManager/requestRefundOrder",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await manageOrder.requestRefundOrder(orderId);
      return response.data as any;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to request order refund");
    }
  },
);

const requestCompensatePreOrderThunk = createAsyncThunk(
  "orderManager/requestCompensatePreOrder",
  async ({ preOrderId, file }: { preOrderId: string; file: FormData }, { rejectWithValue }) => {
    try {
      const response = await manageOrder.requestCompenstatePreOrder(preOrderId, file);
      return response.data as any;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to request pre-order compensation",
      );
    }
  },
);

const receivePreOrderThunk = createAsyncThunk(
  "orderManager/receivePreOrder",
  async (preOrderId: string, { rejectWithValue }) => {
    try {
      const response = await manageOrder.receivedPreOrder(preOrderId);
      return response.data as any;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to receive pre-order");
    }
  },
);

export {
  createPreOrderThunk,
  getOrdersThunk,
  getPreOrdersThunk,
  placeOrderAndPayForLimitedProductThunk,
  placeOrderAndPayThunk,
  receiveOrderThunk,
  receivePreOrderThunk,
  requestCompensateOrderThunk,
  requestCompensatePreOrderThunk,
  requestRefundOrderThunk,
};
