"use client"

import { FloatingParticles } from "@/components/FloatingParticles"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BrowserUseService } from "@/lib/browser-use-service"
import { useHistory } from "@/lib/history-context"
import { ArrowLeft, Bot, Check, ChefHat, Clock, Loader2, ShoppingCart, UserCircle2, Users, Utensils } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const DEMO_RECIPE = {
  name: "Grilled Salmon with Lemon & Herbs",
  description: "A healthy and delicious Mediterranean-style salmon dish with fresh herbs and lemon",
  prepTime: "15 minutes",
  cookTime: "20 minutes",
  servings: 4,
  difficulty: "Medium",
  calories: 320,
  protein: "28g",
  carbs: "8g",
  fat: "18g",
  imageUrl: "https://fpoimg.com/600x400?text=Grilled+Salmon&bg_color=e6e6e6&text_color=8F8F8F",
  ingredients: [
    { item: "Wild-caught salmon fillets", quantity: "4 pieces (6oz each)" },
    { item: "Fresh lemon", quantity: "2 lemons" },
    { item: "Extra virgin olive oil", quantity: "3 tablespoons" },
    { item: "Fresh dill", quantity: "2 tablespoons, chopped" },
    { item: "Fresh parsley", quantity: "2 tablespoons, chopped" },
    { item: "Garlic", quantity: "3 cloves, minced" },
    { item: "Sea salt", quantity: "1 teaspoon" },
    { item: "Black pepper", quantity: "1/2 teaspoon" },
    { item: "Cherry tomatoes", quantity: "1 cup, halved" },
    { item: "Red onion", quantity: "1/2 medium, sliced" },
  ],
  instructions: [
    "Preheat grill to medium-high heat (about 400°F).",
    "Pat salmon fillets dry and season both sides with salt and pepper.",
    "In a small bowl, mix olive oil, minced garlic, chopped dill, and parsley.",
    "Brush the herb mixture over both sides of the salmon fillets.",
    "Cut one lemon into slices and juice the other lemon.",
    "Place salmon on the grill and cook for 4-5 minutes per side, depending on thickness.",
    "In the last 2 minutes, add cherry tomatoes and red onion to the grill.",
    "Remove salmon when it flakes easily with a fork and internal temperature reaches 145°F.",
    "Drizzle with fresh lemon juice and serve immediately with grilled vegetables.",
    "Garnish with additional fresh herbs and lemon slices if desired.",
  ],
  tips: [
    "Don't flip the salmon too early - let it develop a nice crust first",
    "Use a fish spatula or thin metal spatula for easier flipping",
    "If you don't have a grill, this recipe works great in a cast iron pan",
    "Salmon is done when it flakes easily and is opaque throughout",
  ],
}

