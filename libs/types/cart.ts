import { Product, Variant } from "./product";

export interface CartItem {
  id: string; // Unique cart item ID
  product: Product;
  variant: Variant;
  quantity: number;
  addedAt: string;
}

export interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}
