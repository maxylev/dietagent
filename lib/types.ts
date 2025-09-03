// Core data structures for the Diet Agent application

export interface Ingredient {
  item: string
  quantity: string // e.g., "200g", "3", "1 cup"
}

export interface Meal {
  name: string
  ingredients: Ingredient[]
}

export interface DailyPlan {
  day: number
  meals: {
    breakfast: Meal
    lunch: Meal
    dinner: Meal
  }
}

export interface MealPlanOption {
  optionId: number
  title: string
  description: string
  dailyPlan: DailyPlan[]
  shoppingList: Ingredient[] // A consolidated list for easier processing
}

export interface MealPlanResponse {
  mealPlanOptions: MealPlanOption[]
}

export interface ShoppingCartItem {
  productName: string
  price: number
  quantity: string // e.g., "500g pack", "1 dozen"
  imageUrl: string
  productUrl: string
}

export interface DietFormData {
  days: number
  people: number
  calories: number
  protein: number
  supermarket: string
}

export interface AppState {
  isLoading: boolean
  mealOptions: MealPlanOption[] | null
  selectedPlan: MealPlanOption | null
  shoppingCart: ShoppingCartItem[] | null
  error: string | null
}
