export interface FamilyGroup {
  id: string;
  name: string;
  access_code: string;
  created_at: string;
  updated_at: string;
}

export interface GroceryItem {
  id: string;
  family_group_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  status: "pending" | "purchased";
  frequency: "weekly" | "monthly" | "once";
  current_price?: number;
  previous_price?: number;
  notes?: string;
  purchased_at?: string;
  purchased_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PriceHistory {
  id: string;
  item_id: string;
  price: number;
  recorded_at: string;
  recorded_by?: string;
}

export const CATEGORIES = [
  "Fruits & Vegetables",
  "Dairy & Eggs",
  "Meat & Seafood",
  "Bakery & Bread",
  "Pantry & Dry Goods",
  "Frozen Foods",
  "Beverages",
  "Snacks",
  "Cleaning & Household",
  "Personal Care",
  "Baby & Kids",
  "General",
];

export const UNITS = [
  "pcs",
  "kg",
  "g",
  "lbs",
  "oz",
  "l",
  "ml",
  "pack",
  "box",
  "can",
  "bottle",
  "dozen",
];

export const FREQUENCIES = [
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "One-Time", value: "once" },
];

export const CATEGORY_ICONS: Record<string, string> = {
  "Fruits & Vegetables": "🥦",
  "Dairy & Eggs": "🥛",
  "Meat & Seafood": "🥩",
  "Bakery & Bread": "🍞",
  "Pantry & Dry Goods": "🫙",
  "Frozen Foods": "🧊",
  Beverages: "🧃",
  Snacks: "🍿",
  "Cleaning & Household": "🧹",
  "Personal Care": "🪥",
  "Baby & Kids": "👶",
  General: "🛒",
};
