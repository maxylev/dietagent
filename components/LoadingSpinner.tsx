import { Loader2, Utensils, ShoppingBag } from "lucide-react"

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="p-4 bg-primary/10 rounded-full animate-pulse">
              <Utensils className="h-8 w-8 text-primary" />
            </div>
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <div className="p-4 bg-accent/10 rounded-full animate-pulse delay-300">
              <ShoppingBag className="h-8 w-8 text-accent" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground">Processing your request...</p>
          <p className="text-muted-foreground">Our AI is creating personalized meal plans just for you</p>
        </div>

        <div className="w-64 mx-auto">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Analyzing preferences</span>
            <span>Generating plans</span>
            <span>Creating shopping lists</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full animate-pulse"
              style={{ width: "60%" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
