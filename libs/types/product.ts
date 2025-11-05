import { Category } from "./category";

export interface Product {
  id: string;
  brand_id: string;
  brand_logo_url: string;
  brand_name: string;
  is_active: boolean;
  category: Category;
  description: string;
  name: string;
  type: string;
  created_at: string;
  thumbnail_url?: string[];
  variants?: Variant[];
}

export interface Variant {
  id: string;
  price: number;
  current_stock: number;
  capacity: number;
  capacity_unit: string;
  container_type: string;
  dispenser_type: string;
  manufacture_date: string;
  expiry_date: string;
  instructions: string;
  uses?: string;
  story?: string;
  created_at: string;
  updated_at: string;
  images?: Image[];
  is_default?: boolean;
  weight: number;
  height: number;
  length: number;
  width: number;
}

export interface Image {
  id: string;
  variant_id: string;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}
