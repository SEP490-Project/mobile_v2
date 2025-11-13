import { CaculateDeliveryFeeResponse } from "./ghn";

export interface OrderData {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  full_name: string;
  phone_number: string;
  email: string;
  street: string;
  address_line2: string;
  city: string;
  ghn_province_id: number;
  ghn_district_id: number;
  ghn_ward_code: string;
  province_name: string;
  district_name: string;
  ward_name: string;
  shipping_fee: number;
  created_at: string;
  updated_at: string;
  order_type: string;
  is_self_picked_up: boolean;
  user_note?: string;
  ghn_order_code: any;
  order_items: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string;
  quantity: number;
  subtotal: number;
  unit_price: number;
  capacity: number;
  capacity_unit: string;
  container_type: string;
  dispenser_type: string;
  uses: string;
  manufacturing_date: any;
  expiry_date: string;
  instructions: string;
  attributes_description: AttributesDescription[];
  status: string;
  updated_at: string;
  weight: number;
  height: number;
  length: number;
  width: number;
}

export interface AttributesDescription {
  unit: string;
  value: number;
  ingredient: string;
  description: string;
  attribute_id: string;
}

export interface CreateOrderPayload {
  order: CreateOrderPayloadOrder;
  cancel_url?: string;
  success_url?: string;
}

export interface CreateOrderPayloadOrder {
  address_id: string;
  is_self_pickup: boolean;
  items: CreateOrderPayloadItem[];
  user_note?: string;
}

export interface CreateOrderPayloadItem {
  height: number;
  length: number;
  quantity: number;
  variant_id: string;
  weight: number;
  width: number;
}

export interface PlaceOrderAndPayResponse {
  delivery_fee: CaculateDeliveryFeeResponse;
  order: OrderData;
  payment_tx: PaymentTx;
}

export interface PaymentTx {
  bin: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  paymentLinkId: string;
  amount: number;
  description: string;
  orderCode: number;
  expiredAt: number;
  status: string;
  checkoutUrl: string;
  qrCode: string;
}
