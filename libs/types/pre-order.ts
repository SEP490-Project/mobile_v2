export interface PreOrderData {
  id: string;
  user_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
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
  capacity: number;
  capacity_unit: string;
  container_type: string;
  dispenser_type: string;
  uses: string;
  manufacturing_date: string;
  expiry_date: string;
  instructions: string;
  attributes_description: any;
  weight: number;
  height: number;
  length: number;
  width: number;
  is_self_picked_up: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  action_notes?: ActionNote[];
  PaymentTx?: PaymentTx;
}

export interface PaymentTx {
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

export interface ActionNote {
  user_id: string;
  user_name: string;
  user_email: string;
  action_type: string;
  reason: string;
  created_at: string;
}
