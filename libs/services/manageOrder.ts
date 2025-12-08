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

  requestCompensateOrder: async (orderId: string, formData: FormData) => {
    console.log("Requesting compensation for order:", orderId, formData);
    return api.post(`/orders/${orderId}/compensation`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        accept: "application/json",
      },
    });
  },
  requestRefundOrder: (orderId: string) => api.post(`/orders/${orderId}/refund`),

  // Preorder
  requestRefundPreOrder: (preorderId: string, reason: FormData) =>
    api.post(`/preorders/refund/${preorderId}`, reason, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  requestCompenstatePreOrder: (preorderId: string, form: FormData) =>
    api.post(`/preorders/${preorderId}/compensation`, form, {
      headers: {
        "Content-Type": "multipart/form-data",
        accept: "application/json",
      },
    }),
  receivedPreOrder: (preorderId: string) =>
    api.post(`/preorders/self-delivering/${preorderId}/received`),
};

export default manageOrder;
