export interface CreateShippingAddressPayload {
  address_line_2: string;
  city: string;
  country: string;
  email: string;
  full_name: string;
  ghn_district_id: number;
  ghn_province_id: number;
  ghn_ward_code: string;
  is_default: boolean;
  phone_number: string;
  postal_code: any;
  street: string;
  type: string;
}

export interface ShippingAddressData {
  id: string;
  user_id: string;
  type: string;
  full_name: string;
  phone_number: string;
  email: string;
  street: string;
  address_line_2: string;
  city: string;
  state: any;
  postal_code: string;
  country: string;
  company: any;
  is_default: boolean;
  ghn_province_id: number;
  ghn_district_id: number;
  ghn_ward_code: string;
  province_name: string;
  district_name: string;
  ward_name: string;
  created_at: string;
  updated_at: string;
}

export interface Province {
  ProvinceID: number;
  ProvinceName: string;
}

export interface District {
  DistrictID: number;
  DistrictName: string;
}

export interface Ward {
  WardCode: string;
  WardName: string;
}
