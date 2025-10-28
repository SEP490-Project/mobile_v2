import api from "../hooks/api/api";

const manageUser = {
  getUserProfile: () => api.get("/users/profile"),
};

export default manageUser;
