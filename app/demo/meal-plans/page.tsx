"use client"

import { FloatingParticles } from "@/components/FloatingParticles"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { ArrowLeft, Calendar, CheckCircle, ChevronDown, Clock, ShoppingCart, UserCircle2, Users, Utensils } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const DEMO_MEAL_PLANS = [
  {
    id: 1,
    title: "Mediterranean Delight",
    description:
      "Fresh, healthy meals inspired by Mediterranean cuisine with plenty of vegetables, fish, and olive oil.",
    days: 7,
    people: 4,
    estimatedCost: "$120-150",
    difficulty: "Medium",
    features: ["Heart-healthy", "Fresh ingredients", "Rich in omega-3"],
    meals: [
      {
        day: 1,
        breakfast: "Greek Yogurt with Honey & Berries",
        lunch: "Mediterranean Quinoa Salad",
        dinner: "Grilled Salmon with Lemon & Herbs",
      },
      {
        day: 2,
        breakfast: "Avocado Toast with Tomatoes",
        lunch: "Chickpea & Vegetable Soup",
        dinner: "Herb-Crusted Chicken with Roasted Vegetables",
      },
      {
        day: 3,
        breakfast: "Whole Grain Toast with Hummus",
        lunch: "Greek Salad with Feta",
        dinner: "Baked Cod with Herbs",
      },
      {
        day: 4,
        breakfast: "Oatmeal with Nuts & Berries",
        lunch: "Lentil Soup with Bread",
        dinner: "Grilled Chicken with Vegetables",
      },
      {
        day: 5,
        breakfast: "Smoothie Bowl with Granola",
        lunch: "Quinoa & Vegetable Bowl",
        dinner: "Baked Salmon with Rice",
      },
      {
        day: 6,
        breakfast: "Greek Yogurt Parfait",
        lunch: "Mediterranean Wrap",
        dinner: "Herb-Crusted Fish",
      },
      {
        day: 7,
        breakfast: "Avocado & Egg Toast",
        lunch: "Chickpea Salad",
        dinner: "Grilled Vegetables & Fish",
      },
    ],
    totalIngredients: 45,
  },
  {
    id: 2,
    title: "High-Protein Power",
    description: "Muscle-building meals packed with lean proteins, perfect for active lifestyles and fitness goals.",
    days: 7,
    people: 4,
    estimatedCost: "$140-180",
    difficulty: "Easy",
    features: ["High protein", "Muscle building", "Post-workout friendly"],
    meals: [
      {
        day: 1,
        breakfast: "Protein Pancakes with Berries",
        lunch: "Grilled Chicken Caesar Salad",
        dinner: "Lean Beef Stir-Fry with Quinoa",
      },
      {
        day: 2,
        breakfast: "Egg White Omelet with Spinach",
        lunch: "Tuna & White Bean Salad",
        dinner: "Baked Cod with Sweet Potato",
      },
      {
        day: 3,
        breakfast: "Greek Yogurt with Protein Powder",
        lunch: "Turkey & Avocado Wrap",
        dinner: "Grilled Steak with Vegetables",
      },
      {
        day: 4,
        breakfast: "Protein Smoothie Bowl",
        lunch: "Chicken & Rice Bowl",
        dinner: "Baked Salmon with Quinoa",
      },
      {
        day: 5,
        breakfast: "Scrambled Eggs with Turkey",
        lunch: "Protein Salad with Nuts",
        dinner: "Grilled Chicken with Sweet Potato",
      },
      {
        day: 6,
        breakfast: "Protein Oatmeal",
        lunch: "Tuna Salad Sandwich",
        dinner: "Lean Beef with Rice",
      },
      {
        day: 7,
        breakfast: "Egg White Scramble",
        lunch: "Chicken & Vegetable Soup",
        dinner: "Baked Fish with Quinoa",
      },
    ],
    totalIngredients: 38,
  },
  {
    id: 3,
    title: "Family Comfort Classics",
    description:
      "Wholesome, kid-friendly meals that bring the family together with familiar flavors and balanced nutrition.",
    days: 7,
    people: 4,
    estimatedCost: "$90-120",
    difficulty: "Easy",
    features: ["Kid-friendly", "Comfort food", "Family portions"],
    meals: [
      {
        day: 1,
        breakfast: "Whole Grain Pancakes with Fruit",
        lunch: "Turkey & Cheese Sandwiches",
        dinner: "Homemade Spaghetti with Meat Sauce",
      },
      {
        day: 2,
        breakfast: "Oatmeal with Banana & Cinnamon",
        lunch: "Chicken Noodle Soup",
        dinner: "Baked Chicken with Mashed Potatoes",
      },
      {
        day: 3,
        breakfast: "French Toast with Syrup",
        lunch: "Grilled Cheese & Tomato Soup",
        dinner: "Meatloaf with Roasted Vegetables",
      },
      {
        day: 4,
        breakfast: "Cereal with Milk & Berries",
        lunch: "Chicken Tenders with Fries",
        dinner: "Taco Night with Ground Beef",
      },
      {
        day: 5,
        breakfast: "Waffles with Butter & Syrup",
        lunch: "Mac & Cheese with Broccoli",
        dinner: "Baked Chicken with Rice",
      },
      {
        day: 6,
        breakfast: "Scrambled Eggs with Toast",
        lunch: "Peanut Butter & Jelly Sandwiches",
        dinner: "Pizza Night (Homemade)",
      },
      {
        day: 7,
        breakfast: "Pancakes with Sausage",
        lunch: "Chicken Nuggets with Veggies",
        dinner: "Beef Stew with Bread",
      },
    ],
    totalIngredients: 42,
  },
]

