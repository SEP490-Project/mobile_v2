import manageUser from "@/libs/services/manageUser";
import { Response } from "@/libs/types/common";
import { UserProfile } from "@/libs/types/user";
import { createAsyncThunk } from "@reduxjs/toolkit";

const getUserProfileThunk = createAsyncThunk(
  "userManager/getUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await manageUser.getUserProfile();
      return response.data as Response<UserProfile>;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return rejectWithValue(error);
    }
  },
);
export { getUserProfileThunk };
