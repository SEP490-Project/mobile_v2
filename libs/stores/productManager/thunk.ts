import manageProducts from "@/libs/services/mangeProducts";
import { Response } from "@/libs/types/common";
import { Product } from "@/libs/types/product";
import { createAsyncThunk } from "@reduxjs/toolkit";

const getAllProductsThunk = createAsyncThunk(
  "productManager/getAllProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await manageProducts.getAllProducts();
      return response.data as Response<Product[]>;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export { getAllProductsThunk };
