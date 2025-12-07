export interface UserProfile {
  id: string;
  avatar_url: string;
  username: string;
  email: string;
  role: string;
  full_name: string;
  phone: string;
  date_of_birth: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login: string;
  current_login_device: string[];
  number_of_sessions: number;
  shipping_address: ShippingAddress[];
}

export interface ShippingAddress {
  id: string;
  user_id: string;
  type: string;
  full_name: string;
  phone_number: string;
  email: string;
  street: string;
  address_line_2: any;
  city: string;
  state: any;
  postal_code: string;
  country: string;
  ward_name: string;
  district_name: string;
  company: any;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
