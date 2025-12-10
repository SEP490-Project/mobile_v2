import api from "../hooks/api/api";

const manageNotification = {
  getNotification: (params: {
    page: number;
    limit: number;
    user_id?: string;
    type?: string;
    status?: string;
    is_read?: boolean;
    start_date?: string;
    end_date?: string;
  }) => api.get("/notifications", { params }),
  getDetailNotification: (id: string) => api.get(`/notifications/${id}`),
  readAllNotifications: () => api.put("/notifications/read-all"),
  readOneNotification: (id: string) => api.put(`/notifications/${id}/read`),
  readNotification: (id: string) => api.put(`/notifications/${id}/read`),
  subscribeRealTime: () => api.get("/notifications/sse"),
};

export default manageNotification;
