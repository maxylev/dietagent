"use client"


export interface MealPlan {
  id: string
  title: string
  description: string
  days: number
  people: number
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  difficulty: "Easy" | "Medium" | "Hard"
  meals: Array<{
    day: number
    breakfast: Meal
    lunch: Meal
    dinner: Meal
  }>
  estimatedCost: {
    min: number
    max: number
    currency: string
  }
  supermarkets: Array<{
    name: string
    country: string
    website: string
    deliveryFee: number
  }>
  nutritionalSummary: {
    dailyCalories: number
    dailyProtein: number
    dailyCarbs: number
    dailyFat: number
  }
}

export interface Meal {
  name: string
  description: string
  prepTime: number // minutes
  cookTime: number // minutes
  servings: number
  calories: number
  protein: number
  carbs: number
  fat: number
  ingredients: Array<{
    name: string
    quantity: string
    unit: string
    estimatedPrice: number
    supermarketLinks: Array<{
      supermarket: string
      url: string
      price: number
      imageUrl?: string
    }>
  }>
  instructions: string[]
  tips: string[]
  imageUrl?: string
  tags: string[]
}

export interface ShoppingCart {
  id: string
  mealPlanId: string
  totalItems: number
  totalCost: number
  currency: string
  supermarket: string
  country: string
  items: Array<{
    id: string
    name: string
    quantity: string
    unit: string
    price: number
    totalPrice: number
    imageUrl?: string
    productUrl: string
    category: string
    nutritionalInfo?: {
      calories: number
      protein: number
      carbs: number
      fat: number
    }
  }>
  deliveryFee: number
  estimatedDeliveryTime: string
  subtotal: number
  tax: number
  grandTotal: number
  screenshots?: string[]
  createdAt: string
}

export interface BrowserUseTask {
  id: string
  status: "created" | "running" | "finished" | "failed" | "stopped" | "paused"
  task: string
  output?: string
  steps?: any[]
  created_at: string
  finished_at?: string
  error?: string
  metadata?: Record<string, any>
  screenshots?: string[]
  gif_url?: string
  media_urls?: string[]
}

export class BrowserUseService {
  private baseUrl = "https://api.browser-use.com/api/v2"
  private apiKey: string | null = null

  constructor(apiKey?: string) {
    this.apiKey = apiKey || null
    console.log("BrowserUseService initialized with API key:", apiKey ? "present" : "missing")
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey
    console.log("API key set:", apiKey ? "present" : "missing")
  }

  private getHeaders() {
    if (!this.apiKey) {
      throw new Error("Browser-Use API key is required")
    }
    return {
      "X-Browser-Use-API-Key": this.apiKey,
      "Content-Type": "application/json",
      "User-Agent": "Diet-Agent-Production/1.0",
      "X-Request-Source": "diet-agent-production"
    }
  }

