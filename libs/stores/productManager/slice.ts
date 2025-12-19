import { Response } from "@/libs/types/common";
import { Product } from "@/libs/types/product";
import { createSlice } from "@reduxjs/toolkit";
import { getAllProductsThunk, getFilteredProductsThunk, getProductDetailsThunk } from "./thunk";

const productManagerSlice = createSlice({
  name: "productManager",
  initialState: {
    allProducts: null as Response<Product[]> | null,
    filteredProducts: null as Response<Product[]> | null,
    productDetail: null as Response<Product> | null,

    loadingAll: false,
    loadingFiltered: false,
    loadingDetail: false,

    error: null as string | null,
  },
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getAllProductsThunk.pending, (state) => {
        state.loadingAll = true;
      })
      .addCase(getAllProductsThunk.fulfilled, (state, action) => {
        state.loadingAll = false;
        state.allProducts = action.payload;
      })
      .addCase(getAllProductsThunk.rejected, (state, action) => {
        state.loadingAll = false;
        state.error = action.payload as string;
      })
      .addCase(getFilteredProductsThunk.pending, (state) => {
        state.loadingFiltered = true;
      })
      .addCase(getFilteredProductsThunk.fulfilled, (state, action) => {
        state.loadingFiltered = false;
        state.filteredProducts = action.payload;
      })
      .addCase(getFilteredProductsThunk.rejected, (state, action) => {
        state.loadingFiltered = false;
        state.error = action.payload as string;
      })
      .addCase(getProductDetailsThunk.pending, (state) => {
        state.loadingDetail = true;
        state.error = null;
      })
      .addCase(getProductDetailsThunk.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.productDetail = action.payload;
      })
      .addCase(getProductDetailsThunk.rejected, (state, action) => {
        state.loadingDetail = false;
        state.error = action.payload as string;
      });
  },
});

export const { reducer: managerProductsReducer, actions: productManagerActions } =
  productManagerSlice;
