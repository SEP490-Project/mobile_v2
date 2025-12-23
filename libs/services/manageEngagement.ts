import api from "../hooks/api/api";
import { EngagementPost } from "../types/engagement";

const manageEngagement = {
  contentEngagement: (req: string) => api.get(`/contents/${req}/engagement`),
  userEngagementStatus: (req: string) => api.get(`/contents/${req}/engagement/status`),
  postEngagement: (id: string, req: EngagementPost) => api.post(`/contents/${id}/engagement`, req),
};

export default manageEngagement;
