export interface Unit {
  id: string;
  name: string;
}

export interface Store {
  id: string;
  name: string;
}

export interface Ingredient {
  id: string;
  name: string;
  image_url?: string;
  unit_id?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  created_at?: string;
  updated_at?: string;
  unit?: Unit;
  prices?: IngredientPrice[];
}

export interface IngredientPrice {
  id: string;
  ingredient_id: string;
  store_id: string;
  price: number;
  updated_at?: string;
  store?: Store;
}

export interface Recipe {
  id: string;
  name: string;
  servings: number;
  created_at?: string;
  updated_at?: string;
  ingredients?: RecipeIngredient[];
  steps?: RecipeStep[];
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  quantity: number;
  created_at?: string;
  ingredient?: Ingredient;
}

export interface RecipeStep {
  id: string;
  recipe_id: string;
  step_number: number;
  description: string;
  created_at?: string;
}