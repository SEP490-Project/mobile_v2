import manageProducts from "@/libs/services/mangeProducts";
import { Response } from "@/libs/types/common";
import { Product, ProductFilter } from "@/libs/types/product";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

const getAllProductsThunk = createAsyncThunk(
  "productManager/getAllProducts",
  async (params: ProductFilter | undefined, { rejectWithValue }) => {
    try {
      const response = await manageProducts.getAllProducts(params || {});
      return response.data as Response<Product[]>;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch products",
      );
    }
  },
);

const getFilteredProductsThunk = createAsyncThunk(
  "productManager/getFilteredProducts",
  async (params: ProductFilter, { rejectWithValue }) => {
    try {
      const response = await manageProducts.getAllProducts(params);
      return response.data as Response<Product[]>;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch products",
      );
    }
  },
);

const getProductDetailsThunk = createAsyncThunk(
  "productManager/getProductDetails",
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await manageProducts.getProductDetails(productId);
      return response.data as Response<Product>;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch product details",
      );
    }
  },
);

export { getAllProductsThunk, getFilteredProductsThunk, getProductDetailsThunk };
