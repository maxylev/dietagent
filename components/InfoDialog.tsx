"use client"

import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface InfoDialogProps {
  children: React.ReactNode
}

export function InfoDialog({ children }: InfoDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="glass-strong border-0 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-heading">Cloud Diet Agent</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            Welcome to the future of diet planning! Our AI-powered cloud interface responds to your voice and creates
            personalized meal plans with automated shopping lists.
          </p>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">How to use:</h4>
            <ul className="space-y-1 text-xs">
              <li>• Click the cloud to start voice interaction</li>
              <li>• Speak your dietary preferences naturally</li>
              <li>• Get 3 personalized meal plan options</li>
              <li>• Receive automated shopping lists</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Demo Pages:</h4>
            <div className="flex flex-col gap-2">
              <Link href="/demo/meal-plans">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  View Meal Plans Demo
                </Button>
              </Link>
              <Link href="/demo/shopping-cart">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  View Shopping Cart Demo
                </Button>
              </Link>
              <Link href="/demo/meal-details">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  View Recipe Details Demo
                </Button>
              </Link>
            </div>
          </div>
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs">The cloud changes color and shape based on your theme and interaction state.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
