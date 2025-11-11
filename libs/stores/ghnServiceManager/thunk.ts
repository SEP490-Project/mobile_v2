import manageGhnService from "@/libs/services/manageGhn";
import { Response } from "@/libs/types/common";
import { CaculateDeliveryFeePayload, CaculateDeliveryFeeResponse } from "@/libs/types/ghn";
import { createAsyncThunk } from "@reduxjs/toolkit";

const caculateDeliveryFeeThunk = createAsyncThunk(
  "ghnServiceManager/caculateDeliveryFee",
  async (payload: CaculateDeliveryFeePayload, { rejectWithValue }) => {
    try {
      const response = await manageGhnService.caculateDeliveryFee(payload);
      return response.data as Response<CaculateDeliveryFeeResponse>;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  },
);

const caculateDeliveryFeeForOrderThunk = createAsyncThunk(
  "ghnServiceManager/caculateDeliveryFeeForOrder",
  async ({ orderId }: { orderId: string }, { rejectWithValue }) => {
    try {
      const response = await manageGhnService.caculateDeliveryFeeForOrder(orderId);
      return response.data as Response<CaculateDeliveryFeeResponse>;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  },
);

export { caculateDeliveryFeeForOrderThunk, caculateDeliveryFeeThunk };
