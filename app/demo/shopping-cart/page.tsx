"use client"

import { FloatingParticles } from "@/components/FloatingParticles"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, CheckCircle2, ExternalLink, ShoppingCart, UserCircle2 } from "lucide-react"
import Link from "next/link"

const DEMO_SHOPPING_ITEMS = [
  {
    id: 1,
    productName: "Organic Greek Yogurt (32oz)",
    price: 6.99,
    quantity: "2 containers",
    category: "Dairy",
    imageUrl: "https://fpoimg.com/400x350?text=Greek+Yogurt&bg_color=e6e6e6&text_color=8F8F8F",
    productUrl: "#",
    supermarket: "Whole Foods",
  },
  {
    id: 2,
    productName: "Wild-Caught Salmon Fillets",
    price: 24.99,
    quantity: "2 lbs",
    category: "Seafood",
    imageUrl: "https://fpoimg.com/400x350?text=Salmon+Fillets&bg_color=e6e6e6&text_color=8F8F8F",
    productUrl: "#",
    supermarket: "Whole Foods",
  },
  {
    id: 3,
    productName: "Organic Quinoa",
    price: 8.49,
    quantity: "2 lb bag",
    category: "Grains",
    imageUrl: "https://fpoimg.com/400x350?text=Quinoa&bg_color=e6e6e6&text_color=8F8F8F",
    productUrl: "#",
    supermarket: "Whole Foods",
  },
  {
    id: 4,
    productName: "Extra Virgin Olive Oil",
    price: 12.99,
    quantity: "500ml bottle",
    category: "Oils & Vinegars",
    imageUrl: "https://fpoimg.com/400x350?text=Olive+Oil&bg_color=e6e6e6&text_color=8F8F8F",
    productUrl: "#",
    supermarket: "Whole Foods",
  },
  {
    id: 5,
    productName: "Organic Mixed Berries",
    price: 7.99,
    quantity: "1 lb container",
    category: "Produce",
    imageUrl: "https://fpoimg.com/400x350?text=Mixed+Berries&bg_color=e6e6e6&text_color=8F8F8F",
    productUrl: "#",
    supermarket: "Whole Foods",
  },
  {
    id: 6,
    productName: "Free-Range Chicken Breast",
    price: 18.99,
    quantity: "3 lbs",
    category: "Meat",
    imageUrl: "https://fpoimg.com/400x350?text=Chicken+Breast&bg_color=e6e6e6&text_color=8F8F8F",
    productUrl: "#",
    supermarket: "Whole Foods",
  },
  {
    id: 7,
    productName: "Organic Baby Spinach",
    price: 4.99,
    quantity: "5oz bag",
    category: "Produce",
    imageUrl: "https://fpoimg.com/400x350?text=Baby+Spinach&bg_color=e6e6e6&text_color=8F8F8F",
    productUrl: "#",
    supermarket: "Whole Foods",
  },
  {
    id: 8,
    productName: "Organic Avocados",
    price: 5.99,
    quantity: "6 count",
    category: "Produce",
    imageUrl: "https://fpoimg.com/400x350?text=Avocados&bg_color=e6e6e6&text_color=8F8F8F",
    productUrl: "#",
    supermarket: "Whole Foods",
  },
]

const UNAVAILABLE_ITEMS = [
  {
    productName: "Specialty Mediterranean Herbs Mix",
    quantity: "1 package",
    reason: "Out of stock online",
  },
  {
    productName: "Artisanal Honey",
    quantity: "12oz jar",
    reason: "Not available for delivery",
  },
]

