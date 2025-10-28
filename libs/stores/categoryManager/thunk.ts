import manageCategories from "@/libs/services/manageCategories";
import { Category } from "@/libs/types/category";
import { Response } from "@/libs/types/common";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

const getAllCategoriesThunk = createAsyncThunk(
  "categoryManager/getAllCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await manageCategories.getAllCategories();
      return response.data as Response<Category[]>;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch categories",
      );
    }
  },
);

export { getAllCategoriesThunk };
