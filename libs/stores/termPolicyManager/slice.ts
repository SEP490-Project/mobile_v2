import { createSlice } from "@reduxjs/toolkit";
import { privacyPolicyThunk, termOfServiceThunk } from "./thunk";

interface termPolicyState {
  loading: boolean;
  privacyPolicy: any;
  termOfService: any;
}

const initialState: termPolicyState = {
  loading: false,
  privacyPolicy: null,
  termOfService: null,
};

export const manageTermPolicySlice = createSlice({
  name: "termPolicyManager",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(privacyPolicyThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(privacyPolicyThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.privacyPolicy = action.payload;
      })
      .addCase(privacyPolicyThunk.rejected, (state) => {
        state.loading = false;
      })

      .addCase(termOfServiceThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(termOfServiceThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.termOfService = action.payload;
      })
      .addCase(termOfServiceThunk.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { reducer: manageTermPolicyReducer, actions: manageTermPolicyActions } =
  manageTermPolicySlice;
