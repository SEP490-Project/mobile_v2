import api from "../hooks/api/api";

const manageProducts = {
  getAllProducts: () => api.get("/products/v2"),
  getProductDetails: (productId: string) => api.get(`/products/${productId}`),
};

export default manageProducts;
