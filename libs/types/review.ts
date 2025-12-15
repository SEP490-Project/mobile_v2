export interface ReviewParams {
  limit?: number;
  page?: number;
  fromDate?: string;
  toDate?: string;
  rating_stars_min?: number;
  rating_stars_max?: number;
  order_by?: "created_at" | "rating_stars";
  order_direction?: "asc" | "desc";
}

export interface ReviewData {
  id: string;
  product_id: string;
  product_variant_name: string;
  user_id: string;
  user_name: string;
  rating_stars: number;
  comment: string;
  assets_url: string;
  created_at: string;
  order_at: string;
  type: string;
}

export interface CreateReviewFormData {
  //Order item ID or preorder Id
  reference_id: string;
  order_type: "ORDER" | "PREORDER";
  rating: number;
  comment: string;
  assets?: File;
}
