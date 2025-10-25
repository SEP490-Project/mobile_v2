import { manageAuthen } from "@/libs/services/manageAuthen";
import type { Login, SignUp } from "@/libs/types/auth";
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
      throw new Error("Thiếu token đăng nhập");
    }

    await saveAuthData(data);
    return data;
  } catch (error: unknown) {
    const err = error as AxiosError<{ message?: string }>;
    return rejectWithValue(err.response?.data?.message || "Đăng nhập thất bại");
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
      return rejectWithValue(err.response?.data?.message || "Đăng ký thất bại");
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
    return rejectWithValue(err.response?.data?.message || "Làm mới token thất bại");
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
