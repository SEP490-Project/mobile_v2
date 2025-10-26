import api from "../hooks/api/api";

const manageProducts = {
  getAllProducts: () => api.get("/products/v2"),
};

export default manageProducts;
