import api from "../hooks/api/api";

const manageCategories = {
  getAllCategories: () => api.get("/categories"),
};

export default manageCategories;
