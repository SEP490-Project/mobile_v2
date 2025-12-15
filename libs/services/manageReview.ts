import api from "../hooks/api/api";
import { ReviewParams } from "../types/review";

const manageReview = {
  getReview: (productId: string, params?: ReviewParams) =>
    api.get(`/products/reviews/${productId}`, { params }),
  createReview: (formData: FormData) =>
    api.post(`/products/reviews`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

export default manageReview;
