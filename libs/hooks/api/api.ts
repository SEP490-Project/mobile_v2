import { getRaw, removeItem, setRaw } from "@/libs/utils/token-storage";
import axios, { AxiosError, AxiosInstance } from "axios";
import { requestInterceptor, successInterceptor } from "./interceptors";

// Mở rộng AxiosRequestConfig
declare module "axios" {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

const api: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  responseType: "json",
});

api.interceptors.request.use(async (config) => await requestInterceptor(config));
api.interceptors.response.use(successInterceptor, async (error: AxiosError) => {
  const originalRequest = error.config!;
  if (error.response?.status === 401 && !originalRequest._retry) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = await getRaw("refresh_token");
    const oldAccessToken = await getRaw("access_token");

    if (!refreshToken || !oldAccessToken) {
      isRefreshing = false;
      return Promise.reject(error);
    }

    try {
      const refreshInstance = axios.create({
        baseURL: process.env.EXPO_PUBLIC_API_URL,
        responseType: "json",
        headers: { Authorization: `Bearer ${oldAccessToken}` },
      });

      const response = await refreshInstance.post("/auth/refresh", {
        refresh_token: refreshToken,
      });

      const newAccessToken = response.data?.data?.access_token;
      if (!newAccessToken) throw new Error("Missing new access token");

      await setRaw("access_token", newAccessToken);
      processQueue(null, newAccessToken);
      isRefreshing = false;

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (err) {
      processQueue(err as AxiosError, null);
      isRefreshing = false;

      await removeItem("access_token");
      await removeItem("refresh_token");
      await removeItem("user");

      // 🔻 TODO: Thay bằng navigation reset sang Login
      // navigation.navigate("Login");

      return Promise.reject(err);
    }
  }
  return Promise.reject(error);
});

export default api;