export default function ShoppingCartDemo() {
  const totalPrice = DEMO_SHOPPING_ITEMS.reduce((sum, item) => sum + item.price, 0)
  const categories = [...new Set(DEMO_SHOPPING_ITEMS.map((item) => item.category))]

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <FloatingParticles count={8} />

      <nav className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="flex justify-between items-center">
          <Link href="/demo/meal-plans"><Button variant="ghost" className="glass hover:glass-strong"><ArrowLeft className="h-4 w-4 mr-2" />Back to Meal Plans</Button></Link>
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
        <div className="text-center space-y-4 mb-8">
          <div className="flex items-center justify-center gap-2 mb-4"><ShoppingCart className="h-8 w-8 text-primary" /><h1 className="text-4xl font-bold font-heading text-foreground">Your Shopping Cart</h1></div>
          <p className="text-muted-foreground text-lg">Mediterranean Delight meal plan - All ingredients organized and ready for purchase</p>
          <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /><span className="text-muted-foreground">{DEMO_SHOPPING_ITEMS.length} items found</span></div>
            {UNAVAILABLE_ITEMS.length > 0 && (<div className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-destructive" /><span className="text-muted-foreground">{UNAVAILABLE_ITEMS.length} items unavailable</span></div>)}
            <div className="font-semibold text-primary text-lg">Total: ${totalPrice.toFixed(2)}</div>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-5 lg:grid-cols-4">
          <div className="xl:col-span-3 lg:col-span-2 space-y-6">
            <Card className="glass-strong border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 font-heading text-xl">
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center border-2 border-green-200">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  Available Products
                  <Badge variant="secondary" className="ml-auto bg-primary/10 text-primary">
                    {DEMO_SHOPPING_ITEMS.length} items
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {categories.map((category) => (
                  <div key={category} className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                      <h3 className="font-semibold text-foreground text-lg">{category}</h3>
                      <Badge variant="outline" className="text-xs">
                        {DEMO_SHOPPING_ITEMS.filter((item) => item.category === category).length} items
                      </Badge>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                      {DEMO_SHOPPING_ITEMS.filter((item) => item.category === category).map((item) => (
                        <Card key={item.id} className="hover:shadow-lg transition-all duration-200 border-0 glass group hover:scale-[1.02]">
                          <CardContent className="p-5">
                            <div className="flex items-center gap-4">
                              <div className="w-20 h-20 bg-muted rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                                <img src={item.imageUrl || "/placeholder.svg"} alt={item.productName} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">{item.productName}</h3>
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20">{item.quantity}</Badge>
                                  <Badge variant="secondary" className="text-xs bg-accent/10">{item.category}</Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                                  From {item.supermarket}
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-xl font-bold text-primary mb-3">${item.price.toFixed(2)}</div>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => window.open(item.productUrl, "_blank")}
                                  className="shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Add to Cart
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {UNAVAILABLE_ITEMS.length > 0 && (
              <Card className="border-destructive/20 bg-destructive/5">
                <CardHeader><CardTitle className="flex items-center gap-2 text-destructive font-heading"><AlertCircle className="h-5 w-5" />Items to Find Manually</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {UNAVAILABLE_ITEMS.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-foreground">{item.productName}</h3>
                        <Badge variant="outline" className="mt-1 text-xs">{item.quantity}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground text-right">{item.reason}</div>
                    </div>
                  ))}
                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg"><p className="font-medium mb-1">These items couldn't be found automatically:</p><p>You can search for them manually at your chosen supermarket or substitute with similar items.</p></div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="xl:col-span-2 lg:col-span-2 space-y-6">
            <div className="lg:sticky lg:top-24 space-y-6">
              <Card className="glass-strong border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 font-heading text-xl">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                    </div>
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm p-3 bg-card/30 rounded-lg">
                      <span>Subtotal ({DEMO_SHOPPING_ITEMS.length} items)</span>
                      <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm p-3 bg-card/30 rounded-lg">
                      <span>Estimated Tax</span>
                      <span className="font-semibold">${(totalPrice * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm p-3 bg-card/30 rounded-lg">
                      <span>Delivery Fee</span>
                      <span className="font-semibold">$5.99</span>
                    </div>
                    <div className="border-t border-border/50 pt-4 mt-4">
                      <div className="flex justify-between items-center text-lg font-bold p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl">
                        <span>Total</span>
                        <span className="text-primary text-xl">${(totalPrice + totalPrice * 0.08 + 5.99).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full h-12 font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Proceed to Checkout
                  </Button>
                  <div className="text-xs text-muted-foreground text-center bg-amber-50/50 p-3 rounded-lg border border-amber-200/30">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                      <span className="font-medium text-amber-700">Demo Mode</span>
                    </div>
                    <p className="text-amber-600">In the real app, this would redirect to your chosen supermarket's checkout.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-0">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-2 font-heading">Meal Plan Details</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between"><span>Plan:</span><span>Mediterranean Delight</span></div>
                    <div className="flex justify-between"><span>Duration:</span><span>7 days</span></div>
                    <div className="flex justify-between"><span>Servings:</span><span>4 people</span></div>
                    <div className="flex justify-between"><span>Total Meals:</span><span>21 meals</span></div>
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