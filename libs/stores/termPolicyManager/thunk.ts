import manageTermPolicy from "@/libs/services/manageTermPolicy";
import { createAsyncThunk } from "@reduxjs/toolkit";

const privacyPolicyThunk = createAsyncThunk("privacy-policy", async (_, { rejectWithValue }) => {
  try {
    const response = await manageTermPolicy.privacyPolicy();
    return response.data.data;
  } catch (error) {
    console.error("Error fetching privacy policy:", error);
    return rejectWithValue(error);
  }
});

const termOfServiceThunk = createAsyncThunk("term-of-service", async (_, { rejectWithValue }) => {
  try {
    const response = await manageTermPolicy.termOfService();
    return response.data.data;
  } catch (error) {
    console.error("Error fetching term of service:", error);
    return rejectWithValue(error);
  }
});

export { privacyPolicyThunk, termOfServiceThunk };
