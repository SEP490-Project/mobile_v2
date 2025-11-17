import api from "../hooks/api/api";

const manageContent = {
  getAllContent: () => api.get("/categories"),
};

export default manageContent;
