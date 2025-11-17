import api from "../hooks/api/api";
import { ContentFilter } from "../types/content";

export const manageContent = {
  getAllContent: (params: ContentFilter) => api.get("/contents/public", { params }),
  contentDetail: (id: string) => api.get(`/contents/public/${id}`),
};
