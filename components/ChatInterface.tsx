"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { BrowserUseService, type MealPlan } from "@/lib/browser-use-service"
import { DietChatService } from "@/lib/diet-chat-service"
import { useHistory } from "@/lib/history-context"
import { cn } from "@/lib/utils"
import { Bot, ExternalLink, Key, Loader2, MessageCircle, Mic, MicOff, Send, User, Utensils, X } from "lucide-react"
import Link from "next/link"
import React, { useEffect, useRef, useState } from "react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: Array<{
    title: string
    description: string
    features: string[]
    difficulty: string
    sampleMeals: string[]
  }>
  flowState?: "initial" | "recipe_selection" | "customization" | "approved" | "shopping"
}

interface ChatInterfaceProps {
  onClose: () => void
  onStateChange: (state: "idle" | "listening" | "processing" | "responding") => void
  onTextRecognized: (text: string) => void
}

// Sub-component for a cleaner, animated typing indicator
const TypingIndicator = () => (
  <div className="flex items-center gap-1">
    <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0s' }} />
    <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.1s' }} />
    <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.2s' }} />
  </div>
)

// API Key Setup Component
function ApiKeySetup({ onApiKeySet }: { onApiKeySet: () => void }) {
  const [apiKey, setApiKey] = React.useState("")
  const [isValidating, setIsValidating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [validationDetails, setValidationDetails] = React.useState<{credits?: number, message?: string} | null>(null)

  const handleValidateAndSave = async () => {
    if (!apiKey.trim()) {
      setError("Please enter your Browser-Use API key")
      return
    }

    if (!apiKey.trim().startsWith('bu_')) {
      setError("Browser-Use API keys should start with 'bu_'. Please check your API key.")
      return
    }

    setIsValidating(true)
    setError(null)
    setValidationDetails(null)

    try {
      const service = new BrowserUseService(apiKey.trim())
      const validationResult = await service.validateApiKey()

      if (validationResult.valid) {
        // Store validation details to show to the user
        setValidationDetails({
          credits: validationResult.credits,
          message: validationResult.credits !== undefined ? 
            `API key is valid. You have ${validationResult.credits} credits available.` : 
            "API key is valid."
        })
        
        // Save the API key to local storage
        localStorage.setItem("browser-use-api-key", apiKey.trim())
        
        // Short delay to show validation success message before proceeding
        setTimeout(() => {
          onApiKeySet()
        }, 1500)
      } else {
        setError(validationResult.error || "Invalid API key. Please check your Browser-Use API key and ensure you have credits available.")
      }
    } catch (err) {
      setError("Failed to validate API key. Please check your internet connection and try again.")
      console.error("API key validation error:", err)
    } finally {
      setIsValidating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isValidating) {
      handleValidateAndSave()
    }
  }

  return (
    <Card className="glass-strong border-0 w-full h-full flex flex-col shadow-2xl rounded-none sm:rounded-xl backdrop-blur-xl overflow-hidden">
      <CardHeader className="pb-3 px-3 sm:px-4 md:px-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <Key className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </div>
            <CardTitle className="text-base sm:text-lg font-heading">Setup Required</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Key className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Browser-Use API Required</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                To use this meal planning app, you need to set up your Browser-Use Cloud API key. This enables AI-powered research and real-time pricing from supermarkets.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="api-key" className="block text-sm font-medium mb-2">
                Browser-Use API Key
              </label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your API key (bu_...)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full"
                disabled={isValidating}
              />
              {error && (
                <p className="text-sm text-destructive mt-2">{error}</p>
              )}
              
              {validationDetails && !error && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mt-2 text-sm text-green-800 dark:text-green-200">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span>{validationDetails.message}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleValidateAndSave}
                disabled={isValidating || !apiKey.trim()}
                className="w-full"
                size="lg"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Validate & Save API Key
                  </>
                )}
              </Button>

              <div className="text-center">
                <a
                  href="https://cloud.browser-use.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  Get your API key at Browser-Use Cloud
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <h4 className="font-medium mb-2">Why do I need an API key?</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Enables AI-powered supermarket research</li>
                <li>• Provides real-time pricing and availability</li>
                <li>• Generates personalized meal plans</li>
                <li>• Creates accurate shopping carts</li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
              <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">Having trouble?</h4>
              <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                <li>• Make sure you have a valid Browser-Use API key</li>
                <li>• API keys start with "bu_"</li>
                <li>• Check your account has credits available</li>
                <li>• Try refreshing the page if validation fails</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ChatInterface({ onClose, onStateChange, onTextRecognized }: ChatInterfaceProps) {
  const { addChatToHistory, addRecipeToHistory, addPurchaseToHistory } = useHistory()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hello! I'm your AI nutrition assistant powered by real-time supermarket data through Browser-Use Cloud API. I research actual store prices and availability to create personalized meal plans.\n\n💡 **Try asking me:**\n• \"Make a meal plan for 3 people for 7 days\"\n• \"Create a budget-friendly plan under $100\"\n• \"Plan healthy meals for weight loss\"\n• \"Make a vegetarian meal plan\"\n\nI connect to real supermarkets (Whole Foods, Kroger, Walmart, etc.) to get current prices and create accurate shopping lists!",
      timestamp: new Date(),
      flowState: "initial",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentFlowState, setCurrentFlowState] = useState<
    "initial" | "recipe_selection" | "customization" | "approved" | "shopping"
  >("initial")
  const [currentChatId, setCurrentChatId] = useState<string>("")
  const [browserUseService, setBrowserUseService] = useState<BrowserUseService | null>(null)
  const [showApiSetup, setShowApiSetup] = useState(false)
  const [isBrowserUseTask, setIsBrowserUseTask] = useState(false)
  const [taskProgress, setTaskProgress] = useState<string>("")
  const [apiError, setApiError] = useState<string | null>(null)
  const [generatedMealPlans, setGeneratedMealPlans] = useState<MealPlan[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatServiceRef = useRef<DietChatService | null>(null)
  const welcomeMessageUpdatedRef = useRef(false)

  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: speechSupported,
    error: speechError,
  } = useSpeechRecognition({
    continuous: false,
    interimResults: true,
  })

  // Enhanced scroll behavior for better chat history visibility
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        // Try multiple scroll methods for maximum compatibility
        const scrollContainer = messagesEndRef.current.closest('[data-radix-scroll-area-viewport]')

        if (scrollContainer) {
          // Method 1: Direct scrollTop
          scrollContainer.scrollTop = scrollContainer.scrollHeight

          // Method 2: scrollIntoView as backup
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "end",
              inline: "nearest"
            })
          }, 50)
        } else {
          // Fallback for non-radix containers
          messagesEndRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest"
          })
        }
      }
    }

    // Scroll immediately and again after a short delay
    scrollToBottom()
    const timeoutId = setTimeout(scrollToBottom, 150)
    return () => clearTimeout(timeoutId)
  }, [messages.length, messages])

  // Additional scroll on mount
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (messagesEndRef.current) {
        const scrollContainer = messagesEndRef.current.closest('[data-radix-scroll-area-viewport]')
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight
        }
      }
    }, 100)
    return () => clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    // Focus input after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
    return () => clearTimeout(timeoutId)
  }, [])

  // Ensure input stays focused during interactions
  useEffect(() => {
    const handleFocus = () => {
      if (inputRef.current && !isProcessing && !isListening) {
        inputRef.current.focus()
      }
    }

    // Refocus on window focus (useful for mobile)
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [isProcessing, isListening])

  // Initialize browser-use service if API key is available
  useEffect(() => {
    try {
      const apiKey = localStorage.getItem("browser-use-api-key")
      if (apiKey) {
        const service = new BrowserUseService(apiKey)
        setBrowserUseService(service)
        setShowApiSetup(false)
        
        // Also initialize the DietChatService with the API key
        chatServiceRef.current = new DietChatService(apiKey)
      } else {
        setBrowserUseService(null)
        setShowApiSetup(true)
        
        // Initialize DietChatService without API key
        chatServiceRef.current = new DietChatService()
      }
    } catch (error) {
      console.warn("Error initializing browser-use service:", error)
      setBrowserUseService(null)
      setShowApiSetup(true)
      
      // Initialize DietChatService without API key as fallback
      chatServiceRef.current = new DietChatService()
    }
  }, [])

  // Handle API key setup completion
  const handleApiKeySet = async () => {
    const apiKey = localStorage.getItem("browser-use-api-key")
    if (apiKey) {
      const service = new BrowserUseService(apiKey)

      // Validate the API key before proceeding
      setApiError(null)
      setIsProcessing(true)
      setTaskProgress("Validating API key...")
      
      try {
        const validationResult = await service.validateApiKey()
        
        if (validationResult.valid) {
          setBrowserUseService(service)
          setShowApiSetup(false)
          console.log("✅ API key validated successfully")
          
          // Show credits information if available
          if (validationResult.credits !== undefined) {
            const creditsMessage: Message = {
              id: "credits-info-" + Date.now(),
              role: "assistant",
              content: `🔑 **API Key Validated Successfully**\n\nYour Browser-Use API key is valid and ready to use.\n\n${validationResult.credits > 0 ? 
                `💰 **Available Credits**: ${validationResult.credits}\n\nYou have sufficient credits to create meal plans.` : 
                `⚠️ **Credits**: ${validationResult.credits || 0}\n\nYou may need to add more credits to your account.`}`,
              timestamp: new Date(),
              flowState: "initial"
            }
            setMessages([creditsMessage])
          }
        } else {
          console.error("❌ API key validation failed:", validationResult.error)
          setApiError(validationResult.error || "API key validation failed. Please check your Browser-Use API key and try again.")
          localStorage.removeItem("browser-use-api-key")
          setShowApiSetup(true)
        }
      } catch (error) {
        console.error("❌ API key validation error:", error)
        setApiError(error instanceof Error ? error.message : "Unknown error validating API key")
        localStorage.removeItem("browser-use-api-key")
        setShowApiSetup(true)
      } finally {
        setIsProcessing(false)
        setTaskProgress("")
      }
    }
  }

  // Update welcome message when browser-use service becomes available (only once)
  useEffect(() => {
    if (browserUseService && !welcomeMessageUpdatedRef.current &&
        messages.length === 1 && messages[0].id === "welcome" &&
        messages[0].content.includes("Diet Agent") &&
        !messages[0].content.includes("browser-use AI")) {
      const enhancedWelcomeMessage: Message = {
        id: "welcome",
        role: "assistant",
        content: "🚀 **Browser-Use Cloud API Connected!**\n\nI'm now connected to real supermarket data and can:\n\n✅ Research current prices from actual stores\n✅ Find real product availability \n✅ Create accurate shopping carts\n✅ Generate personalized meal plans\n\nTry: \"Make a meal plan for 4 people under $120\"",
        timestamp: new Date(),
        flowState: "initial",
      }
      setMessages([enhancedWelcomeMessage])
      welcomeMessageUpdatedRef.current = true
    }
  }, [browserUseService]) // Only depend on browserUseService

  useEffect(() => {
    if (transcript && !isListening) {
      setInputValue(transcript)
      resetTranscript()
      setTimeout(() => {
        handleSendMessage(transcript)
      }, 500)
    }
  }, [transcript, isListening])

  useEffect(() => {
    if (isListening) {
      onStateChange("listening")
    } else if (isProcessing) {
      onStateChange("processing")
    } else {
      onStateChange("idle")
    }
  }, [isListening, isProcessing, onStateChange])

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue.trim()
    if (!textToSend || isProcessing) return

    const recipeKeywords = ["recipe", "show me", "view recipe", "cooking instructions", "how to make", "prepare"]
    const isRecipeRequest = recipeKeywords.some((keyword) => textToSend.toLowerCase().includes(keyword))

    if (isRecipeRequest && currentFlowState !== "initial") {
      window.location.href = "/demo/meal-details"
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date(),
      flowState: currentFlowState,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsProcessing(true)
    onStateChange("processing")
    onTextRecognized(textToSend)

    // Check if this is a meal plan request and browser-use is available
    const mealPlanKeywords = ["meal plan", "meal planning", "diet plan", "weekly meal", "meal ideas", "plan for"]
    const isMealPlanRequest = mealPlanKeywords.some((keyword) =>
      textToSend.toLowerCase().includes(keyword)
    )

    if (isMealPlanRequest && browserUseService) {
      await handleBrowserUseMealPlan(textToSend, userMessage)
    } else {
      await handleRegularChat(textToSend, userMessage)
    }
  }

  const handleBrowserUseMealPlan = async (textToSend: string, userMessage: Message) => {
    setIsBrowserUseTask(true)
    setTaskProgress("Initializing AI agent for meal planning...")
    setApiError(null)

    // Parse preferences from the user's message
    const preferences = parseMealPlanPreferences(textToSend)
    
    // Maximum number of retries
    const MAX_RETRIES = 2
    let retryCount = 0
    let lastError: Error | null = null

    while (retryCount <= MAX_RETRIES) {
      try {
        // Check if API key is available
        if (!browserUseService) {
          throw new Error("Browser-Use API service is not available. Please check your API key configuration.")
        }

        // If this is a retry, inform the user
        if (retryCount > 0) {
          setTaskProgress(`Retrying... (Attempt ${retryCount} of ${MAX_RETRIES})`)
          await new Promise(resolve => setTimeout(resolve, 1000))
        }

        // Create browser-use task
        const task = await browserUseService.runMealPlanTask(textToSend, preferences)
        console.log("Browser-Use task created:", task.id)
        setTaskProgress("AI agent is researching current market prices and creating your personalized meal plan...")

        // Wait for completion with progress updates
        const completedTask = await browserUseService.waitForTaskCompletion(
          task.id,
          (status, stepCount) => {
            if (status === "running") {
              setTaskProgress(`AI agent is working... (${stepCount || 0} steps completed)`)
            } else if (status === "finished") {
              setTaskProgress("AI agent has completed your meal plan! Processing results...")
            } else if (status === "failed" || status === "stopped") {
              setTaskProgress(`Task ${status}. ${retryCount < MAX_RETRIES ? "Will retry shortly..." : "Maximum retries reached."}`)
            }
          }
        )

        // Check for task failure
        if (completedTask.status === "failed" || completedTask.status === "stopped") {
          throw new Error(`Task ${completedTask.status}: ${completedTask.error || "Unknown error"}`)
        }

        // Check for missing output
        if (!completedTask.output) {
          throw new Error("No output received from browser-use task")
        }

        // Handle non-JSON responses (error messages)
        if (!completedTask.output.trim().startsWith('{') && !completedTask.output.trim().startsWith('[')) {
          throw new Error(`API returned error message: ${completedTask.output}`)
        }

        // Parse the meal plan data
        const mealPlanData = JSON.parse(completedTask.output)
        
        // Validate the meal plan data has required fields
        if (!mealPlanData.title || !mealPlanData.description || !mealPlanData.meals || !mealPlanData.meals.length) {
          throw new Error("Incomplete meal plan data received")
        }
        
        console.log("Parsed meal plan data successfully")
        setGeneratedMealPlans([mealPlanData])

        // Create suggestions for the chat interface
        const suggestions = [{
          title: mealPlanData.title,
          description: mealPlanData.description,
          features: [
            `${mealPlanData.days} days`,
            `${mealPlanData.people} people`,
            `~$${mealPlanData.estimatedCost.max}`,
            mealPlanData.difficulty
          ],
          difficulty: mealPlanData.difficulty,
          sampleMeals: mealPlanData.meals[0] ? [
            mealPlanData.meals[0].breakfast.name,
            mealPlanData.meals[0].lunch.name,
            mealPlanData.meals[0].dinner.name
          ] : []
        }]

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `I've created a personalized meal plan for you using real-time market research! Here's what I found:\n\n**${mealPlanData.title}**\n${mealPlanData.description}\n\n• ${mealPlanData.days} days for ${mealPlanData.people} people\n• Estimated cost: $${mealPlanData.estimatedCost.min} - $${mealPlanData.estimatedCost.max}\n• Difficulty: ${mealPlanData.difficulty}\n\nThe AI agent researched current prices from ${mealPlanData.supermarkets.length} different supermarkets to give you accurate cost estimates.`,
          timestamp: new Date(),
          suggestions: suggestions,
          flowState: "recipe_selection",
        }

        setMessages((prev) => [...prev, assistantMessage])
        setCurrentFlowState("recipe_selection")

        // Save to history
        addChatToHistory({
          query: textToSend,
          plan: mealPlanData.title,
          messages: [...messages, userMessage, assistantMessage],
        })
        
        // Success - exit retry loop
        return
        
      } catch (error) {
        console.error(`Browser-use meal plan error (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, error)
        lastError = error instanceof Error ? error : new Error(String(error))
        
        // If we've reached max retries, break out of the loop
        if (retryCount >= MAX_RETRIES) {
          break
        }
        
        // Increase retry count and wait before retrying
        retryCount++
        await new Promise(resolve => setTimeout(resolve, 2000 * retryCount)) // Exponential backoff
      }
    }
    
    // If we get here, all retries failed
    const errorMsg = lastError?.message || "Unknown error occurred"
    setApiError(errorMsg)
    
    let userFriendlyMessage = "I apologize, but I encountered an error while creating your meal plan."
    let additionalHelp = ""

    if (errorMsg.includes("Agent stopped because of consecutive step failures")) {
      userFriendlyMessage += " The AI agent had difficulty completing the research due to technical constraints."
      additionalHelp = " Try simplifying your request or breaking it into smaller parts."
    } else if (errorMsg.includes("API returned error message")) {
      userFriendlyMessage += " There was an issue with the AI processing system."
      additionalHelp = " This is usually temporary - please try again in a few moments."
    } else if (errorMsg.includes("JSON") || errorMsg.includes("Incomplete meal plan data")) {
      userFriendlyMessage += " There was a data formatting issue during processing."
      additionalHelp = " Please try rephrasing your request."
    } else if (errorMsg.includes("API key")) {
      userFriendlyMessage += " There seems to be an issue with the API key configuration."
      additionalHelp = " Please check your Browser-Use API key in the setup."
    } else if (errorMsg.includes("network") || errorMsg.includes("fetch")) {
      userFriendlyMessage += " There was a network connectivity issue."
      additionalHelp = " Please check your internet connection and try again."
    } else if (errorMsg.includes("Task failed") || errorMsg.includes("Task stopped")) {
      userFriendlyMessage += " The AI agent task was unsuccessful."
      additionalHelp = " This could be due to complexity or temporary service limitations."
    }

    userFriendlyMessage += ` ${additionalHelp} Please try again in a few moments.`

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: `${userFriendlyMessage}\n\n⚠️ **Error**: The AI agent encountered an issue while processing your request. This could be due to API limits, connectivity issues, or temporary service disruption.\n\n💡 **Suggestions**:\n• Try simplifying your request\n• Check your internet connection\n• Verify your API key is valid\n• Try again in a few moments`,
      timestamp: new Date(),
      flowState: "initial",
    }

    setMessages((prev) => [...prev, assistantMessage])
    setCurrentFlowState("initial")
    setIsBrowserUseTask(false)
    setTaskProgress("")
    setIsProcessing(false)
    onStateChange("idle")
  }

  const handleRegularChat = async (textToSend: string, userMessage: Message) => {
    try {
      if (!chatServiceRef.current) {
        // Initialize with API key if available
        const apiKey = localStorage.getItem("browser-use-api-key")
        chatServiceRef.current = new DietChatService(apiKey || undefined)
      }
      
      setTaskProgress("Processing your request...")
      
      const response = await chatServiceRef.current.sendMessage(textToSend)
      let nextFlowState = currentFlowState
      if (currentFlowState === "initial" && response.suggestions) {
        nextFlowState = "recipe_selection"
        // Generate chat ID if this is the first meaningful interaction
        if (!currentChatId) {
          setCurrentChatId(Date.now().toString())
        }
      }
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
        suggestions: response.suggestions,
        flowState: nextFlowState,
      }
      setMessages((prev) => [...prev, assistantMessage])
      setCurrentFlowState(nextFlowState)

      // Save to history if we've moved to recipe selection
      if (nextFlowState === "recipe_selection" && response.suggestions && response.suggestions.length > 0) {
        addChatToHistory({
          query: textToSend,
          plan: response.suggestions[0].title,
          messages: [...messages, userMessage, assistantMessage],
        })
      }
    } catch (error) {
      console.error("Chat error:", error)
      
      // Handle error with user-friendly message
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I'm sorry, I encountered an error while processing your request. ${errorMessage.includes("API") ? "There might be an issue with the API connection." : "Please try again."}`,
        timestamp: new Date(),
        flowState: currentFlowState,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsProcessing(false)
      setTaskProgress("")
      onStateChange("responding")
      setTimeout(() => onStateChange("idle"), 2000)
    }
  }

  const parseMealPlanPreferences = (message: string) => {
    const preferences: any = {}

    // Extract number of people
    const peopleMatch = message.match(/(\d+)\s*(?:people?|person|ppl)/i)
    if (peopleMatch) {
      preferences.people = parseInt(peopleMatch[1])
    }

    // Extract number of days
    const daysMatch = message.match(/(\d+)\s*(?:days?|day)/i)
    if (daysMatch) {
      preferences.days = parseInt(daysMatch[1])
    }

    // Extract calorie target
    const calorieMatch = message.match(/(\d+)\s*calories?/i)
    if (calorieMatch) {
      preferences.calories = parseInt(calorieMatch[1])
    }

    // Extract country
    const countryKeywords = ["usa", "us", "united states", "uk", "united kingdom", "canada", "australia", "germany", "france"]
    for (const country of countryKeywords) {
      if (message.toLowerCase().includes(country)) {
        preferences.country = country === "usa" || country === "us" ? "United States" :
                             country === "uk" ? "United Kingdom" : country
        break
      }
    }

    // Extract dietary restrictions
    const dietaryKeywords = ["vegetarian", "vegan", "keto", "paleo", "gluten-free", "dairy-free", "low-carb", "high-protein"]
    const restrictions: string[] = []
    for (const keyword of dietaryKeywords) {
      if (message.toLowerCase().includes(keyword)) {
        restrictions.push(keyword)
      }
    }
    if (restrictions.length > 0) {
      preferences.dietaryRestrictions = restrictions
    }

    // Extract budget
    const budgetMatch = message.match(/\$?(\d+)(?:\s*dollars?|\s*budget)/i)
    if (budgetMatch) {
      preferences.budget = parseInt(budgetMatch[1])
    }

    return preferences
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleMicClick = async () => {
    if (isListening) {
      stopListening()
      return
    }

      try {
        await startListening()
      } catch (error) {
      console.warn("Speech recognition failed:", error)
      // Error is already handled in the hook - user can still use text input
    }
  }

  try {
    // Show API setup if no API key is configured
    if (showApiSetup) {
      return <ApiKeySetup onApiKeySet={handleApiKeySet} />
  }

  return (
      <Card className="glass-strong border-0 w-full h-full flex flex-col shadow-2xl rounded-xl backdrop-blur-xl overflow-hidden">
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 md:px-6 border-b border-border/50 flex-shrink-0 sticky top-0 z-10 bg-background/95 backdrop-blur-md">
        <div className="flex items-center justify-between min-h-[2.5rem] sm:min-h-[3rem]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </div>
            <CardTitle className="text-sm sm:text-base md:text-lg font-heading truncate">Diet Chat</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-destructive/10 hover:text-destructive rounded-full"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">
            <Bot className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
            AI Assistant
          </Badge>
          {speechSupported && (
            <Badge variant="outline" className="text-xs">
              <Mic className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
              Voice enabled
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden pb-0">
        <ScrollArea className="flex-1 w-full h-full overflow-y-auto">
          <div className="space-y-2 sm:space-y-3 p-2 sm:p-3 md:p-4 min-h-full pb-4 sm:pb-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex gap-2 sm:gap-3 max-w-full", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "flex gap-2 sm:gap-3 max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[80%] animate-in slide-in-from-bottom-2 duration-300",
                      message.role === "user" ? "flex-row-reverse ml-auto" : "mr-auto",
                    )}
                  >
                    <div
                      className={cn(
                        "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-lg ring-2 transition-all duration-300 hover:scale-110 hover:shadow-xl",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground ring-primary/20 hover:bg-primary/90"
                          : "bg-gradient-to-br from-accent to-accent/80 text-accent-foreground ring-accent/20 hover:from-accent/90 hover:to-accent/70",
                      )}
                    >
                      {message.role === "user" ? <User className="h-3 w-3 sm:h-4 sm:w-4" /> : <Bot className="h-3 w-3 sm:h-4 sm:w-4" />}
                    </div>
                    <div className="space-y-3 w-full">
                      <div
                    className={cn(
                      "rounded-2xl px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm leading-relaxed shadow-lg backdrop-blur-sm border transition-all duration-300 hover:shadow-xl hover:scale-[1.01]",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground border-primary/20 ml-6 sm:ml-8 hover:bg-primary/90"
                        : "bg-card/80 text-card-foreground border-border/50 mr-6 sm:mr-8 glass hover:bg-card/90",
                  )}
                >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                        <div className="text-[10px] sm:text-xs opacity-60 mt-1 sm:mt-2 flex items-center gap-1">
                          <div className="w-1 h-1 bg-current rounded-full opacity-40" />
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    {message.suggestions && (
                      <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-center gap-2 animate-in slide-in-from-left duration-500">
                          <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent flex-1" />
                          <span className="text-[10px] sm:text-xs font-medium text-primary px-1.5 sm:px-2 py-0.5 sm:py-1 bg-primary/10 rounded-full border border-primary/20">Recommended Plans</span>
                          <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent flex-1" />
                        </div>
                      <div className="w-full overflow-hidden max-w-full">
                      <Carousel
                        opts={{
                          align: "center",
                          loop: true,
                          dragFree: true,
                          skipSnaps: false,
                          containScroll: "trimSnaps",
                          watchDrag: true
                        }}
                          className="w-full max-w-full overflow-visible"
                      >
                          <CarouselContent className="-ml-1 md:-ml-2">
                          {message.suggestions.map((suggestion, index) => (
                              <CarouselItem key={index} className="pl-1 md:pl-2 basis-[95%] sm:basis-[90%] md:basis-[85%] lg:basis-[80%] xl:basis-[70%]">
                              <div className="p-1">
                                  <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 glass-strong hover:scale-[1.01] group h-full">
                                    <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
                                      <div className="flex items-start justify-between mb-3">
                                        <CardTitle className="font-heading text-sm sm:text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                          {suggestion.title}
                                        </CardTitle>
                                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-pulse flex-shrink-0" />
                                      </div>
                                      <CardDescription className="text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3">
                                        {suggestion.description}
                                      </CardDescription>
                                  </CardHeader>
                                    <CardContent className="space-y-2 sm:space-y-3 text-xs sm:text-sm p-3 sm:p-4 pt-0">
                                      <div className="flex flex-wrap gap-1">
                                      {suggestion.features.map((feature, idx) => (
                                          <Badge
                                            key={idx}
                                            variant="secondary"
                                            className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors px-2 py-0.5 sm:px-3 sm:py-1"
                                          >
                                          {feature}
                                        </Badge>
                                      ))}
                                    </div>
                                      <div className="space-y-1 sm:space-y-2 pt-1">
                                        <div className="flex items-center gap-1 sm:gap-2">
                                          <Utensils className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                                          <span className="font-medium text-foreground">Sample Meals:</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-1 sm:gap-2">
                                          {suggestion.sampleMeals.slice(0, 3).map((meal, i) => (
                                            <div key={i} className="flex items-center gap-2 text-muted-foreground">
                                              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary/60 rounded-full" />
                                              <span className="truncate">{meal}</span>
                                            </div>
                                          ))}
                                          {suggestion.sampleMeals.length > 3 && (
                                            <div className="text-primary/70 text-sm font-medium">
                                              +{suggestion.sampleMeals.length - 3} more meals
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <Link href="/demo/meal-plans" className="w-full block">
                                        <Button
                                          size="sm"
                                          className="text-xs h-7 sm:h-8 w-full mt-2 sm:mt-3 bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200 group-hover:scale-105"
                                        >
                                          <span>Select & View Plan</span>
                                          <div className="ml-1 w-0 group-hover:w-4 transition-all duration-200 overflow-hidden">
                                            →
                                    </div>
                                      </Button>
                                    </Link>
                                  </CardContent>
                                </Card>
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                          <CarouselPrevious className="-left-2 sm:-left-3 md:-left-4 h-6 w-6 sm:h-8 sm:w-8 bg-background/90 backdrop-blur-sm border shadow-lg hover:bg-background hover:shadow-xl transition-all duration-200 hover:scale-110 rounded-full" />
                          <CarouselNext className="-right-2 sm:-right-3 md:-right-4 h-6 w-6 sm:h-8 sm:w-8 bg-background/90 backdrop-blur-sm border shadow-lg hover:bg-background hover:shadow-xl transition-all duration-200 hover:scale-110 rounded-full" />
                      </Carousel>
                      </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex gap-3 justify-start animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-accent to-accent/80 text-accent-foreground flex items-center justify-center shrink-0 mt-1 shadow-lg ring-2 ring-accent/20">
                    {isBrowserUseTask ? (
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    ) : (
                      <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                  </div>
                  <div className="bg-card/90 rounded-2xl px-3 sm:px-4 py-3 sm:py-4 text-muted-foreground text-xs sm:text-sm shadow-lg backdrop-blur-sm border border-border/50 glass mr-6 sm:mr-8 max-w-md animate-in slide-in-from-bottom-2 duration-300">
                    {isBrowserUseTask ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-primary rounded-full animate-pulse" />
                          <div className="flex-1">
                            <span className="font-medium text-primary text-xs sm:text-sm md:text-base">AI Agent Working</span>
                            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 leading-relaxed">{taskProgress}</p>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 sm:h-3 overflow-hidden">
                          <div className="bg-primary h-2 sm:h-3 rounded-full animate-pulse transition-all duration-1000 ease-out" 
                               style={{ 
                                 width: taskProgress.includes("Retrying") ? '30%' : 
                                        taskProgress.includes("Initializing") ? '10%' : 
                                        taskProgress.includes("researching") ? '40%' : 
                                        taskProgress.includes("working") ? '60%' : 
                                        taskProgress.includes("completed") ? '90%' : 
                                        taskProgress.includes("Processing") ? '95%' : '50%' 
                               }} />
                        </div>
                        <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
                          <span>{taskProgress.includes("Retrying") ? "Retrying request..." : "Processing request..."}</span>
                          <span className="font-medium">
                            {taskProgress.includes("Retrying") ? "Retry in progress" : 
                             taskProgress.includes("Initializing") ? "Starting" : 
                             taskProgress.includes("researching") ? "Researching" : 
                             taskProgress.includes("working") ? "Working" : 
                             taskProgress.includes("completed") ? "Finalizing" : 
                             taskProgress.includes("Processing") ? "Almost done" : "In progress"}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground/80">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary/60 rounded-full animate-pulse" />
                            <span>
                              {taskProgress.includes("Retrying") ? "Attempting to recover from error" : 
                               taskProgress.includes("Initializing") ? "Setting up AI agent" : 
                               taskProgress.includes("researching") ? "Researching current market prices" : 
                               taskProgress.includes("working") ? "Processing supermarket data" : 
                               taskProgress.includes("completed") ? "Generating meal plan" : 
                               taskProgress.includes("Processing") ? "Preparing results" : "Working on your request"}
                            </span>
                          </div>
                        </div>
                        {apiError && (
                          <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-2 rounded-md border border-amber-200 dark:border-amber-800">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">⚠️ Error: </span>
                              <span className="truncate">{apiError.length > 50 ? apiError.substring(0, 50) + "..." : apiError}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                          <div className="flex-1">
                            <span className="font-medium text-primary">Analyzing your request...</span>
                            <p className="text-xs text-muted-foreground mt-1">Preparing AI agent</p>
                          </div>
                        </div>
                    <TypingIndicator />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="p-2 sm:p-3 pb-4 sm:pb-3 border-t border-border/50 bg-background/80 backdrop-blur-md sticky bottom-0 z-10 safe-area-bottom">
          <div className="flex items-center gap-1 sm:gap-2 max-w-full">
             {speechSupported && (
              <Button
                onClick={handleMicClick}
                disabled={isProcessing || !!speechError}
                size="icon"
                variant="ghost"
                className={cn(
                  "h-9 w-9 sm:h-10 sm:w-10 shrink-0 hover:bg-accent/10",
                  isListening ? "text-destructive" :
                  speechError ? "text-muted-foreground/50 opacity-50" : "text-muted-foreground"
                )}
                title={speechError || (isListening ? "Stop listening" : "Start voice input")}
              >
                {isListening ? <MicOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Mic className="h-3 w-3 sm:h-4 sm:w-4" />}
              </Button>
            )}
            <div className="relative flex-1 min-w-0">
             <Input
               ref={inputRef}
               value={inputValue}
               onChange={(e) => setInputValue(e.target.value)}
               onKeyPress={handleKeyPress}
                placeholder={
                  isListening
                    ? "🎤 Listening..."
                    : browserUseService
                      ? "💡 Try: 'meal plan for 3 people'..."
                      : "🍽️ Tell me about your dietary needs..."
                }
                className="text-sm w-full rounded-full h-10 sm:h-11 pr-10 sm:pr-12 border-2 focus:border-primary/50 transition-all duration-200 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:shadow-lg hover:shadow-md"
               disabled={isProcessing || isListening}
                style={{
                  WebkitAppearance: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  fontSize: '16px', // Prevents zoom on iOS
                  WebkitTextSizeAdjust: '100%'
                }}
             />
             <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isProcessing || isListening}
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary hover:bg-primary/90 hover:scale-105 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 z-20 disabled:opacity-50 disabled:hover:scale-100"
              >
                <Send className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
           </div>
          {interimTranscript && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 sm:p-3 rounded-lg mt-2 border-l-2 border-primary/30">
              <span className="opacity-60">🎤 Hearing: </span>
              <span className="italic font-medium">{interimTranscript}</span>
            </div>
          )}
          {speechError && !speechError.includes("denied") && !speechError.includes("disabled") && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2 sm:p-3 rounded-lg mt-2 border-l-2 border-amber-400 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-400">
              <span className="opacity-60">⚠️ </span>
              {speechError}
            </div>
          )}
          {speechError && (speechError.includes("denied") || speechError.includes("disabled")) && (
            <div className="text-xs text-muted-foreground bg-muted/30 border border-border/50 p-2 sm:p-3 rounded-lg mt-2 border-l-2 border-muted-foreground/30">
              <span className="opacity-60">🎤 </span>
              Voice input unavailable - you can still type your messages
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
  } catch (error) {
    console.error("ChatInterface error:", error)
    // Fallback UI in case of errors
    return (
      <Card className="glass-strong border-0 w-full h-full flex flex-col shadow-2xl rounded-none sm:rounded-xl backdrop-blur-xl overflow-hidden">
        <CardHeader className="pb-3 px-3 sm:px-4 md:px-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              </div>
              <CardTitle className="text-base sm:text-lg font-heading">Chat Error</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-destructive/10 hover:text-destructive rounded-full"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <div className="text-4xl">⚠️</div>
            <h3 className="text-lg font-semibold">Chat Interface Error</h3>
            <p className="text-muted-foreground">
              There was an error loading the chat. Please try refreshing the page.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
}