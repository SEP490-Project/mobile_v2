export interface PreOrderData {
  id: string;
  user_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: string;
  user_bank_account: string;
  user_bank_name: string;
  user_bank_account_holder: string;
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
  is_self_picked_up: boolean;
  action_notes?: ActionNote[];
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
  product_name: string;
  description: string;
  product_type: string;
  created_at: string;
  updated_at: string;
  images?: Image[];
  brand: Brand;
  category: Category;
  PaymentTx: PaymentTx;
  confirmation_image?: string;
  user_resource?: string;
}

export interface Image {
  image_url: string;
  alt_text: string;
  is_primary: boolean;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
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

export interface Category {
  id: string;
  name: string;
  description: any;
  parent_category: any;
  child_categories: any[];
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
