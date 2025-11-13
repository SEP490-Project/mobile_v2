import api from "../hooks/api/api";
import { CreateOrderPayload } from "../types/order";

const manageOrder = {
  getOrders: () => api.get("/orders"),
  placeOrderAndPay: (payload: CreateOrderPayload) => api.post(`/orders`, payload),
  placeOrderAndPayForLimitedProduct: (payload: CreateOrderPayload) =>
    api.post(`/orders/limited`, payload),
  receiveOrder: (orderId: string) => api.patch(`/orders/received/${orderId}`),
};

export default manageOrder;