// PlanCard Component
const PlanCard = ({ plan, index, selectedPlan, setSelectedPlan }: any) => {
  const [isMealsExpanded, setIsMealsExpanded] = useState(false)

  return (
    <Card
      key={plan.id}
      className={cn(
        "flex flex-col hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-border/50 group cursor-pointer",
        selectedPlan === plan.id ? "ring-2 ring-primary shadow-2xl" : "hover:ring-2 hover:ring-primary/50"
      )}
      onClick={() => setSelectedPlan(plan.id)}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-primary">{index + 1}</span>
            </div>
            <CardTitle className="text-xl group-hover:text-primary transition-colors font-heading">
              {plan.title}
            </CardTitle>
          </div>
          <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
            <Clock className="h-3 w-3 mr-1" />
            {plan.days} days
          </Badge>
        </div>
        <CardDescription className="text-base leading-relaxed h-20">{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-6">
        <div className="flex flex-wrap gap-2">
          {plan.features.map((feature: string, idx: number) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {feature}
            </Badge>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground">Estimated Cost</div>
            <div className="font-semibold text-primary flex items-center gap-1">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              Calculating...
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Difficulty</div>
            <div className="font-semibold flex items-center gap-1">
              {plan.difficulty === "Easy" && <span className="text-green-600">🟢</span>}
              {plan.difficulty === "Medium" && <span className="text-yellow-600">🟡</span>}
              {plan.difficulty === "Hard" && <span className="text-red-600">🔴</span>}
              {plan.difficulty}
            </div>
          </div>
        </div>

        <Collapsible open={isMealsExpanded} onOpenChange={setIsMealsExpanded}>
          <div className="space-y-3">
            <div className="flex items-center gap-2"><Utensils className="h-4 w-4 text-primary" /><h4 className="font-medium text-foreground">Sample Meals</h4></div>
            <div className="space-y-3">
              {plan.meals.slice(0, 2).map((day: any) => (
                <div key={day.day} className="p-3 glass rounded-lg">
                  <div className="text-sm">
                    <span className="font-medium text-primary">Day {day.day}:</span>
                    <div className="mt-2 space-y-1 text-muted-foreground">
                      <div className="flex items-center gap-2"><span className="text-xs">🌅</span><span>{day.breakfast}</span></div>
                      <div className="flex items-center gap-2"><span className="text-xs">🌞</span><span>{day.lunch}</span></div>
                      <div className="flex items-center gap-2"><span className="text-xs">🌙</span><span>{day.dinner}</span></div>
                    </div>
                  </div>
                </div>
              ))}
              <CollapsibleContent className="space-y-3">
                {plan.meals.slice(2).map((day: any) => (
                  <div key={day.day} className="p-3 glass rounded-lg animate-fade-in">
                    <div className="text-sm">
                      <span className="font-medium text-primary">Day {day.day}:</span>
                      <div className="mt-2 space-y-1 text-muted-foreground">
                        <div className="flex items-center gap-2"><span className="text-xs">🌅</span><span>{day.breakfast}</span></div>
                        <div className="flex items-center gap-2"><span className="text-xs">🌞</span><span>{day.lunch}</span></div>
                        <div className="flex items-center gap-2"><span className="text-xs">🌙</span><span>{day.dinner}</span></div>
                      </div>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </div>
            {plan.days > 2 && (
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground">
                  {isMealsExpanded ? "Show Less" : `+${plan.days - 2} more days of meals`}
                  <ChevronDown className={cn("h-4 w-4 ml-1 transition-transform", isMealsExpanded && "rotate-180")} />
                </Button>
              </CollapsibleTrigger>
            )}
          </div>
        </Collapsible>

        <div className="space-y-3">
          <div className="flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-accent" /><h4 className="font-medium text-foreground">Shopping List</h4></div>
          <div className="p-3 bg-accent/5 rounded-lg border border-accent/20"><p className="text-sm text-muted-foreground"><span className="font-medium text-accent">{plan.totalIngredients}</span> unique ingredients organized by supermarket section</p></div>
        </div>
      </CardContent>

      <div className="p-6 pt-0">
        <Link href={`/demo/meal-details`}>
          <Button className={cn('w-full h-11 font-medium transition-colors', selectedPlan === plan.id ? 'bg-primary hover:bg-primary/90' : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground')}>
            <CheckCircle className="h-4 w-4 mr-2" />
            {selectedPlan === plan.id ? "View This Plan" : "Choose This Plan"}
          </Button>
        </Link>
      </div>
    </Card>
  )
}


export default function MealPlansDemo() {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(1)

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <FloatingParticles count={10} />

      <nav className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="flex justify-between items-center">
          <Link href="/"><Button variant="ghost" className="glass hover:glass-strong"><ArrowLeft className="h-4 w-4 mr-2" />Back to Cloud</Button></Link>
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

      <div className="container mx-auto px-4 py-20 max-w-6xl">
        <div className="text-center space-y-6 mb-16">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-4xl font-bold font-heading text-foreground">Choose Your Meal Plan</h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
              We've generated 3 personalized meal plan options tailored to your requirements. Each plan includes detailed recipes,
              nutritional information, and automated shopping lists that will be calculated once you proceed to checkout.
            </p>
          </div>

          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="flex items-center gap-3 bg-card/50 px-4 py-2 rounded-full border border-border/50">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">4 People</span>
            </div>
            <div className="flex items-center gap-3 bg-card/50 px-4 py-2 rounded-full border border-border/50">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">7 Days</span>
            </div>
            <div className="flex items-center gap-3 bg-card/50 px-4 py-2 rounded-full border border-border/50">
              <Utensils className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">21 Meals</span>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl border border-primary/10 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-muted-foreground">Shopping costs will be calculated when you proceed to checkout</span>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {DEMO_MEAL_PLANS.map((plan, index) => (
            <PlanCard key={plan.id} plan={plan} index={index} selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Card className="glass-strong border-0 max-w-md mx-auto">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-2">Need Something Different?</h3>
              <p className="text-sm text-muted-foreground mb-4">These are demo meal plans. The real app would generate plans based on your specific dietary preferences, restrictions, and goals.</p>
              <Link href="/"><Button variant="outline" className="w-full bg-transparent">Try the Interactive Cloud</Button></Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}