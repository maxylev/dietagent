"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Zap, Dumbbell, Store, Sparkles } from "lucide-react"
import type { DietFormData } from "@/lib/types"

interface DietFormProps {
  onSubmit: (data: DietFormData) => void
}

const SUPERMARKETS = [
  { value: "walmart", label: "Walmart", icon: "🏪" },
  { value: "tesco", label: "Tesco", icon: "🛒" },
  { value: "carrefour", label: "Carrefour", icon: "🏬" },
  { value: "kroger", label: "Kroger", icon: "🛍️" },
  { value: "target", label: "Target", icon: "🎯" },
]

export default function DietForm({ onSubmit }: DietFormProps) {
  const [formData, setFormData] = useState<DietFormData>({
    days: 7,
    people: 2,
    calories: 2000,
    protein: 150,
    supermarket: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.supermarket) {
      alert("Please select a supermarket")
      return
    }
    onSubmit(formData)
  }

  const handleInputChange = (field: keyof DietFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-border/50">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-foreground">Create Your Diet Plan</CardTitle>
        <CardDescription className="text-base leading-relaxed">
          Tell us your requirements and we'll generate personalized meal plans with shopping lists
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="days" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Number of Days
              </Label>
              <Input
                id="days"
                type="number"
                min="1"
                max="30"
                value={formData.days}
                onChange={(e) => handleInputChange("days", Number.parseInt(e.target.value))}
                className="h-12 text-base"
                required
              />
              <p className="text-xs text-muted-foreground">Plan duration (1-30 days)</p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="people" className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Number of People
              </Label>
              <Input
                id="people"
                type="number"
                min="1"
                max="10"
                value={formData.people}
                onChange={(e) => handleInputChange("people", Number.parseInt(e.target.value))}
                className="h-12 text-base"
                required
              />
              <p className="text-xs text-muted-foreground">How many people to feed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="calories" className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" />
                Daily Calories (per person)
              </Label>
              <Input
                id="calories"
                type="number"
                min="1000"
                max="5000"
                step="50"
                value={formData.calories}
                onChange={(e) => handleInputChange("calories", Number.parseInt(e.target.value))}
                className="h-12 text-base"
                required
              />
              <p className="text-xs text-muted-foreground">Target calories per day</p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="protein" className="text-sm font-medium flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-accent" />
                Daily Protein (g per person)
              </Label>
              <Input
                id="protein"
                type="number"
                min="50"
                max="300"
                step="5"
                value={formData.protein}
                onChange={(e) => handleInputChange("protein", Number.parseInt(e.target.value))}
                className="h-12 text-base"
                required
              />
              <p className="text-xs text-muted-foreground">Target protein intake</p>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="supermarket" className="text-sm font-medium flex items-center gap-2">
              <Store className="h-4 w-4 text-primary" />
              Preferred Supermarket
            </Label>
            <Select
              value={formData.supermarket}
              onValueChange={(value) => handleInputChange("supermarket", value)}
              required
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Select your preferred supermarket" />
              </SelectTrigger>
              <SelectContent>
                {SUPERMARKETS.map((market) => (
                  <SelectItem key={market.value} value={market.value} className="text-base">
                    <div className="flex items-center gap-2">
                      <span>{market.icon}</span>
                      <span>{market.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">We'll find products from your chosen store</p>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full h-12 text-base font-medium" size="lg">
              <Sparkles className="h-5 w-5 mr-2" />
              Generate Meal Plans
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
