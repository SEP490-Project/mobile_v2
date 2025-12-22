import { EngagementSummary, UserEngagementStatus } from "@/libs/types/engagement";
import { createSlice } from "@reduxjs/toolkit";
import { contentEngagementThunk, postEngagementThunk, userEngagementStatusThunk } from "./thunk";

interface engagementManagerState {
  loading: boolean;
  contentEngagement: EngagementSummary | null;
  userEngagementStatus: UserEngagementStatus | null;
}

const initialState: engagementManagerState = {
  loading: false,
  contentEngagement: null,
  userEngagementStatus: null,
};

export const manageEngagementSlice = createSlice({
  name: "engagementManager",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(contentEngagementThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(contentEngagementThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.contentEngagement = action.payload;
      })
      .addCase(contentEngagementThunk.rejected, (state) => {
        state.loading = false;
      })

      .addCase(userEngagementStatusThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(userEngagementStatusThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Handle null response for unauthenticated users
        state.userEngagementStatus = action.payload;
      })
      .addCase(userEngagementStatusThunk.rejected, (state) => {
        state.loading = false;
        state.userEngagementStatus = null;
      })

      .addCase(postEngagementThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(postEngagementThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(postEngagementThunk.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { reducer: manageEngagementReducer, actions: manageEngagementActions } =
  manageEngagementSlice;
