import { CaculateDeliveryFeeResponse } from "./ghn";

export interface OrderData {
  id: string;
  user_id: string;
  status: string;
  bank_account: string;
  bank_name: string;
  bank_account_holder: string;
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
  is_self_picked_up: boolean;
  confirmation_image?: string;
  order_type: string;
  ghn_order_code?: string;
  action_notes: ActionNote[];
  user_note: string;
  payment_transaction: PaymentTransaction;
  order_items: OrderItem[];
  user_resource?: string;
  staff_resource?: string;
}

export interface ActionNote {
  user_id: string;
  user_name: string;
  user_email: string;
  action_type: string;
  reason: string;
  created_at: string;
}

export interface PaymentTransaction {
  id: string;
  reference_id: string;
  reference_type: string;
  amount: string;
  method: string;
  status: string;
  transaction_date: string;
  gateway_ref: string;
  gateway_id: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
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
  weight: number;
  height: number;
  length: number;
  width: number;
  product_name: string;
  description: string;
  is_reviewed: boolean;
  product_type: string;
  limited_properties?: LimitedProperties;
  attributes_description: AttributesDescription[];
  images: Image[];
  brand: Brand;
  category: Category;
}

export interface LimitedProperties {
  premiere_date: string;
  availability_start_date: string;
  availability_end_date: string;
}

export interface Image {
  image_url: string;
  alt_text: string;
  is_primary: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parent_category: any;
  child_categories: Category[];
}

export interface Brand {
  id: string;
  name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  website: string;
  logo_url: string;
  tax_number: string;
  representative_name: string;
  representative_role: string;
  representative_email: string;
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

export interface CreatePreOrderPayload {
  address_id: string;
  cancel_url?: string;
  success_url?: string;
  is_self_pickup: boolean;
  variant_id: string;
  quantity: number;
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
