import manageNotification from "@/libs/services/manageNotification";
import { createAsyncThunk } from "@reduxjs/toolkit";

const getNotificationThunk = createAsyncThunk(
  "getNotification",
  async (
    req: {
      page: number;
      limit: number;
      user_id?: string;
      type?: string;
      status?: string;
      is_read?: boolean;
      start_date?: string;
      end_date?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await manageNotification.getNotification(req);
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return rejectWithValue(error);
    }
  },
);

const markAsReadAll = createAsyncThunk("markAsReadAll", async (_, { rejectWithValue }) => {
  try {
    const response = await manageNotification.readAllNotifications();
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return rejectWithValue(error);
  }
});

const markAsReadOne = createAsyncThunk("markAsReadOne", async (id: string, { rejectWithValue }) => {
  try {
    const response = await manageNotification.readOneNotification(id);
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return rejectWithValue(error);
  }
});

export { getNotificationThunk, markAsReadAll, markAsReadOne };