// Thinking Agent Component
function GeneratingCartAgent({
  ingredients,
  onComplete,
  taskProgress
}: {
  ingredients: typeof DEMO_RECIPE.ingredients;
  onComplete: () => void;
  taskProgress?: string;
}) {
  const [foundItems, setFoundItems] = useState<string[]>([])
  const progress = (foundItems.length / ingredients.length) * 100

  useEffect(() => {
    if (taskProgress) {
      // If we have browser-use task progress, don't show the demo animation
      return
    }

    const interval = setInterval(() => {
      setFoundItems((prev) => {
        if (prev.length < ingredients.length) {
          return [...prev, ingredients[prev.length].item]
        }
        clearInterval(interval)
        setTimeout(onComplete, 1200) // Wait a bit after completion before navigating
        return prev
      })
    }, 400) // Simulate finding one item every 400ms

    return () => clearInterval(interval)
  }, [ingredients, onComplete, taskProgress])

  // If browser-use is working, show different UI
  if (taskProgress) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl">
        <Card className="glass-strong border-0 w-full max-w-md shadow-2xl animate-fade-in-up">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-3 mb-2">
              <Bot className="h-8 w-8 text-primary animate-pulse" />
              <CardTitle className="text-2xl font-heading">AI Agent Working</CardTitle>
            </div>
            <p className="text-muted-foreground text-sm">{taskProgress}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} className="w-full" />
            <div className="text-xs text-muted-foreground text-center">
              <p>Please wait while our AI agent researches current market prices and creates your personalized shopping cart.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl">
      <Card className="glass-strong border-0 w-full max-w-md shadow-2xl animate-fade-in-up">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-3 mb-2">
            <Bot className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl font-heading">Building Your Cart</CardTitle>
          </div>
          <p className="text-muted-foreground">Our AI agent is finding the best products for your recipe...</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progress} className="w-full" />
          <div className="max-h-60 overflow-y-auto space-y-2 p-2 glass rounded-lg">
            {ingredients.map((ingredient) => (
              <div key={ingredient.item} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{ingredient.item}</span>
                {foundItems.includes(ingredient.item) ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground pt-2">
            Please wait, this may take a moment. We're ensuring you get the best quality ingredients.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


export default function MealDetailsDemo() {
  const { addRecipeToHistory, addPurchaseToHistory } = useHistory()
  const [isGeneratingCart, setIsGeneratingCart] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [browserUseService, setBrowserUseService] = useState<BrowserUseService | null>(null)
  const [taskProgress, setTaskProgress] = useState("")
  const router = useRouter()

  // Initialize browser-use service
  useEffect(() => {
    const apiKey = localStorage.getItem("browser-use-api-key")
    if (apiKey) {
      const service = new BrowserUseService(apiKey)
      setBrowserUseService(service)
    }
  }, [])

  const handleSaveRecipe = () => {
    addRecipeToHistory({
      title: DEMO_RECIPE.name,
      difficulty: DEMO_RECIPE.difficulty,
      cookingTime: DEMO_RECIPE.cookTime,
      rating: 5,
      tags: ["Mediterranean", "Healthy", "Grilled", "High Protein"],
      planId: "mediterranean-delight",
      ingredients: DEMO_RECIPE.ingredients,
      instructions: DEMO_RECIPE.instructions,
    })
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const handleGenerateCart = async () => {
    if (browserUseService) {
      await handleBrowserUseCartGeneration()
    } else {
      // Fallback to demo cart generation
      setIsGeneratingCart(true)
    }
  }

  const handleBrowserUseCartGeneration = async () => {
    setIsGeneratingCart(true)
    setTaskProgress("AI agent is researching current supermarket prices...")

    try {
      // Create a mock meal plan for browser-use
      const mockMealPlan = {
        id: "demo-meal-plan",
        title: "Mediterranean Delight",
        description: "Fresh, healthy meals inspired by Mediterranean cuisine",
        days: 7,
        people: 4,
        totalCalories: 2100,
        totalProtein: 120,
        totalCarbs: 180,
        totalFat: 70,
        difficulty: "Medium" as const,
        meals: [
          {
            day: 1,
            breakfast: {
              name: DEMO_RECIPE.name,
              description: DEMO_RECIPE.description,
              prepTime: 15,
              cookTime: 20,
              servings: 4,
              calories: 320,
              protein: 28,
              carbs: 8,
              fat: 18,
              ingredients: DEMO_RECIPE.ingredients,
              instructions: DEMO_RECIPE.instructions,
              tips: DEMO_RECIPE.tips,
              tags: ["Mediterranean", "Healthy", "Grilled"]
            },
            lunch: {
              name: "Mediterranean Quinoa Salad",
              description: "Fresh and healthy quinoa salad",
              prepTime: 15,
              cookTime: 0,
              servings: 4,
              calories: 280,
              protein: 12,
              carbs: 35,
              fat: 14,
              ingredients: [
                { name: "Quinoa", quantity: "1 cup", unit: "cup", estimatedPrice: 3.50 },
                { name: "Cherry tomatoes", quantity: "2 cups", unit: "cups", estimatedPrice: 4.00 },
                { name: "Cucumber", quantity: "1", unit: "piece", estimatedPrice: 1.50 },
                { name: "Feta cheese", quantity: "4 oz", unit: "oz", estimatedPrice: 3.00 },
              ],
              instructions: ["Cook quinoa", "Mix all ingredients", "Drizzle with olive oil"],
              tips: ["Use fresh vegetables", "Add herbs for flavor"],
              tags: ["Vegetarian", "Healthy", "Quick"]
            },
            dinner: {
              name: "Herb-Crusted Chicken",
              description: "Juicy chicken with herb crust",
              prepTime: 20,
              cookTime: 25,
              servings: 4,
              calories: 350,
              protein: 35,
              carbs: 5,
              fat: 20,
              ingredients: [
                { name: "Chicken breast", quantity: "1.5 lbs", unit: "lbs", estimatedPrice: 8.00 },
                { name: "Fresh herbs", quantity: "1/4 cup", unit: "cup", estimatedPrice: 2.50 },
                { name: "Olive oil", quantity: "2 tbsp", unit: "tbsp", estimatedPrice: 1.00 },
                { name: "Garlic", quantity: "3 cloves", unit: "cloves", estimatedPrice: 0.50 },
              ],
              instructions: ["Season chicken", "Make herb crust", "Bake until cooked"],
              tips: ["Don't overcook", "Let rest before serving"],
              tags: ["Protein", "Healthy", "Baked"]
            }
          }
        ],
        estimatedCost: { min: 120, max: 150, currency: "USD" },
        supermarkets: [
          { name: "Whole Foods", country: "United States", website: "https://www.wholefoodsmarket.com", deliveryFee: 5.99 },
          { name: "Kroger", country: "United States", website: "https://www.kroger.com", deliveryFee: 4.99 },
          { name: "Walmart", country: "United States", website: "https://www.walmart.com", deliveryFee: 0 }
        ],
        nutritionalSummary: {
          dailyCalories: 2100,
          dailyProtein: 120,
          dailyCarbs: 180,
          dailyFat: 70
        }
      }

      // Create browser-use task for shopping cart
      const task = await browserUseService.runShoppingCartTask(
        mockMealPlan,
        "Whole Foods",
        "United States"
      )

      setTaskProgress("AI agent is finding the best deals and creating your shopping cart...")

      // Wait for completion
      const completedTask = await browserUseService.waitForTaskCompletion(
        task.id,
        (status, stepCount) => {
          if (status === "running") {
            setTaskProgress(`AI agent is working... (${stepCount || 0} steps completed)`)
          } else if (status === "finished") {
            setTaskProgress("AI agent has created your shopping cart! Redirecting...")
          }
        }
      )

      if (completedTask.output) {
        // Save purchase to history
        addPurchaseToHistory({
          plan: "Mediterranean Delight - Grilled Salmon Recipe",
          items: DEMO_RECIPE.ingredients.length,
          total: 45.67,
          supermarket: "Whole Foods",
          status: "completed",
        })

        // In a real implementation, you'd save the browser-use generated cart
        // For now, redirect to demo cart
        router.push("/demo/shopping-cart")
      } else {
        throw new Error("No output received from browser-use task")
      }
    } catch (error) {
      console.error("Browser-use shopping cart error:", error)
      // Fallback to demo generation
      setTaskProgress("")
      setIsGeneratingCart(false)
      // Show error and offer fallback
      alert("AI shopping cart generation failed. Using demo cart instead.")
      router.push("/demo/shopping-cart")
    }
  }

  const handleGenerationComplete = () => {
    // Save purchase to history
    addPurchaseToHistory({
      plan: "Mediterranean Delight - Grilled Salmon Recipe",
      items: DEMO_RECIPE.ingredients.length,
      total: 45.67,
      supermarket: "Whole Foods",
      status: "completed",
    })
    router.push("/demo/shopping-cart")
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {isGeneratingCart && (
        <GeneratingCartAgent
          ingredients={DEMO_RECIPE.ingredients}
          onComplete={handleGenerationComplete}
          taskProgress={taskProgress}
        />
      )}
      <FloatingParticles count={6} />

      <nav className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="flex justify-between items-center">
          <Link href="/demo/meal-plans">
            <Button variant="ghost" className="glass hover:glass-strong">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Meal Plans
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/profile">
               <button className="glass p-2 sm:p-3 rounded-full hover:glass-strong transition-all duration-300 group">
                <UserCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-foreground group-hover:scale-110 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-20 max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="glass-strong border-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video w-full bg-muted">
                  <img
                    src={DEMO_RECIPE.imageUrl || "/placeholder.svg"}
                    alt={DEMO_RECIPE.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h1 className="text-3xl font-bold font-heading text-foreground mb-2">{DEMO_RECIPE.name}</h1>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-4">{DEMO_RECIPE.description}</p>

                  <div className="flex flex-wrap gap-3 mb-6">
                    <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
                      <Clock className="h-4 w-4" />{DEMO_RECIPE.prepTime} prep
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-700 border-orange-200">
                      <ChefHat className="h-4 w-4" />{DEMO_RECIPE.cookTime} cook
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 border-green-200">
                      <Users className="h-4 w-4" />{DEMO_RECIPE.servings} servings
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1 border-amber-300 text-amber-700">
                      {DEMO_RECIPE.difficulty === "Medium" && "🟡"} {DEMO_RECIPE.difficulty}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-6">
                    <Button
                      onClick={handleSaveRecipe}
                      variant={isSaved ? "default" : "outline"}
                      size="sm"
                      className={`transition-all duration-200 ${isSaved ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    >
                      {isSaved ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Save Recipe
                        </>
                      )}
                    </Button>
                    <Link href="/profile">
                      <Button variant="outline" size="sm">
                        <UserCircle2 className="h-4 w-4 mr-2" />
                        View Saved Recipes
                      </Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 glass rounded-lg">
                    <div className="text-center"><div className="text-lg font-semibold text-primary">{DEMO_RECIPE.calories}</div><div className="text-xs text-muted-foreground">Calories</div></div>
                    <div className="text-center"><div className="text-lg font-semibold text-primary">{DEMO_RECIPE.protein}</div><div className="text-xs text-muted-foreground">Protein</div></div>
                    <div className="text-center"><div className="text-lg font-semibold text-primary">{DEMO_RECIPE.carbs}</div><div className="text-xs text-muted-foreground">Carbs</div></div>
                    <div className="text-center"><div className="text-lg font-semibold text-primary">{DEMO_RECIPE.fat}</div><div className="text-xs text-muted-foreground">Fat</div></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 font-heading text-xl">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Utensils className="h-5 w-5 text-primary" />
                  </div>
                  Cooking Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-5">
                  {DEMO_RECIPE.instructions.map((step, index) => (
                    <li key={index} className="flex gap-4 group">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                        <span className="text-sm font-bold text-primary">{index + 1}</span>
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-foreground leading-relaxed group-hover:text-primary/90 transition-colors">{step}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/10">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span>Follow these steps carefully for the best results!</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 font-heading text-xl">
                  <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center border-2 border-amber-200">
                    <ChefHat className="h-5 w-5 text-amber-600" />
                  </div>
                  Chef's Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {DEMO_RECIPE.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-amber-50/50 to-orange-50/50 rounded-lg border border-amber-100/50 hover:border-amber-200/70 transition-colors">
                      <div className="w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full mt-1.5 shrink-0 shadow-sm" />
                      <p className="text-foreground text-sm leading-relaxed flex-1">{tip}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="lg:sticky lg:top-24 space-y-6">
              <Card className="glass-strong border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 font-heading text-xl">
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center border-2 border-green-200">
                      <ShoppingCart className="h-5 w-5 text-green-600" />
                    </div>
                    Ingredients
                    <Badge variant="secondary" className="ml-auto bg-primary/10 text-primary">
                      {DEMO_RECIPE.ingredients.length} items
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {DEMO_RECIPE.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex justify-between items-center gap-3 p-3 bg-card/30 rounded-lg border border-border/30 hover:border-primary/30 transition-colors group">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-2 h-2 bg-primary/40 rounded-full group-hover:bg-primary transition-colors" />
                          <span className="text-foreground font-medium">{ingredient.item}</span>
                        </div>
                        <Badge variant="outline" className="text-xs font-semibold bg-background/50">
                          {ingredient.quantity}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 space-y-3">
                    <Button className="w-full h-11 font-medium shadow-sm hover:shadow-md transition-all" onClick={handleGenerateCart}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      View Shopping List
                    </Button>
                    <div className="text-xs text-center text-muted-foreground">
                      AI will find the best deals for these ingredients
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-0">
                <CardContent className="p-4">
                  <h3 className="font-semibold font-heading text-foreground mb-3">More from this Plan</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-secondary/30 rounded-lg"><div className="text-sm font-medium">Greek Yogurt with Honey</div><div className="text-xs text-muted-foreground">Breakfast • Day 1</div></div>
                    <div className="p-3 bg-secondary/30 rounded-lg"><div className="text-sm font-medium">Mediterranean Quinoa Salad</div><div className="text-xs text-muted-foreground">Lunch • Day 1</div></div>
                    <div className="p-3 bg-secondary/30 rounded-lg"><div className="text-sm font-medium">Herb-Crusted Chicken</div><div className="text-xs text-muted-foreground">Dinner • Day 2</div></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}