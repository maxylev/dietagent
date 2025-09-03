"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, AlertCircle, CheckCircle2 } from "lucide-react"
import type { ShoppingCartItem } from "@/lib/types"

interface ShoppingCartProps {
  items: ShoppingCartItem[]
}

export default function ShoppingCart({ items }: ShoppingCartProps) {
  const validItems = items.filter((item) => item.price > 0 && item.productUrl)
  const unavailableItems = items.filter((item) => item.price === 0 || !item.productUrl)
  const totalPrice = validItems.reduce((sum, item) => sum + item.price, 0)

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Your Shopping Cart</h2>
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">{validItems.length} items found</span>
          </div>
          {unavailableItems.length > 0 && (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-muted-foreground">{unavailableItems.length} items unavailable</span>
            </div>
          )}
          <div className="font-semibold text-primary">Total: ${totalPrice.toFixed(2)}</div>
        </div>
      </div>

      {validItems.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Available Products
          </h3>
          <div className="grid gap-4">
            {validItems.map((item, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl || "/placeholder.svg"}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = "none"
                            target.nextElementSibling?.classList.remove("hidden")
                          }}
                        />
                      ) : null}
                      <div className={`text-xs text-muted-foreground text-center p-2 ${item.imageUrl ? "hidden" : ""}`}>
                        No Image
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{item.productName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{item.quantity}</Badge>
                        <span className="text-lg font-semibold text-primary">${item.price.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => window.open(item.productUrl, "_blank")}
                      className="shrink-0"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Product
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {unavailableItems.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Items to Find Manually
          </h3>
          <div className="grid gap-3">
            {unavailableItems.map((item, index) => (
              <Card key={index} className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">{item.productName}</h3>
                      <Badge variant="outline" className="mt-1">
                        {item.quantity}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">Not found online</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
            <p className="font-medium mb-2">These items couldn't be found automatically:</p>
            <p>You can search for them manually at your chosen supermarket or substitute with similar ingredients.</p>
          </div>
        </div>
      )}

      <div className="text-center">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Ready to Shop?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Click "View Product" on each item to add them to your supermarket cart, then proceed to checkout.
            </p>
            {validItems.length > 0 && (
              <Badge variant="secondary" className="text-lg px-4 py-2 bg-primary/10 text-primary">
                Total: ${totalPrice.toFixed(2)}
              </Badge>
            )}
            {unavailableItems.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Don't forget to manually search for the {unavailableItems.length} unavailable items at your store.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
