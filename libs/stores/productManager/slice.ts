import { Response } from "@/libs/types/common";
import { Product } from "@/libs/types/product";
import { createSlice } from "@reduxjs/toolkit";
import { getAllProductsThunk, getFilteredProductsThunk, getProductDetailsThunk } from "./thunk";

interface ProductState {
  allProducts: Response<Product[]> | null;
  filteredProducts: Product[];
  productDetail: Response<Product> | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  } | null;
  loadingAll: boolean;
  loadingFiltered: boolean;
  loadingDetail: boolean;
  error: string | null;
}

const initialState: ProductState = {
  allProducts: null,
  filteredProducts: [],
  productDetail: null,
  pagination: null,
  loadingAll: false,
  loadingFiltered: false,
  loadingDetail: false,
  error: null,
};

const productManagerSlice = createSlice({
  name: "productManager",
  initialState,
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
        const pagination = action.payload?.pagination || null;
        const page = pagination?.page ?? ((action.meta && (action.meta.arg as any)?.page) || 1);
        const newData: Product[] = action.payload?.data || [];
        if (page && page > 1) {
          state.filteredProducts = [...state.filteredProducts, ...newData];
        } else {
          state.filteredProducts = newData;
        }
        state.pagination = pagination;
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
