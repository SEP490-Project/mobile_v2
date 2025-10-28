import manageProducts from "@/libs/services/mangeProducts";
import { Response } from "@/libs/types/common";
import { Product } from "@/libs/types/product";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

const getAllProductsThunk = createAsyncThunk(
  "productManager/getAllProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await manageProducts.getAllProducts();
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

export { getAllProductsThunk, getProductDetailsThunk };