  async runMealPlanTask(
    prompt: string,
    preferences?: {
      days?: number
      people?: number
      calories?: number
      country?: string
      dietaryRestrictions?: string[]
      budget?: number
    }
  ): Promise<BrowserUseTask> {
    const structuredPrompt = this.createMealPlanPrompt(prompt, preferences)

    // Optimize task configuration for production
    const taskData = {
      task: structuredPrompt,
      llm: "gemini-2.5-flash", // Use the recommended fast model
      maxSteps: 25, // Increased steps for more thorough research
      maxLLMTokens: 4000, // Set token limit for better cost management
      structuredOutput: JSON.stringify(this.getMealPlanSchema()),
      timeoutSeconds: 300, // 5 minute timeout
      metadata: {
        type: "meal_plan_generation",
        preferences: JSON.stringify(preferences || {}),
        timestamp: new Date().toISOString(),
        source: "diet-agent-production"
      }
    }

    console.log("Creating meal plan task with data:", JSON.stringify(taskData, null, 2))

    const response = await fetch(`${this.baseUrl}/tasks`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(taskData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Browser-Use API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      throw new Error(`Failed to create meal plan task: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    console.log("Browser-Use API Success - Task created:", result.id)
    return result
  }

  async runShoppingCartTask(
    mealPlan: MealPlan,
    supermarket: string,
    country: string
  ): Promise<BrowserUseTask> {
    const structuredPrompt = this.createShoppingCartPrompt(mealPlan, supermarket, country)

    const taskData = {
      task: structuredPrompt,
      llm: "gemini-2.5-flash", // Use the recommended fast model
      maxSteps: 35, // Reduced steps to avoid consecutive failures
      structuredOutput: JSON.stringify(this.getShoppingCartSchema()),
      metadata: {
        type: "shopping_cart_generation",
        mealPlanId: mealPlan.id,
        supermarket,
        country,
        timestamp: new Date().toISOString()
      }
    }

    const response = await fetch(`${this.baseUrl}/tasks`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(taskData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create shopping cart task: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return response.json()
  }

  async getTaskStatus(taskId: string): Promise<BrowserUseTask> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
      headers: this.getHeaders()
    })

    if (!response.ok) {
      throw new Error(`Failed to get task status: ${response.statusText}`)
    }

    return response.json()
  }

  async getTaskDetails(taskId: string): Promise<BrowserUseTask> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
      headers: this.getHeaders()
    })

    if (!response.ok) {
      throw new Error(`Failed to get task details: ${response.statusText}`)
    }

    return response.json()
  }

  async getTaskScreenshots(taskId: string): Promise<string[]> {
    // Note: Screenshots are included in the task details response in v2 API
    const taskDetails = await this.getTaskDetails(taskId)
    return taskDetails.screenshots || []
  }

  async getTaskGif(taskId: string): Promise<string | null> {
    // Note: GIF is included in the task details response in v2 API
    try {
      const taskDetails = await this.getTaskDetails(taskId)
      return taskDetails.gif_url || null
    } catch {
      return null
    }
  }

  async pauseTask(taskId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify({ action: "pause" })
    })

    if (!response.ok) {
      throw new Error(`Failed to pause task: ${response.statusText}`)
    }
  }

  async resumeTask(taskId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify({ action: "resume" })
    })

    if (!response.ok) {
      throw new Error(`Failed to resume task: ${response.statusText}`)
    }
  }

  async stopTask(taskId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify({ action: "stop" })
    })

    if (!response.ok) {
      throw new Error(`Failed to stop task: ${response.statusText}`)
    }
  }

  private createMealPlanPrompt(prompt: string, preferences?: any): string {
    return `You are an expert nutritionist and meal planner. Create a comprehensive meal plan based on the user's request.

User Request: "${prompt}"

${preferences ? `Additional Preferences:
- Days: ${preferences.days || 7}
- People: ${preferences.people || 4}
- Target Calories: ${preferences.calories || 'balanced'}
- Country: ${preferences.country || 'United States'}
- Dietary Restrictions: ${preferences.dietaryRestrictions?.join(', ') || 'none'}
- Budget: ${preferences.budget ? `$${preferences.budget}` : 'reasonable'}` : ''}

Please create a detailed meal plan that includes:

1. **Meal Plan Overview**: Title, description, nutritional summary
2. **Daily Meals**: Breakfast, lunch, dinner for each day with detailed recipes
3. **Ingredients**: Complete shopping list with quantities and estimated prices
4. **Nutrition**: Calorie and macronutrient breakdown per meal and daily totals

Focus on creating healthy, balanced meals with practical recipes. Use common ingredients that are widely available. Provide realistic cost estimates based on typical market prices.

Output Format: Provide a complete JSON structure following the specified schema.
Be thorough but practical in your meal planning approach.
`
  }

  private createShoppingCartPrompt(mealPlan: MealPlan, supermarket: string, country: string): string {
    return `
You are an expert grocery shopper. Create a detailed shopping cart for this meal plan.

Meal Plan: "${mealPlan.title}"
Supermarket: ${supermarket}
Country: ${country}

Instructions:
1. Visit the ${supermarket} website in ${country}
2. Search for each ingredient from the meal plan
3. Find the best matching products with current prices
4. Create a comprehensive shopping cart with:
   - Exact product matches
   - Current prices
   - Product images
   - Direct purchase links
   - Nutritional information when available
   - Proper quantities for ${mealPlan.people} people for ${mealPlan.days} days

Research Requirements:
- Use the actual ${supermarket} website
- Find real products currently available
- Include high-quality product images
- Get accurate current prices
- Create direct links to product pages
- Calculate totals and delivery fees

Be thorough and create a complete, realistic shopping cart that the user can immediately use to purchase items.
`
  }

  private getMealPlanSchema(): any {
    return {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "title": { "type": "string" },
        "description": { "type": "string" },
        "days": { "type": "number" },
        "people": { "type": "number" },
        "totalCalories": { "type": "number" },
        "totalProtein": { "type": "number" },
        "totalCarbs": { "type": "number" },
        "totalFat": { "type": "number" },
        "difficulty": { "type": "string", "enum": ["Easy", "Medium", "Hard"] },
        "meals": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "day": { "type": "number" },
              "breakfast": { "$ref": "#/$defs/meal" },
              "lunch": { "$ref": "#/$defs/meal" },
              "dinner": { "$ref": "#/$defs/meal" }
            }
          }
        },
        "estimatedCost": {
          "type": "object",
          "properties": {
            "min": { "type": "number" },
            "max": { "type": "number" },
            "currency": { "type": "string" }
          }
        },
        "supermarkets": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": { "type": "string" },
              "country": { "type": "string" },
              "website": { "type": "string" },
              "deliveryFee": { "type": "number" }
            }
          }
        },
        "nutritionalSummary": {
          "type": "object",
          "properties": {
            "dailyCalories": { "type": "number" },
            "dailyProtein": { "type": "number" },
            "dailyCarbs": { "type": "number" },
            "dailyFat": { "type": "number" }
          }
        }
      },
      "$defs": {
        "meal": {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "description": { "type": "string" },
            "prepTime": { "type": "number" },
            "cookTime": { "type": "number" },
            "servings": { "type": "number" },
            "calories": { "type": "number" },
            "protein": { "type": "number" },
            "carbs": { "type": "number" },
            "fat": { "type": "number" },
            "ingredients": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "name": { "type": "string" },
                  "quantity": { "type": "string" },
                  "unit": { "type": "string" },
                  "estimatedPrice": { "type": "number" },
                  "supermarketLinks": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "supermarket": { "type": "string" },
                        "url": { "type": "string" },
                        "price": { "type": "number" },
                        "imageUrl": { "type": "string" }
                      }
                    }
                  }
                }
              }
            },
            "instructions": {
              "type": "array",
              "items": { "type": "string" }
            },
            "tips": {
              "type": "array",
              "items": { "type": "string" }
            },
            "imageUrl": { "type": "string" },
            "tags": {
              "type": "array",
              "items": { "type": "string" }
            }
          }
        }
      },
      "required": ["id", "title", "description", "days", "people", "meals", "estimatedCost", "supermarkets", "nutritionalSummary"]
    }
  }

  private getShoppingCartSchema(): any {
    return {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "mealPlanId": { "type": "string" },
        "totalItems": { "type": "number" },
        "totalCost": { "type": "number" },
        "currency": { "type": "string" },
        "supermarket": { "type": "string" },
        "country": { "type": "string" },
        "items": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": { "type": "string" },
              "name": { "type": "string" },
              "quantity": { "type": "string" },
              "unit": { "type": "string" },
              "price": { "type": "number" },
              "totalPrice": { "type": "number" },
              "imageUrl": { "type": "string" },
              "productUrl": { "type": "string" },
              "category": { "type": "string" },
              "nutritionalInfo": {
                "type": "object",
                "properties": {
                  "calories": { "type": "number" },
                  "protein": { "type": "number" },
                  "carbs": { "type": "number" },
                  "fat": { "type": "number" }
                }
              }
            },
            "required": ["id", "name", "quantity", "price", "productUrl", "category"]
          }
        },
        "deliveryFee": { "type": "number" },
        "estimatedDeliveryTime": { "type": "string" },
        "subtotal": { "type": "number" },
        "tax": { "type": "number" },
        "grandTotal": { "type": "number" },
        "screenshots": {
          "type": "array",
          "items": { "type": "string" }
        },
        "createdAt": { "type": "string" }
      },
      "required": ["id", "mealPlanId", "totalItems", "totalCost", "currency", "supermarket", "country", "items", "subtotal", "grandTotal", "createdAt"]
    }
  }

  // Helper method to poll task completion
  async waitForTaskCompletion(
    taskId: string,
    onProgress?: (status: string, stepCount?: number) => void,
    pollInterval: number = 3000,
    maxWaitTime: number = 300000 // 5 minutes max wait time
  ): Promise<BrowserUseTask> {
    const startTime = Date.now()
    let backoffFactor = 1
    const maxPollInterval = 10000 // 10 seconds max poll interval
    
    while (true) {
      // Check if we've exceeded the maximum wait time
      if (Date.now() - startTime > maxWaitTime) {
        throw new Error(`Task ${taskId} timed out after ${maxWaitTime/1000} seconds`)
      }
      
      try {
        const task = await this.getTaskDetails(taskId)

        if (onProgress) {
          onProgress(task.status, task.steps?.length || 0)
        }

        if (task.status === "finished" || task.status === "failed" || task.status === "stopped") {
          return task
        }
        
        // Reset backoff on successful API call
        backoffFactor = 1
      } catch (error) {
        console.error(`Error fetching task details (will retry): ${error}`)
        // Increase backoff factor on error, up to a maximum
        backoffFactor = Math.min(backoffFactor * 1.5, maxPollInterval / pollInterval)
      }

      // Wait with exponential backoff if there were errors
      const currentPollInterval = Math.min(pollInterval * backoffFactor, maxPollInterval)
      await new Promise(resolve => setTimeout(resolve, currentPollInterval))
    }
  }

  // Validate API key
  async validateApiKey(): Promise<{valid: boolean, error?: string, credits?: number}> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/me`, {
        headers: this.getHeaders()
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        return {
          valid: false,
          error: `API validation failed: ${response.status} ${response.statusText} - ${errorText}`
        }
      }
      
      // Try to get account details including credits
      try {
        const accountData = await response.json()
        return {
          valid: true,
          credits: accountData.credits || accountData.balance || 0
        }
      } catch (parseError) {
        // If we can't parse JSON but response was OK, the key is still valid
        return { valid: true }
      }
    } catch (error) {
      console.error("API Key validation error:", error)
      return {
        valid: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }
}
