import { Category } from "./category";
import { QueryParams } from "./common";

export interface Product {
  id: string;
  brand_id: string;
  brand_logo_url: string;
  brand_name: string;
  thumbnail_url: string[];
  is_active: boolean;
  category: Category;
  description: string;
  name: string;
  price: number;
  type: string;
  variants: Variant[];
  created_at: string;
  limited_product: LimitedProduct;
  concept: Concept;
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
  attributes: Attribute[];
}

export interface Attribute {
  ingredient: string;
  description: string;
  value: number;
  unit: string;
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

export interface LimitedProduct {
  max_stock: number;
  is_free_shipping: boolean;
  bought_limit: number;
  premiere_date: string;
  availability_start_date: string;
  availability_end_date: string;
}

export interface Concept {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  banner_url: string;
  video_thumbnail: string;
  limited_product: any;
}

export interface ProductFilter extends QueryParams {
  category_id?: string;
  type?: string;
}
