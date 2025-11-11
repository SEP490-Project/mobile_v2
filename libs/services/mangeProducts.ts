import api from "../hooks/api/api";
import { ProductFilter } from "../types/product";

const manageProducts = {
  getAllProducts: (params: ProductFilter) => api.get("/products/v2", { params }),
  getProductDetails: (productId: string) => api.get(`/products/${productId}`),
};

export default manageProducts;
