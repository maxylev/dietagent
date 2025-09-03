"use client"

interface DietChatMessage {
  role: "user" | "assistant"
  content: string
}

interface DietPlanSuggestion {
  title: string
  description: string
  features: string[]
  difficulty: "Easy" | "Medium" | "Hard"
  sampleMeals: string[]
}

interface DietChatResponse {
  message: string
  suggestions?: DietPlanSuggestion[]
  needsMoreInfo?: boolean
  nextQuestions?: string[]
}

export class DietChatService {
  private conversationHistory: DietChatMessage[] = []
  private userPreferences: Record<string, any> = {}
  private apiKey: string | null = null

  constructor(apiKey?: string) {
    this.apiKey = apiKey || localStorage.getItem("browser-use-api-key")
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey
  }

  async sendMessage(message: string): Promise<DietChatResponse> {
    this.conversationHistory.push({ role: "user", content: message })

    // Analyze user input and extract preferences
    this.extractPreferences(message)

    // If we have an API key, try to use Browser-Use API for enhanced responses
    if (this.apiKey) {
      try {
        const enhancedResponse = await this.getEnhancedResponse(message)
        this.conversationHistory.push({ role: "assistant", content: enhancedResponse.message })
        return enhancedResponse
      } catch (error) {
        console.warn("Failed to get enhanced response, falling back to local:", error)
        // Fall back to local response generation on error
      }
    }

    // Generate local contextual response as fallback
    const response = this.generateResponse(message)
    this.conversationHistory.push({ role: "assistant", content: response.message })
    return response
  }
  
