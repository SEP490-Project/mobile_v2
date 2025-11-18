import type { ListContent } from "@/libs/types/content";
import { createSlice } from "@reduxjs/toolkit";
import { contentDetail, getAllContents } from "./thunk";

interface stateType {
  loading: boolean;
  contents: ListContent[];
  content: ListContent | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  } | null;
}

const initialState: stateType = {
  loading: false,
  contents: [],
  content: null,
  pagination: null,
};

export const manageContentSlice = createSlice({
  name: "manageContent",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllContents.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllContents.fulfilled, (state, action) => {
        state.loading = false;
        state.contents = action.payload.data || [];
        state.pagination = action.payload.pagination;
      })
      .addCase(getAllContents.rejected, (state) => {
        state.loading = false;
      })

      .addCase(contentDetail.pending, (state) => {
        state.loading = true;
      })
      .addCase(contentDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.content = action.payload.data;
      })
      .addCase(contentDetail.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { reducer: manageContentReducer, actions: manageContentActions } = manageContentSlice;
