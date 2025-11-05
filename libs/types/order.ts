import { CaculateDeliveryFeeResponse, DeliveryService } from "./ghn";

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
  delivery_service: DeliveryService;
  order: CreateOrderPayloadOrder;
  cancel_url?: string;
  success_url?: string;
}

export interface CreateOrderPayloadOrder {
  address_id: string;
  items: CreateOrderPayloadItem[];
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
  amount: number;
  gateway_id: string;
  gateway_ref: string; // This is payment url
  id: string;
  method: string;
  payos_metadata: any[];
  reference_id: string;
  reference_type: string;
  status: string;
  transaction_date: string;
  updated_at: string;
}
