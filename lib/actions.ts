"use server"

import type { DietFormData, MealPlanResponse, MealPlanOption, ShoppingCartItem } from "./types"

// OpenRouter API configuration
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

// Browser Use Cloud API configuration
const BROWSERUSECLOUD_API_URL = "https://api.browseruse.com/v1/task"

// Supermarket URL mappings
const SUPERMARKET_URLS = {
  walmart: "https://www.walmart.com",
  tesco: "https://www.tesco.com",
  carrefour: "https://www.carrefour.com",
  kroger: "https://www.kroger.com",
  target: "https://www.target.com",
} as const

export async function generateMealPlans(formData: DietFormData): Promise<MealPlanResponse | { error: string }> {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return {
        error: "OpenRouter API key not configured. Please add OPENROUTER_API_KEY to your environment variables.",
      }
    }

    // Construct detailed prompt for meal plan generation
    const prompt = `You are a professional nutritionist and meal planning assistant. Based on the user's requirements, create exactly 3 distinct meal plan options.

User Requirements:
- Duration: ${formData.days} days
- People: ${formData.people} people
- Daily calories per person: ${formData.calories} kcal
- Daily protein per person: ${formData.protein}g
- Preferred supermarket: ${formData.supermarket}

Instructions:
1. Create 3 different meal plan options with distinct themes (e.g., Mediterranean, High-Protein, Balanced)
2. Each option should have meals for all ${formData.days} days
3. Scale ingredient quantities for ${formData.people} people
4. Ensure each daily plan meets the calorie and protein targets
5. Consolidate all unique ingredients into a shopping list for each option
6. Use common ingredients available at ${formData.supermarket}

Your response MUST be only a JSON object matching this exact structure:

{
  "mealPlanOptions": [
    {
      "optionId": 1,
      "title": "Plan Name",
      "description": "Brief description of the plan's focus and benefits",
      "dailyPlan": [
        {
          "day": 1,
          "meals": {
            "breakfast": {
              "name": "Meal Name",
              "ingredients": [
                {"item": "ingredient name", "quantity": "amount for ${formData.people} people"}
              ]
            },
            "lunch": {
              "name": "Meal Name",
              "ingredients": [
                {"item": "ingredient name", "quantity": "amount for ${formData.people} people"}
              ]
            },
            "dinner": {
              "name": "Meal Name",
              "ingredients": [
                {"item": "ingredient name", "quantity": "amount for ${formData.people} people"}
              ]
            }
          }
        }
      ],
      "shoppingList": [
        {"item": "consolidated ingredient", "quantity": "total amount needed"}
      ]
    }
  ]
}

Do not include any text before or after the JSON object. Ensure the JSON is valid and complete.`

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Diet Agent",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("OpenRouter API error:", errorData)
      return { error: `Failed to generate meal plans: ${response.status} ${response.statusText}` }
    }

    const data = await response.json()

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return { error: "Invalid response format from OpenRouter API" }
    }

    const content = data.choices[0].message.content.trim()

    try {
      // Parse the JSON response from the LLM
      const mealPlanResponse: MealPlanResponse = JSON.parse(content)

      // Validate the response structure
      if (!mealPlanResponse.mealPlanOptions || !Array.isArray(mealPlanResponse.mealPlanOptions)) {
        return { error: "Invalid meal plan format received from AI" }
      }

      // Ensure we have exactly 3 options
      if (mealPlanResponse.mealPlanOptions.length !== 3) {
        return { error: "Expected 3 meal plan options but received a different number" }
      }

      return mealPlanResponse
    } catch (parseError) {
      console.error("Failed to parse meal plan JSON:", parseError)
      console.error("Raw content:", content)
      return { error: "Failed to parse meal plan response. Please try again." }
    }
  } catch (error) {
    console.error("Error generating meal plans:", error)
    return { error: "An unexpected error occurred while generating meal plans. Please try again." }
  }
}

