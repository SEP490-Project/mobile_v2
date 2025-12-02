import manageDeviceToken from "@/libs/services/manageDeviceToken";
import { registerDeviceToken } from "@/libs/types/deviceToken";
import { createAsyncThunk } from "@reduxjs/toolkit";

const registerDeviceTokenThunk = createAsyncThunk(
  "registerDeviceToken",
  async (req: registerDeviceToken, { rejectWithValue }) => {
    try {
      const response = await manageDeviceToken.registerDeviceToken(req);
      return response.data;
    } catch (error) {
      console.error("Error registering device token:", error);
      return rejectWithValue(error);
    }
  },
);

const deleteDeviceTokenThunk = createAsyncThunk(
  "deleteDeviceToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await manageDeviceToken.deleteDeviceToken();
      return response.data;
    } catch (error) {
      console.error("Error deleting device token:", error);
      return rejectWithValue(error);
    }
  },
);

export { deleteDeviceTokenThunk, registerDeviceTokenThunk };
