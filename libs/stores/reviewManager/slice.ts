import { Response } from "@/libs/types/common";
import { ReviewData } from "@/libs/types/review";
import { createSlice } from "@reduxjs/toolkit";
import { createReviewThunk, getReviewThunk } from "./thunk";

const reviewManagerSlice = createSlice({
  name: "reviewManager",
  initialState: {
    reviews: null as Response<ReviewData[]> | null,
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getReviewThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReviewThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
        state.error = null;
      })
      .addCase(getReviewThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createReviewThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReviewThunk.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(createReviewThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { reducer: manageReviewReducer, actions: reviewManagerActions } = reviewManagerSlice;
