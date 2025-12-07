import { manageAuthen } from "@/libs/services/manageAuthen";
import type {
  ChangePassword,
  ForgotPassword,
  Login,
  ResetPassword,
  SignUp,
} from "@/libs/types/auth";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import * as SecureStore from "expo-secure-store";

const saveAuthData = async (data: any) => {
  await SecureStore.setItemAsync("access_token", data.access_token);
  await SecureStore.setItemAsync("refresh_token", data.refresh_token);
  await SecureStore.setItemAsync("user", JSON.stringify(data.user));
};

const clearAuthData = async () => {
  await SecureStore.deleteItemAsync("access_token");
  await SecureStore.deleteItemAsync("refresh_token");
  await SecureStore.deleteItemAsync("user");
};

export const login = createAsyncThunk("auth/login", async (req: Login, { rejectWithValue }) => {
  try {
    const response = await manageAuthen.login(req);
    const data = response.data?.data;

    if (!data?.access_token || !data?.refresh_token) {
      throw new Error("Missing login token");
    }

    const role = data?.user?.role;

    if (!role || role !== "CUSTOMER") {
      throw new Error("Only users with CUSTOMER role are allowed to log in");
    }

    await saveAuthData(data);
    return data;
  } catch (error: unknown) {
    const err = error as AxiosError<{ message?: string }>;
    return rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

export const register = createAsyncThunk(
  "auth/register",
  async (req: SignUp, { rejectWithValue }) => {
    try {
      const response = await manageAuthen.register(req);
      return response.data;
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message || "Registration failed");
    }
  },
);

export const refresh = createAsyncThunk("auth/refresh", async (_, { rejectWithValue }) => {
  try {
    const refreshToken = await SecureStore.getItemAsync("refresh_token");
    if (!refreshToken) throw new Error("Không tìm thấy refresh token");

    const response = await manageAuthen.refresh({ refresh_token: refreshToken });
    const data = response.data?.data;

    if (!data?.access_token) throw new Error("Thiếu access token mới");

    await SecureStore.setItemAsync("access_token", data.access_token);
    return data;
  } catch (error: unknown) {
    const err = error as AxiosError<{ message?: string }>;
    return rejectWithValue(err.response?.data?.message || "Token refresh failed");
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    const refreshToken = await SecureStore.getItemAsync("refresh_token");
    if (refreshToken) {
      await manageAuthen.logout({ refresh_token: refreshToken });
    }
  } catch (error) {
    console.log("Logout failed:", error);
  } finally {
    await clearAuthData();
  }
});

export const restoreSession = createAsyncThunk("auth/restore", async (_, { rejectWithValue }) => {
  try {
    const accessToken = await SecureStore.getItemAsync("access_token");
    const userData = await SecureStore.getItemAsync("user");

    if (!accessToken || !userData) {
      throw new Error("No session found");
    }

    const user = JSON.parse(userData);
    return { access_token: accessToken, user };
  } catch (error: unknown) {
    const err = error as AxiosError<{ message?: string }>;
    return rejectWithValue(err.response?.data?.message || "Unable to restore session");
  }
});

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (req: ForgotPassword, { rejectWithValue }) => {
    try {
      const response = await manageAuthen.forgotPassword(req);
      return response.data;
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message || "Forgot password failed");
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (req: ResetPassword, { rejectWithValue }) => {
    try {
      const response = await manageAuthen.resetPassword(req);
      return response.data;
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message || "Reset password failed");
    }
  },
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (req: ChangePassword, { rejectWithValue }) => {
    try {
      const response = await manageAuthen.changePassword(req);
      return response.data;
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message || "Change password failed");
    }
  },
);
