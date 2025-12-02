import { Notifications } from "@/libs/types/notification";
import { createSlice } from "@reduxjs/toolkit";
import { getNotificationThunk } from "./thunk";

interface NotificationState {
  loading: boolean;
  loadingMore: boolean;
  notifications: Notifications[];
  notification: Notifications | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  } | null;
}

const initialState: NotificationState = {
  loading: false,
  loadingMore: false,
  notifications: [],
  notification: null,
  pagination: null,
};

export const manageNotificationSlice = createSlice({
  name: "notificationManager",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getNotificationThunk.pending, (state, action) => {
        const page = (action.meta && (action.meta.arg as any)?.page) || 1;
        if (page && page > 1) {
          state.loadingMore = true;
        } else {
          state.loading = true;
        }
      })
      .addCase(getNotificationThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;

        const pagination = action.payload?.data.pagination ?? null;
        const page = pagination?.page ?? ((action.meta && (action.meta.arg as any)?.page) || 1);
        const newData: Notifications[] = action.payload?.data?.notifications || [];

        if (page && page > 1) {
          state.notifications = [...state.notifications, ...newData];
        } else {
          state.notifications = newData;
        }

        state.pagination = pagination;
      })
      .addCase(getNotificationThunk.rejected, (state) => {
        state.loading = false;
        state.loadingMore = false;
      });
  },
});

export const { reducer: manageNotificationReducer, actions: manageNotificationActions } =
  manageNotificationSlice;
