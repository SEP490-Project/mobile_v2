import api from "../hooks/api/api";

const manageUser = {
  getUserProfile: () => api.get("/users/profile"),
  updateProfile: (data: any) => api.put("/users/profile", data),
};

export default manageUser;
