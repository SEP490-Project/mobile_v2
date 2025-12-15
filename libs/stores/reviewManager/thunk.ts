import manageReview from "@/libs/services/manageReview";
import { Response } from "@/libs/types/common";
import { ReviewData, ReviewParams } from "@/libs/types/review";
import { createAsyncThunk } from "@reduxjs/toolkit";

const getReviewThunk = createAsyncThunk(
  "reviewManager/getReview",
  async (
    { productId, params }: { productId: string; params?: ReviewParams | undefined },
    { rejectWithValue },
  ) => {
    try {
      const response = await manageReview.getReview(productId, params);
      return response.data as Response<ReviewData[]>;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch reviews");
    }
  },
);

const createReviewThunk = createAsyncThunk(
  "reviewManager/createReview",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await manageReview.createReview(formData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create review");
    }
  },
);

export { createReviewThunk, getReviewThunk };
