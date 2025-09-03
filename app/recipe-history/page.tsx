"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Users, DollarSign, Star, Trash2 } from "lucide-react"
import Link from "next/link"

interface SavedRecipe {
  id: string
  title: string
  description: string
  savedDate: Date
  difficulty: string
  cookingTime: string
  servings: number
  estimatedCost: string
  rating?: number
  tags: string[]
}

export default function RecipeHistoryPage() {
  const [savedRecipes] = useState<SavedRecipe[]>([
    {
      id: "1",
      title: "Mediterranean Quinoa Bowl",
      description: "Fresh quinoa bowl with roasted vegetables, feta cheese, and tahini dressing",
      savedDate: new Date("2024-01-15"),
      difficulty: "Easy",
      cookingTime: "25 mins",
      servings: 2,
      estimatedCost: "$12-15",
      rating: 5,
      tags: ["Vegetarian", "High Protein", "Mediterranean"],
    },
    {
      id: "2",
      title: "Spicy Thai Chicken Curry",
      description: "Aromatic coconut curry with tender chicken and fresh vegetables",
      savedDate: new Date("2024-01-10"),
      difficulty: "Medium",
      cookingTime: "35 mins",
      servings: 4,
      estimatedCost: "$18-22",
      rating: 4,
      tags: ["Thai", "Spicy", "Gluten-Free"],
    },
  ])

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="glass bg-transparent">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Chat
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Recipe History</h1>
            <p className="text-muted-foreground">Your saved meal plans and recipes</p>
          </div>
        </div>

        <div className="grid gap-6">
          {savedRecipes.map((recipe) => (
            <Card key={recipe.id} className="glass-strong border-0">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-heading">{recipe.title}</CardTitle>
                    <p className="text-muted-foreground mt-1">{recipe.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {recipe.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{recipe.rating}</span>
                      </div>
                    )}
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{recipe.cookingTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{recipe.servings} servings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{recipe.estimatedCost}</span>
                  </div>
                  <div className="text-muted-foreground">Saved {recipe.savedDate.toLocaleDateString()}</div>
                </div>

                <div className="flex gap-2">
                  <Link href="/demo/meal-details">
                    <Button size="sm" variant="default">
                      View Recipe
                    </Button>
                  </Link>
                  <Link href="/demo/shopping-cart">
                    <Button size="sm" variant="outline">
                      Reorder Ingredients
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline">
                    Share Recipe
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {savedRecipes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No saved recipes yet</p>
            <Link href="/">
              <Button>Start Cooking</Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
