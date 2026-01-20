import api from "../hooks/api/api";
import { LimitedProductParams, ProductFilter, ProductParams } from "../types/product";

const manageProducts = {
  getAllProducts: (params: ProductFilter) => api.get("/products/v2", { params }),
  getProductDetails: (productId: string) => api.get(`/products/${productId}`),

  //Get Product (New API)
  getAllStandardProducts: (params: ProductParams) => api.get("products/standard", { params }),
  getAllLimitedProducts: (params: LimitedProductParams) => api.get("products/limited", { params }),
};

export default manageProducts;
