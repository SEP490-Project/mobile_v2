import { createSlice } from "@reduxjs/toolkit";
import { deleteDeviceTokenThunk, registerDeviceTokenThunk } from "./thunk";

interface deviceTokenState {
  loading: boolean;
}

const initialState: deviceTokenState = {
  loading: false,
};

export const manageDeviceTokenSlice = createSlice({
  name: "deviceTokenManager",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerDeviceTokenThunk.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(registerDeviceTokenThunk.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(registerDeviceTokenThunk.rejected, (state) => {
        state.loading = false;
      })

      .addCase(deleteDeviceTokenThunk.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(deleteDeviceTokenThunk.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(deleteDeviceTokenThunk.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { reducer: manageDeviceTokenReducer, actions: manageDeviceTokenActions } =
  manageDeviceTokenSlice;
