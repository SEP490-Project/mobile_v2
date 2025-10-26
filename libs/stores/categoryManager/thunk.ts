import manageCategories from "@/libs/services/manageCategories";
import { Category } from "@/libs/types/category";
import { Response } from "@/libs/types/common";
import { createAsyncThunk } from "@reduxjs/toolkit";

const getAllCategoriesThunk = createAsyncThunk(
  "categoryManager/getAllCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await manageCategories.getAllCategories();
      return response.data as Response<Category[]>;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export { getAllCategoriesThunk };
