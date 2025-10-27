import { Response } from "@/libs/types/common";
import { Product } from "@/libs/types/product";
import { createSlice } from "@reduxjs/toolkit";
import { getAllProductsThunk, getProductDetailsThunk } from "./thunk";

const productManagerSlice = createSlice({
  name: "productManager",
  initialState: {
    products: null as Response<Product[]> | null,
    productDetail: null as Response<Product> | null,
    loading: false,
    error: null as string | null,
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
        state.error = action.payload as string;
      })
      .addCase(getProductDetailsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductDetailsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.productDetail = action.payload;
      })
      .addCase(getProductDetailsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { reducer: managerProductsReducer, actions: productManagerActions } =
  productManagerSlice;
