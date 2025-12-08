import type { UploadResponse } from "@/libs/types/file";
import { createSlice } from "@reduxjs/toolkit";
import { uploadFilesThunk } from "./thunk";

interface ManageFileState {
  dataFiles: UploadResponse | null;
  loading: boolean;
  error?: any;
}

const initialState: ManageFileState = {
  dataFiles: null,
  loading: false,
  error: null,
};

export const manageFileSlice = createSlice({
  name: "manageFile",
  initialState,
  reducers: {
    resetFiles: (state) => {
      state.dataFiles = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadFilesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadFilesThunk.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.dataFiles = payload;
      })
      .addCase(uploadFilesThunk.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { reducer: manageFileReducer, actions: manageFileActions } = manageFileSlice;
