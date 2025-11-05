import { UserProfile } from "@/libs/types/user";
import { createSlice } from "@reduxjs/toolkit";
import { getUserProfileThunk } from "./thunk";

interface UserState {
  loading: boolean;
  profile: UserProfile | null | undefined;
  error: string | null;
}

const initialState: UserState = {
  loading: false,
  profile: null,
  error: null,
};

export const manageUserSlice = createSlice({
  name: "userManager",
  initialState,
  reducers: {
    clearUserProfile: (state) => {
      state.profile = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.data;
        state.error = null;
      })
      .addCase(getUserProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUserProfile } = manageUserSlice.actions;
export const { reducer: manageUserReducer, actions: manageUserActions } = manageUserSlice;
