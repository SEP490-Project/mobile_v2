import { Response } from "@/libs/types/common";
import { Product } from "@/libs/types/product";
import { createSlice } from "@reduxjs/toolkit";
import {
  getAllLimitedProductsThunk,
  getAllProductsThunk,
  getAllStandardProductsThunk,
  getFilteredProductsThunk,
  getProductDetailsThunk,
} from "./thunk";

const productManagerSlice = createSlice({
  name: "productManager",
  initialState: {
    allProducts: null as Response<Product[]> | null,
    filteredProducts: null as Response<Product[]> | null,
    productDetail: null as Response<Product> | null,
    allStandardProducts: null as Response<Product[]> | null,
    allLimitedProducts: null as Response<Product[]> | null,

    loadingAll: false,
    loadingFiltered: false,
    loadingDetail: false,
    loadingStandard: false,
    loadingLimited: false,
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
      })
      .addCase(getAllStandardProductsThunk.pending, (state) => {
        state.loadingStandard = true;
      })
      .addCase(getAllStandardProductsThunk.fulfilled, (state, action) => {
        state.loadingStandard = false;
        const currentPage = action.payload.pagination?.page ?? 1;
        if (currentPage === 1) {
          state.allStandardProducts = action.payload;
        } else {
          state.allStandardProducts = {
            ...action.payload,
            data: [...(state.allStandardProducts?.data || []), ...(action.payload.data || [])],
          };
        }
      })
      .addCase(getAllStandardProductsThunk.rejected, (state, action) => {
        state.loadingStandard = false;
        state.error = action.payload as string;
      })
      .addCase(getAllLimitedProductsThunk.pending, (state) => {
        state.loadingLimited = true;
      })
      .addCase(getAllLimitedProductsThunk.fulfilled, (state, action) => {
        state.loadingLimited = false;
        const currentPage = action.payload.pagination?.page ?? 1;
        if (currentPage === 1) {
          state.allLimitedProducts = action.payload;
        } else {
          state.allLimitedProducts = {
            ...action.payload,
            data: [...(state.allLimitedProducts?.data || []), ...(action.payload.data || [])],
          };
        }
      })
      .addCase(getAllLimitedProductsThunk.rejected, (state, action) => {
        state.loadingLimited = false;
        state.error = action.payload as string;
      });
  },
});

export const { reducer: managerProductsReducer, actions: productManagerActions } =
  productManagerSlice;
