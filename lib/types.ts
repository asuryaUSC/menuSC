export type Allergen = 
  | 'Eggs'
  | 'Fish'
  | 'Milk'
  | 'Peanuts'
  | 'Sesame'
  | 'Shellfish'
  | 'Soy'
  | 'Tree Nuts'
  | 'Wheat'
  | 'Vegetarian'
  | 'Vegan'
  | 'Gluten Free'

export interface FoodItem {
  name: string
  allergens: Allergen[]
}

export interface MealSection {
  name: string
  items: FoodItem[]
}

export interface DiningHall {
  name: string
  sections: MealSection[]
}

export interface DailyMenu {
  date: string
  breakfast: DiningHall[]
  lunch: DiningHall[]
  dinner: DiningHall[]
}

export interface MenuData {
  date: string;
  breakfast?: DiningHall[];
  lunch?: DiningHall[];
  dinner?: DiningHall[];
} 