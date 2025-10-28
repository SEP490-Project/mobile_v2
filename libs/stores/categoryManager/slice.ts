import { Category } from "@/libs/types/category";
import { Response } from "@/libs/types/common";
import { createSlice } from "@reduxjs/toolkit";
import { getAllCategoriesThunk } from "./thunk";

const categoryManagerSlice = createSlice({
  name: "categoryManager",
  initialState: {
    categories: null as Response<Category[]> | null,
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getAllCategoriesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCategoriesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(getAllCategoriesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { reducer: manageCategoriesReducer, actions: categoryManagerActions } =
  categoryManagerSlice;
