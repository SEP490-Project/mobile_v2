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

const updateProfileThunk = createAsyncThunk(
  "userManager/updateProfile",
  async (profileData: any, { rejectWithValue }) => {
    try {
      const response = await manageUser.updateProfile(profileData);
      return response.data as Response<UserProfile>;
    } catch (error) {
      console.error("Error updating user profile:", error);
      return rejectWithValue(error);
    }
  },
);

export { getUserProfileThunk, updateProfileThunk };