  private async getEnhancedResponse(message: string): Promise<DietChatResponse> {
    if (!this.apiKey) {
      throw new Error("API key is required for enhanced responses")
    }
    
    const prompt = `You are a helpful nutrition assistant. The user has sent the following message: "${message}"

Based on their message, provide a helpful response about nutrition, diet planning, or meal suggestions.
If they're asking about meal plans, suggest some options but don't create a full plan - that will be handled separately.

Response format: A helpful, friendly response addressing their query about nutrition or diet.
`
    
    const headers = {
      "Content-Type": "application/json",
      "X-Browser-Use-API-Key": this.apiKey
    }
    
    const body = {
      prompt,
      max_tokens: 500,
      temperature: 0.7,
      model: "gemini-2.5-flash"
    }
    
    const response = await fetch("https://api.browser-use.com/api/v2/completions", {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    const assistantMessage = data.choices?.[0]?.text || data.output || "I'm sorry, I couldn't generate a response at this time."
    
    // Generate suggestions based on the message and extracted preferences
    const suggestions = this.shouldShowSuggestions(message) ? 
      this.generatePersonalizedSuggestions() : undefined
    
    return {
      message: assistantMessage,
      suggestions,
      needsMoreInfo: !this.hasBasicInfo()
    }
  }
  
  private shouldShowSuggestions(message: string): boolean {
    const lowerMessage = message.toLowerCase()
    return lowerMessage.includes("meal plan") || 
           lowerMessage.includes("diet plan") || 
           lowerMessage.includes("food plan") || 
           lowerMessage.includes("nutrition plan") ||
           lowerMessage.includes("suggest") || 
           lowerMessage.includes("recommendation")
  }

  private extractPreferences(message: string): void {
    const lowerMessage = message.toLowerCase()

    // Extract number of people
    const peopleMatch = lowerMessage.match(/(\d+)\s*(?:people|person|family|member)/i)
    if (peopleMatch) {
      this.userPreferences.people = Number.parseInt(peopleMatch[1])
    }

    // Extract number of days
    const daysMatch = lowerMessage.match(/(\d+)\s*(?:days?|weeks?)/i)
    if (daysMatch) {
      const days = Number.parseInt(daysMatch[1])
      this.userPreferences.days = lowerMessage.includes("week") ? days * 7 : days
    }

    // Extract dietary preferences
    if (lowerMessage.includes("vegetarian")) this.userPreferences.vegetarian = true
    if (lowerMessage.includes("vegan")) this.userPreferences.vegan = true
    if (lowerMessage.includes("keto") || lowerMessage.includes("low carb")) this.userPreferences.keto = true
    if (lowerMessage.includes("high protein")) this.userPreferences.highProtein = true
    if (lowerMessage.includes("gluten free")) this.userPreferences.glutenFree = true

    // Extract budget preferences
    if (lowerMessage.includes("budget") || lowerMessage.includes("cheap") || lowerMessage.includes("affordable")) {
      this.userPreferences.budget = "low"
    }
    if (lowerMessage.includes("premium") || lowerMessage.includes("gourmet")) {
      this.userPreferences.budget = "high"
    }

    // Extract supermarket preferences
    const supermarkets = ["walmart", "tesco", "carrefour", "kroger", "target", "whole foods", "trader joe"]
    for (const market of supermarkets) {
      if (lowerMessage.includes(market)) {
        this.userPreferences.supermarket = market
      }
    }
  }

  private generateResponse(message: string): DietChatResponse {
    const lowerMessage = message.toLowerCase()

    // Initial greeting or general diet request
    if (this.conversationHistory.length <= 2 || lowerMessage.includes("diet") || lowerMessage.includes("meal plan")) {
      return this.generateInitialResponse()
    }

    // User is providing more details
    if (this.hasBasicInfo()) {
      return this.generateDetailedSuggestions()
    }

    // Need more information
    return this.generateInfoRequest()
  }

  private generateInitialResponse(): DietChatResponse {
    const people = this.userPreferences.people || "your family"
    const days = this.userPreferences.days || "several days"

    return {
      message: `Great! I understand you want a meal plan for ${people} for ${days}. Let me create some personalized options for you based on what you've told me.`,
      suggestions: this.generateBasicSuggestions(),
      needsMoreInfo: !this.hasBasicInfo(),
      nextQuestions: this.getNextQuestions(),
    }
  }

  private generateDetailedSuggestions(): DietChatResponse {
    const suggestions = this.generatePersonalizedSuggestions()

    return {
      message:
        "Perfect! Based on your preferences, I've created 3 tailored meal plan options for you. Each one is designed to meet your specific needs:",
      suggestions,
      needsMoreInfo: false,
    }
  }

  private generateInfoRequest(): DietChatResponse {
    const questions = this.getNextQuestions()

    return {
      message: "I'd love to create the perfect meal plan for you! Could you tell me a bit more about your preferences?",
      needsMoreInfo: true,
      nextQuestions: questions,
    }
  }

  private generateBasicSuggestions(): DietPlanSuggestion[] {
    // These are just initial suggestions that will be shown before the user proceeds to the Browser-Use API
    // They're designed to guide users toward making a more specific request that will be handled by the API
    return [
      {
        title: "Personalized Meal Plan",
        description: "Customized to your specific needs and preferences",
        features: ["Tailored nutrition", "Personalized portions", "Preference-based"],
        difficulty: "Medium",
        sampleMeals: ["Based on your preferences", "Customized recipes", "Personalized meals"]
      },
      {
        title: "Quick & Healthy",
        description: "30-minute meals for busy lifestyles with real-time pricing",
        features: ["Fast preparation", "Current market prices", "Healthy ingredients"],
        difficulty: "Easy",
        sampleMeals: ["Quick protein options", "Simple healthy sides", "Fast nutritious meals"]
      },
      {
        title: "Budget-Friendly Plan",
        description: "Cost-effective meals with current supermarket pricing",
        features: ["Real-time pricing", "Budget optimization", "Affordable nutrition"],
        difficulty: "Easy",
        sampleMeals: ["Cost-effective proteins", "Budget-friendly meals", "Affordable options"]
      },
    ]
  }

  private generatePersonalizedSuggestions(): DietPlanSuggestion[] {
    const suggestions: DietPlanSuggestion[] = []

    if (this.userPreferences.vegetarian || this.userPreferences.vegan) {
      suggestions.push({
        title: "Plant-Based Power",
        description: "Delicious vegetarian/vegan meals packed with nutrition",
        features: ["High protein plants", "Colorful vegetables", "Satisfying portions"],
        difficulty: "Easy",
        sampleMeals: ["Lentil Shepherd's Pie", "Black Bean Burgers", "Tofu Scramble"]
      })
    }

    if (this.userPreferences.keto || this.userPreferences.highProtein) {
      suggestions.push({
        title: "High-Protein Focus",
        description: "Protein-rich meals for active lifestyles",
        features: ["Lean meats & fish", "Low carb options", "Muscle-building nutrition"],
        difficulty: "Medium",
        sampleMeals: ["Steak & Asparagus", "Grilled Chicken Salad", "Egg White Omelet"]
      })
    }

    if (this.userPreferences.budget === "low") {
      suggestions.push({
        title: "Budget-Friendly Nutrition",
        description: "Maximum nutrition for your dollar",
        features: ["Bulk ingredients", "Meal prep friendly", "Cost-effective proteins"],
        difficulty: "Easy",
        sampleMeals: ["Chicken & Rice", "Bean Chili", "Oatmeal & Fruit"]
      })
    }

    // Always include a balanced option
    suggestions.push({
      title: "Custom Balanced Plan",
      description: "Tailored to your specific preferences and needs",
      features: ["Personalized portions", "Preferred ingredients", "Flexible scheduling"],
      difficulty: "Medium",
      sampleMeals: ["Grilled Salmon", "Turkey Meatballs", "Vegetable Curry"]
    })

    return suggestions.slice(0, 3) // Return max 3 suggestions
  }

  private hasBasicInfo(): boolean {
    return !!(this.userPreferences.people || this.userPreferences.days)
  }

  private getNextQuestions(): string[] {
    const questions: string[] = []

    if (!this.userPreferences.people) {
      questions.push("How many people are you planning meals for?")
    }

    if (!this.userPreferences.days) {
      questions.push("How many days would you like the meal plan to cover?")
    }

    if (!this.userPreferences.supermarket) {
      questions.push("Do you have a preferred supermarket for shopping?")
    }

    if (Object.keys(this.userPreferences).length < 3) {
      questions.push("Any dietary restrictions or preferences? (vegetarian, keto, etc.)")
    }

    return questions
  }

  getPreferences(): Record<string, any> {
    return { ...this.userPreferences }
  }

  reset(): void {
    this.conversationHistory = []
    this.userPreferences = {}
  }
}