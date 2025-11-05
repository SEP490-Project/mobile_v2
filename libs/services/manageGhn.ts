import api from "../hooks/api/api";
import { CaculateDeliveryFeePayload, DeliveryService } from "../types/ghn";

const manageGhnService = {
  caculateDeliveryFee: (payload: CaculateDeliveryFeePayload) =>
    api.post("/ghn/delivery/calculate-by-dimension", payload),
  getDeliveryServicesForOrder: (orderId: string) =>
    api.get(`/ghn/order/${orderId}/shipping-services`),
  caculateDeliveryFeeForOrder: (orderId: string, payload: DeliveryService) =>
    api.post(`/ghn/orders/${orderId}/calculate`, payload),
  getDeliveryServicesByDistrict: (districtId: string) =>
    api.get(`/ghn/${districtId}/shipping-services`),
};

export default manageGhnService;
