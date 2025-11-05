export interface CaculateDeliveryFeePayload {
  delivery_service: DeliveryService;
  items: Item[];
  to_district_id: number;
  to_ward_code: string;
}

export interface DeliveryService {
  service_id: number;
  service_type_id: number;
  short_name: string;
}

export interface Item {
  height: number;
  length: number;
  name: string;
  price: number;
  quantity: number;
  weight: number;
  width: number;
}

export interface CaculateDeliveryFeeResponse {
  cod_failed_fee: number;
  cod_fee: number;
  coupon_value: number;
  deliver_remote_areas_fee: number;
  document_return: number;
  double_check: number;
  insurance_fee: number;
  pick_remote_areas_fee: number;
  pick_station_fee: number;
  r2s_fee: number;
  return_again: number;
  service_fee: number;
  total: number;
}
