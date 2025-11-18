import { manageContent } from "@/libs/services/manageContent";
import type { ContentFilter } from "@/libs/types/content";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

export const getAllContents = createAsyncThunk(
  "/contents",
  async (req: ContentFilter, { rejectWithValue }) => {
    try {
      const response = await manageContent.getAllContent(req);
      return response.data;
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || "Failed to fetch contents");
    }
  },
);

export const contentDetail = createAsyncThunk(
  "/contents/detail",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await manageContent.contentDetail(id);
      return response.data;
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || "Failed to fetch content detail");
    }
  },
);
