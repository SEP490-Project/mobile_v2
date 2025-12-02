import { getRaw } from "@/libs/utils/token-storage";
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

export const requestInterceptor = async (
  config: InternalAxiosRequestConfig,
): Promise<InternalAxiosRequestConfig> => {
  const token = await getRaw("access_token");

  config.headers = config.headers || {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

export const successInterceptor = (response: AxiosResponse) => response;

export const errorInterceptor = async (error: AxiosError): Promise<never> => {
  console.error("API Error:", error.response?.data || error.message);
  return Promise.reject(error);
};
