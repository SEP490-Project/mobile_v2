import { createSlice } from "@reduxjs/toolkit";
import { login, logout, refresh, register } from "./thunk";

interface AuthState {
  loading: boolean;
  isAuthenticated: boolean;
  user: any | null;
  role: string;
}

const initialState: AuthState = {
  loading: false,
  isAuthenticated: false,
  user: null,
  role: "",
};

export const manageAuthenSlice = createSlice({
  name: "authManager",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.role = action.payload.user?.role || "";
      })
      .addCase(login.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
      })

      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state) => {
        state.loading = false;
      })

      .addCase(refresh.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.role = action.payload.user?.role || "";
      })
      .addCase(refresh.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.role = "";
      })

      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.role = "";
      });
  },
});

export const { reducer: manageAuthenReducer, actions: manageAuthenActions } = manageAuthenSlice;
