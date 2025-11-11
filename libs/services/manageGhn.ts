import api from "../hooks/api/api";
import { CaculateDeliveryFeePayload } from "../types/ghn";

const manageGhnService = {
  caculateDeliveryFee: (payload: CaculateDeliveryFeePayload) =>
    api.post("/ghn/delivery/calculate-by-dimension", payload),
  caculateDeliveryFeeForOrder: (orderId: string) => api.post(`/ghn/orders/${orderId}/calculate`),
};

export default manageGhnService;