export async function createShoppingCart(
  plan: MealPlanOption,
  supermarket: string,
): Promise<ShoppingCartItem[] | { error: string }> {
  try {
    const apiKey = process.env.BROWSERUSECLOUD_API_KEY
    if (!apiKey) {
      return {
        error:
          "Browser Use Cloud API key not configured. Please add BROWSERUSECLOUD_API_KEY to your environment variables.",
      }
    }

    const supermarketUrl = SUPERMARKET_URLS[supermarket as keyof typeof SUPERMARKET_URLS]
    if (!supermarketUrl) {
      return { error: `Unsupported supermarket: ${supermarket}` }
    }

    console.log(`Creating shopping cart for ${plan.title} at ${supermarket}`)

    const productSearchPromises = plan.shoppingList.map(async (ingredient) => {
      try {
        const searchPrompt = `Go to ${supermarketUrl}. Search for "${ingredient.item} ${ingredient.quantity}". Find the best matching product and extract the following information:
        
        1. Product name (exact as shown on the website)
        2. Price (as a number, extract just the numeric value)
        3. Quantity/weight description (e.g., "500g pack", "1 dozen")
        4. Product image URL (full URL to the product image)
        5. Direct product page URL
        
        Return the data as a single, clean JSON object with these exact keys:
        {
          "productName": "exact product name",
          "price": numeric_price_value,
          "quantity": "quantity description",
          "imageUrl": "full_image_url",
          "productUrl": "full_product_page_url"
        }
        
        If you cannot find a suitable product, return:
        {
          "productName": "${ingredient.item}",
          "price": 0,
          "quantity": "${ingredient.quantity}",
          "imageUrl": "",
          "productUrl": "",
          "error": "Product not found"
        }
        
        Do not include any text before or after the JSON object.`

        const response = await fetch(BROWSERUSECLOUD_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: searchPrompt,
            timeout: 30000, // 30 second timeout per search
          }),
        })

        if (!response.ok) {
          console.error(`Browser Use Cloud API error for ${ingredient.item}:`, response.statusText)
          // Return fallback item if API fails
          return {
            productName: ingredient.item,
            price: 0,
            quantity: ingredient.quantity,
            imageUrl: "",
            productUrl: "",
            error: `Failed to find ${ingredient.item}`,
          }
        }

        const data = await response.json()

        // Extract the result from Browser Use Cloud response
        let productData: any
        try {
          // Browser Use Cloud typically returns results in a 'result' or 'output' field
          const resultText = data.result || data.output || data.response || ""
          productData = JSON.parse(resultText.trim())
        } catch (parseError) {
          console.error(`Failed to parse product data for ${ingredient.item}:`, parseError)
          return {
            productName: ingredient.item,
            price: 0,
            quantity: ingredient.quantity,
            imageUrl: "",
            productUrl: "",
            error: `Failed to parse product data`,
          }
        }

        // Validate and clean the product data
        const shoppingCartItem: ShoppingCartItem = {
          productName: productData.productName || ingredient.item,
          price: typeof productData.price === "number" ? productData.price : 0,
          quantity: productData.quantity || ingredient.quantity,
          imageUrl: productData.imageUrl || "",
          productUrl: productData.productUrl || "",
        }

        return shoppingCartItem
      } catch (error) {
        console.error(`Error searching for ${ingredient.item}:`, error)
        // Return fallback item if individual search fails
        return {
          productName: ingredient.item,
          price: 0,
          quantity: ingredient.quantity,
          imageUrl: "",
          productUrl: "",
        }
      }
    })

    console.log(`Searching for ${plan.shoppingList.length} products...`)
    const shoppingCartItems = await Promise.all(productSearchPromises)

    const validItems = shoppingCartItems.filter((item) => !("error" in item))
    const failedItems = shoppingCartItems.filter((item) => "error" in item)

    if (failedItems.length > 0) {
      console.log(
        `Warning: ${failedItems.length} items could not be found:`,
        failedItems.map((item) => item.productName),
      )
    }

    console.log(`Successfully found ${validItems.length} out of ${plan.shoppingList.length} products`)

    // Return all items (including failed ones with fallback data)
    return shoppingCartItems as ShoppingCartItem[]
  } catch (error) {
    console.error("Error creating shopping cart:", error)
    return { error: "An unexpected error occurred while creating the shopping cart. Please try again." }
  }
}
