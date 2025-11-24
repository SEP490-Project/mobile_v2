import api from "../hooks/api/api";
import { CreateOrderPayload, CreatePreOrderPayload } from "../types/order";

const manageOrder = {
  getOrders: () => api.get("/orders"),
  placeOrderAndPay: (payload: CreateOrderPayload) => api.post(`/orders`, payload),
  placeOrderAndPayForLimitedProduct: (payload: CreateOrderPayload) =>
    api.post(`/orders/limited`, payload),
  receiveOrder: (orderId: string) => api.patch(`/orders/received/${orderId}`),
  createAPreoOrder: (payload: CreatePreOrderPayload) => api.post(`/preorders`, payload),
  getPreOrders: () => api.get("/preorders"),
  updatePreorderStatus: (preorderId: string, files: FormData) =>
    api.patch(`/preorders/${preorderId}/state`, files, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  requestCompensateOrder: (orderId: string) => api.post(`/orders/${orderId}/compensate`),
  requestRefundOrder: (orderId: string) => api.post(`/orders/${orderId}/refund`),
};

export default manageOrder;
