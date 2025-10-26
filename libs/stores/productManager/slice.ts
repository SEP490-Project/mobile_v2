import { Response } from "@/libs/types/common";
import { Product } from "@/libs/types/product";
import { createSlice } from "@reduxjs/toolkit";
import { getAllProductsThunk } from "./thunk";

const productManagerSlice = createSlice({
  name: "productManager",
  initialState: {
    products: null as Response<Product[]> | null,
    loading: false,
    error: null as any,
  },
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getAllProductsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProductsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(getAllProductsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { reducer: managerProductsReducer, actions: productManagerActions } =
  productManagerSlice;
