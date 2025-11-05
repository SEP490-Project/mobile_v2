import api from "../hooks/api/api";
import { CreateOrderPayload } from "../types/order";

const manageOrder = {
  getOrders: () => api.get("/orders"),
  placeOrderAndPay: (payload: CreateOrderPayload) => api.post(`/orders/place-and-pay`, payload),
};

export default manageOrder;
