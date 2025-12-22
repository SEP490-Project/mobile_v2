import manageEngagement from "@/libs/services/manageEngagement";
import { EngagementPost } from "@/libs/types/engagement";
import { createAsyncThunk } from "@reduxjs/toolkit";

const contentEngagementThunk = createAsyncThunk(
  "content-engagement",
  async (req: string, { rejectWithValue }) => {
    try {
      const response = await manageEngagement.contentEngagement(req);
      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching content engagement:", error);
      return rejectWithValue({
        message: error?.response?.data?.message || error?.message || "Failed to fetch engagement",
      });
    }
  },
);

const userEngagementStatusThunk = createAsyncThunk(
  "user-engagement-status",
  async (req: string, { rejectWithValue }) => {
    try {
      const response = await manageEngagement.userEngagementStatus(req);
      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching user engagement status:", error);
      if (error?.response?.status === 401) {
        return null;
      }
      return rejectWithValue({
        message: error?.response?.data?.message || error?.message || "Failed to fetch user status",
      });
    }
  },
);

const postEngagementThunk = createAsyncThunk<
  any,
  { id: string; req: EngagementPost },
  { rejectValue: { message: string } }
>("post-engagement", async (payload, { rejectWithValue }) => {
  try {
    const response = await manageEngagement.postEngagement(payload.id, payload.req);
    return response.data.data;
  } catch (error: any) {
    console.error("Error posting engagement:", error);
    return rejectWithValue({
      message: error?.response?.data?.message || error?.message || "Failed to post engagement",
    });
  }
});

export { contentEngagementThunk, postEngagementThunk, userEngagementStatusThunk };
