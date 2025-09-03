"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, ShoppingCart, Utensils } from "lucide-react"
import type { MealPlanOption } from "@/lib/types"

interface MealPlanOptionsProps {
  options: MealPlanOption[]
  onSelectPlan: (plan: MealPlanOption) => void
}

export default function MealPlanOptions({ options, onSelectPlan }: MealPlanOptionsProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CheckCircle className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold text-foreground">Choose Your Meal Plan</h2>
        </div>
        <p className="text-muted-foreground text-lg">
          We've generated {options.length} personalized meal plan options tailored to your requirements
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {options.map((option, index) => (
          <Card
            key={option.optionId}
            className="flex flex-col hover:shadow-lg transition-shadow border-border/50 group"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">{option.title}</CardTitle>
                </div>
                <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                  <Clock className="h-3 w-3 mr-1" />
                  {option.dailyPlan.length} days
                </Badge>
              </div>
              <CardDescription className="text-base leading-relaxed">{option.description}</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-primary" />
                  <h4 className="font-medium text-foreground">Sample Meals</h4>
                </div>
                <div className="space-y-2">
                  {option.dailyPlan.slice(0, 2).map((day) => (
                    <div key={day.day} className="p-3 bg-secondary/30 rounded-lg">
                      <div className="text-sm">
                        <span className="font-medium text-primary">Day {day.day}:</span>
                        <div className="mt-1 space-y-1 text-muted-foreground">
                          <div>🌅 {day.meals.breakfast.name}</div>
                          <div>🌞 {day.meals.lunch.name}</div>
                          <div>🌙 {day.meals.dinner.name}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {option.dailyPlan.length > 2 && (
                    <div className="text-center py-2">
                      <span className="text-xs text-muted-foreground">+{option.dailyPlan.length - 2} more days</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-accent" />
                  <h4 className="font-medium text-foreground">Shopping List</h4>
                </div>
                <div className="p-3 bg-accent/5 rounded-lg border border-accent/20">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-accent">{option.shoppingList.length}</span> unique ingredients
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {option.shoppingList.slice(0, 3).map((ingredient, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {ingredient.item}
                      </Badge>
                    ))}
                    {option.shoppingList.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{option.shoppingList.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>

            <div className="p-6 pt-0">
              <Button
                onClick={() => onSelectPlan(option)}
                className="w-full h-11 font-medium group-hover:bg-primary/90 transition-colors"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Choose This Plan
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
