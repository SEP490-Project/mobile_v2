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
    console.log("----- COMPENSATION REQUEST DEBUG -----");

    // Log URL
    console.log("URL:", `/orders/${orderId}/compensation`);

    // Log headers
    console.log("HEADERS to send:", {
      "Content-Type": "multipart/form-data",
    });

    // Log tất cả FormData key-value
    // (React Native FormData sử dụng _parts)
    // Điều này hoạt động 100% dù axios hay fetch.
    if (formData?._parts) {
      console.log("FORMDATA PARTS:");
      formData._parts.forEach((p) => console.log(" -", p));
    } else {
      console.log("FORMDATA HAS NO _parts — WTF?");
    }

    console.log("----- END DEBUG -----");

    return api.post(`/orders/${orderId}/compensation`, formData);
  },
  requestRefundOrder: (orderId: string) => api.post(`/orders/${orderId}/refund`),
  requestCompenstatePreOrder: (preorderId: string, file: FormData) =>
    api.post(`/preorders/${preorderId}/compensation`, file, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

export default manageOrder;
