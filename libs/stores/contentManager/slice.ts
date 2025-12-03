import type { ListContent } from "@/libs/types/content";
import { createSlice } from "@reduxjs/toolkit";
import { contentDetail, getAllContents } from "./thunk";

interface stateType {
  loading: boolean;
  loadingMore: boolean;
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
  loadingMore: false,
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
      .addCase(getAllContents.pending, (state, action) => {
        const page = (action.meta && (action.meta.arg as any)?.page) || 1;
        if (page && page > 1) {
          state.loadingMore = true;
        } else {
          state.loading = true;
        }
      })
      .addCase(getAllContents.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;

        const pagination = action.payload?.pagination || null;
        const page = pagination?.page ?? ((action.meta && (action.meta.arg as any)?.page) || 1);
        const newData: ListContent[] = action.payload?.data || [];

        if (page && page > 1) {
          state.contents = [...state.contents, ...newData];
        } else {
          state.contents = newData;
        }

        state.pagination = pagination;
      })
      .addCase(getAllContents.rejected, (state) => {
        state.loading = false;
        state.loadingMore = false;
      })

      .addCase(contentDetail.pending, (state) => {
        state.loading = true;
      })
      .addCase(contentDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.content = action.payload?.data ?? null;
      })
      .addCase(contentDetail.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { reducer: manageContentReducer, actions: manageContentActions } = manageContentSlice;
