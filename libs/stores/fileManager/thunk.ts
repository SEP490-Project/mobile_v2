import { manageFile } from "@/libs/services/manageFile";
import { FilePayload, UploadResponse } from "@/libs/types/file";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const uploadFilesThunk = createAsyncThunk<UploadResponse, FilePayload>(
  "manageFile/uploadFiles",
  async (payload, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("userId", payload.userId);
      payload.files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await manageFile.uploadFile(formData);
      return response.data.urls;
    } catch (error) {
      console.error("Upload error:", error);
      return rejectWithValue(error);
    }
  },
);
