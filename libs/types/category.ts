export interface Category {
  id: string;
  icon?: string;
  name: string;
  description?: string;
  parent_category?: Category;
  child_categories?: Category[];
}
