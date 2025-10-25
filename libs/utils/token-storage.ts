import * as SecureStore from "expo-secure-store";

export const setItem = async (key: string, value: unknown) => {
  await SecureStore.setItemAsync(key, JSON.stringify(value));
};

export const getItem = async <T = unknown>(key: string): Promise<T | null> => {
  const result = await SecureStore.getItemAsync(key);
  if (!result) return null;
  try {
    return JSON.parse(result) as T;
  } catch {
    return null;
  }
};

// Raw string (token)
export const setRaw = async (key: string, value: string) => {
  await SecureStore.setItemAsync(key, value);
};

export const getRaw = async (key: string): Promise<string | null> => {
  return await SecureStore.getItemAsync(key);
};

export const removeItem = async (key: string) => {
  await SecureStore.deleteItemAsync(key);
};
