"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export interface ChatHistoryItem {
  id: string
  date: string
  query: string
  plan: string
  messages?: Array<{
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
  }>
}

export interface RecipeHistoryItem {
  id: string
  title: string
  savedDate: string
  difficulty: string
  cookingTime: string
  rating?: number
  tags: string[]
  planId?: string
  ingredients?: Array<{
    item: string
    quantity: string
  }>
  instructions?: string[]
}

export interface PurchaseHistoryItem {
  id: string
  date: string
  plan: string
  items: number
  total: number
  supermarket?: string
  status: "completed" | "pending" | "failed"
}

interface HistoryContextType {
  chatHistory: ChatHistoryItem[]
  recipeHistory: RecipeHistoryItem[]
  purchaseHistory: PurchaseHistoryItem[]
  addChatToHistory: (chat: Omit<ChatHistoryItem, "id" | "date">) => void
  addRecipeToHistory: (recipe: Omit<RecipeHistoryItem, "id" | "savedDate">) => void
  addPurchaseToHistory: (purchase: Omit<PurchaseHistoryItem, "id" | "date">) => void
  clearHistory: (type?: "chats" | "recipes" | "purchases") => void
  getRecentChats: (limit?: number) => ChatHistoryItem[]
  getRecentRecipes: (limit?: number) => RecipeHistoryItem[]
  getRecentPurchases: (limit?: number) => PurchaseHistoryItem[]
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined)

const STORAGE_KEYS = {
  chats: "diet-agent-chat-history",
  recipes: "diet-agent-recipe-history",
  purchases: "diet-agent-purchase-history",
}

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [recipeHistory, setRecipeHistory] = useState<RecipeHistoryItem[]>([])
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistoryItem[]>([])

  // Load history from localStorage on mount
  useEffect(() => {
    const loadHistory = () => {
      try {
        const chats = localStorage.getItem(STORAGE_KEYS.chats)
        const recipes = localStorage.getItem(STORAGE_KEYS.recipes)
        const purchases = localStorage.getItem(STORAGE_KEYS.purchases)

        if (chats) setChatHistory(JSON.parse(chats))
        if (recipes) setRecipeHistory(JSON.parse(recipes))
        if (purchases) setPurchaseHistory(JSON.parse(purchases))
      } catch (error) {
        console.error("Failed to load history from localStorage:", error)
      }
    }

    loadHistory()
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.chats, JSON.stringify(chatHistory))
    } catch (error) {
      console.error("Failed to save chat history:", error)
    }
  }, [chatHistory])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.recipes, JSON.stringify(recipeHistory))
    } catch (error) {
      console.error("Failed to save recipe history:", error)
    }
  }, [recipeHistory])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.purchases, JSON.stringify(purchaseHistory))
    } catch (error) {
      console.error("Failed to save purchase history:", error)
    }
  }, [purchaseHistory])

  const addChatToHistory = (chat: Omit<ChatHistoryItem, "id" | "date">) => {
    const newChat: ChatHistoryItem = {
      ...chat,
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
    }
    setChatHistory(prev => [newChat, ...prev.slice(0, 49)]) // Keep only last 50 items
  }

  const addRecipeToHistory = (recipe: Omit<RecipeHistoryItem, "id" | "savedDate">) => {
    const newRecipe: RecipeHistoryItem = {
      ...recipe,
      id: Date.now().toString(),
      savedDate: new Date().toISOString().split("T")[0],
    }
    setRecipeHistory(prev => [newRecipe, ...prev.slice(0, 99)]) // Keep only last 100 items
  }

  const addPurchaseToHistory = (purchase: Omit<PurchaseHistoryItem, "id" | "date">) => {
    const newPurchase: PurchaseHistoryItem = {
      ...purchase,
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
    }
    setPurchaseHistory(prev => [newPurchase, ...prev.slice(0, 49)]) // Keep only last 50 items
  }

  const clearHistory = (type?: "chats" | "recipes" | "purchases") => {
    if (type === "chats" || !type) {
      setChatHistory([])
      localStorage.removeItem(STORAGE_KEYS.chats)
    }
    if (type === "recipes" || !type) {
      setRecipeHistory([])
      localStorage.removeItem(STORAGE_KEYS.recipes)
    }
    if (type === "purchases" || !type) {
      setPurchaseHistory([])
      localStorage.removeItem(STORAGE_KEYS.purchases)
    }
  }

  const getRecentChats = (limit = 10): ChatHistoryItem[] => {
    return chatHistory.slice(0, limit)
  }

  const getRecentRecipes = (limit = 20): RecipeHistoryItem[] => {
    return recipeHistory.slice(0, limit)
  }

  const getRecentPurchases = (limit = 10): PurchaseHistoryItem[] => {
    return purchaseHistory.slice(0, limit)
  }

  const value: HistoryContextType = {
    chatHistory,
    recipeHistory,
    purchaseHistory,
    addChatToHistory,
    addRecipeToHistory,
    addPurchaseToHistory,
    clearHistory,
    getRecentChats,
    getRecentRecipes,
    getRecentPurchases,
  }

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  )
}

export function useHistory() {
  const context = useContext(HistoryContext)
  if (context === undefined) {
    throw new Error("useHistory must be used within a HistoryProvider")
  }
  return context
}

