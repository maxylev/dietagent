"use client"

import { FloatingParticles } from "@/components/FloatingParticles"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BrowserUseService } from "@/lib/browser-use-service"
import { useHistory } from "@/lib/history-context"
import { ArrowLeft, Calendar, CheckCircle2, Eye, EyeOff, FileText, Key, MessageSquare, Repeat, Settings, ShoppingCart, Star, Trash2, UserCircle2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

const DEMO_HISTORY = {
  chats: [
    { id: "chat1", date: "2024-02-18", query: "High-protein, low-carb plan for 2 people", plan: "High-Protein Power" },
    { id: "chat2", date: "2024-02-15", query: "Vegetarian meals for family of 4", plan: "Mediterranean Delight" },
  ],
  recipes: [
    {
      id: "1",
      title: "Mediterranean Quinoa Bowl",
      savedDate: "2024-01-15",
      difficulty: "Easy",
      cookingTime: "25 mins",
      rating: 5,
      tags: ["Vegetarian", "High Protein", "Mediterranean"],
    },
    {
      id: "2",
      title: "Spicy Thai Chicken Curry",
      savedDate: "2024-01-10",
      difficulty: "Medium",
      cookingTime: "35 mins",
      rating: 4,
      tags: ["Thai", "Spicy", "Gluten-Free"],
    },
  ],
  purchases: [
    { id: "purchase1", date: "2024-02-15", plan: "Mediterranean Delight", items: 45, total: 135.42 },
    { id: "purchase2", date: "2024-01-10", plan: "Spicy Thai Chicken Curry Ingredients", items: 12, total: 42.50 },
  ]
}


export default function ProfilePage() {
  const { chatHistory, recipeHistory, purchaseHistory, clearHistory } = useHistory()
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [apiKeyStatus, setApiKeyStatus] = useState<"valid" | "invalid" | "untested">("untested")
  const [browserUseService, setBrowserUseService] = useState<BrowserUseService | null>(null)

  useEffect(() => {
    // Load API key from localStorage
    const savedApiKey = localStorage.getItem("browser-use-api-key")
    if (savedApiKey) {
      setApiKey(savedApiKey)
      const service = new BrowserUseService(savedApiKey)
      setBrowserUseService(service)
    }
  }, [])

  const handleApiKeyChange = (value: string) => {
    setApiKey(value)
    setApiKeyStatus("untested")
  }

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setApiKeyStatus("invalid")
      return
    }

    setIsValidating(true)
    try {
      const service = new BrowserUseService(apiKey)
      const isValid = await service.validateApiKey()

      if (isValid) {
        localStorage.setItem("browser-use-api-key", apiKey)
        setBrowserUseService(service)
        setApiKeyStatus("valid")
      } else {
        setApiKeyStatus("invalid")
      }
    } catch (error) {
      console.error("API key validation failed:", error)
      setApiKeyStatus("invalid")
    } finally {
      setIsValidating(false)
    }
  }

  const handleRemoveApiKey = () => {
    localStorage.removeItem("browser-use-api-key")
    setApiKey("")
    setApiKeyStatus("untested")
    setBrowserUseService(null)
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <FloatingParticles count={8} />

      <nav className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="flex justify-between items-center">
          <Link href="/">
            <Button variant="ghost" className="glass hover:glass-strong">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cloud
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/profile">
              <button className="glass p-2 sm:p-3 rounded-full hover:glass-strong transition-all duration-300 group ring-2 ring-primary">
                <UserCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary group-hover:scale-110 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-20 max-w-4xl">
         <div className="flex items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">User Profile</h1>
            <p className="text-muted-foreground">Your activity history, saved plans, and purchases.</p>
          </div>
        </div>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="recipes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Recipes
              {recipeHistory.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-2 text-xs">
                  {recipeHistory.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="chats" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chats
              {chatHistory.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-2 text-xs">
                  {chatHistory.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="purchases" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Purchases
              {purchaseHistory.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-2 text-xs">
                  {purchaseHistory.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              <Card className="glass-strong border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 font-heading text-xl">
                    <Key className="h-6 w-6 text-primary" />
                    Browser-Use API Configuration
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Connect your Browser-Use Cloud API key to enable autonomous meal planning and shopping cart generation.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="api-key" className="text-sm font-medium">
                        API Key
                      </Label>
                      <div className="relative">
                        <Input
                          id="api-key"
                          type={showApiKey ? "text" : "password"}
                          placeholder="Enter your Browser-Use API key..."
                          value={apiKey}
                          onChange={(e) => handleApiKeyChange(e.target.value)}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        onClick={handleSaveApiKey}
                        disabled={!apiKey.trim() || isValidating}
                        className="min-w-[120px]"
                      >
                        {isValidating ? (
                          "Validating..."
                        ) : apiKeyStatus === "valid" ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Validated
                          </>
                        ) : (
                          "Save & Validate"
                        )}
                      </Button>

                      {apiKey && (
                        <Button
                          variant="outline"
                          onClick={handleRemoveApiKey}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>

                    {apiKeyStatus === "invalid" && (
                      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive">
                          Invalid API key. Please check your key and try again.
                        </p>
                      </div>
                    )}

                    {apiKeyStatus === "valid" && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950/20 dark:border-green-800">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <p className="text-sm text-green-700 dark:text-green-400">
                            API key validated successfully! Your account is now connected to Browser-Use Cloud.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <h3 className="text-lg font-semibold">What this enables:</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <h4 className="font-medium text-primary">🤖 Autonomous Meal Planning</h4>
                        <p className="text-sm text-muted-foreground">
                          AI agent researches current market prices and creates detailed meal plans with real supermarket data.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-primary">🛒 Smart Shopping Carts</h4>
                        <p className="text-sm text-muted-foreground">
                          Automatically finds products at your preferred supermarkets with current prices and direct links.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-primary">📊 Real-time Pricing</h4>
                        <p className="text-sm text-muted-foreground">
                          Gets live prices from actual supermarket websites, not outdated cached data.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-primary">🎯 Personalized Results</h4>
                        <p className="text-sm text-muted-foreground">
                          Structured JSON output ensures consistent, high-quality meal plans and shopping lists.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <div className="text-sm text-muted-foreground">
                      <p>
                        <strong>How to get your API key:</strong> Visit{" "}
                        <a
                          href="https://cloud.browser-use.com/billing"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          cloud.browser-use.com/billing
                        </a>{" "}
                        and create an account to get your API key.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-0">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">AI Agent Best Practices</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-xs font-bold text-primary">1</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Structured Output</h4>
                          <p className="text-sm text-muted-foreground">
                            Uses JSON schemas for consistent, parseable results
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-xs font-bold text-primary">2</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Real-time Research</h4>
                          <p className="text-sm text-muted-foreground">
                            Browses actual websites for current prices and availability
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-xs font-bold text-primary">3</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Error Handling</h4>
                          <p className="text-sm text-muted-foreground">
                            Robust error handling and task monitoring
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-xs font-bold text-primary">4</span>
                        </div>
                        <div>
                          <h4 className="font-medium">User Context</h4>
                          <p className="text-sm text-muted-foreground">
                            Maintains conversation history and preferences
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recipes" className="mt-6">
            {recipeHistory.length === 0 ? (
              <Card className="glass-strong border-0">
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No saved recipes yet</h3>
                  <p className="text-muted-foreground mb-4">Start chatting with our AI to discover and save delicious recipes!</p>
                  <Link href="/">
                    <Button className="bg-primary hover:bg-primary/90">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Start a Chat
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">Your Saved Recipes</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearHistory("recipes")}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
                <div className="grid gap-4">
                  {recipeHistory.map((recipe) => (
                    <Card key={recipe.id} className="glass-strong border-0 hover:shadow-xl transition-all duration-200 group">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-heading group-hover:text-primary transition-colors">
                              {recipe.title}
                            </CardTitle>
                            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Saved {recipe.savedDate}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {recipe.difficulty}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {recipe.cookingTime}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {recipe.rating && (
                              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-medium text-yellow-700">{recipe.rating}</span>
                              </div>
                            )}
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {recipe.tags.slice(0, 6).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs bg-primary/10 text-primary hover:bg-primary/20">
                              {tag}
                            </Badge>
                          ))}
                          {recipe.tags.length > 6 && (
                            <Badge variant="outline" className="text-xs">
                              +{recipe.tags.length - 6} more
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Link href="/demo/meal-details">
                            <Button size="sm" variant="default" className="shadow-sm hover:shadow-md transition-shadow">
                              <FileText className="h-3 w-3 mr-2" />
                              View Recipe
                            </Button>
                          </Link>
                          <Link href="/demo/shopping-cart">
                            <Button size="sm" variant="outline" className="hover:bg-primary/10 transition-colors">
                              <ShoppingCart className="h-3 w-3 mr-2" />
                              Reorder Ingredients
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="chats" className="mt-6">
            {chatHistory.length === 0 ? (
              <Card className="glass-strong border-0">
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No chat history yet</h3>
                  <p className="text-muted-foreground mb-4">Start a conversation with our AI diet assistant to get personalized meal plans!</p>
                  <Link href="/">
                    <Button className="bg-primary hover:bg-primary/90">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Start Chatting
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">Your Chat History</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearHistory("chats")}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
                <div className="grid gap-4">
                  {chatHistory.map((chat) => (
                    <Card key={chat.id} className="glass border-0 hover:shadow-lg transition-all duration-200 group">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-foreground text-lg mb-2">"{chat.query}"</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Resulted in <span className="text-primary font-medium">{chat.plan}</span></span>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {chat.date}
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="shadow-sm hover:shadow-md transition-all duration-200 group-hover:scale-105">
                            <Repeat className="h-4 w-4 mr-2" />
                            Restart Chat
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="purchases" className="mt-6">
            {purchaseHistory.length === 0 ? (
              <Card className="glass-strong border-0">
                <CardContent className="p-8 text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No purchase history yet</h3>
                  <p className="text-muted-foreground mb-4">Complete your first shopping cart to see your purchase history here!</p>
                  <Link href="/demo/meal-details">
                    <Button className="bg-primary hover:bg-primary/90">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Create Shopping List
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">Your Purchase History</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearHistory("purchases")}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
                <div className="grid gap-4">
                  {purchaseHistory.map((purchase) => (
                    <Card key={purchase.id} className="glass border-0 hover:shadow-lg transition-all duration-200 group">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-foreground text-lg mb-2">{purchase.plan}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{purchase.items} items purchased</span>
                              <span className="font-medium text-primary">${purchase.total.toFixed(2)}</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {purchase.date}
                              </div>
                              {purchase.supermarket && (
                                <Badge variant="outline" className="text-xs">
                                  {purchase.supermarket}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              purchase.status === "completed" ? "bg-green-400" :
                              purchase.status === "pending" ? "bg-yellow-400" : "bg-red-400"
                            }`} />
                            <Link href="/demo/shopping-cart">
                              <Button size="sm" variant="outline" className="shadow-sm hover:shadow-md transition-all duration-200 group-hover:scale-105">
                                <Repeat className="h-4 w-4 mr-2" />
                                Re-purchase
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

      </div>
    </main>
  )
}
