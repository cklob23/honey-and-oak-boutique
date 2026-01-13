"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, ArrowLeft } from "lucide-react"
import Link from "next/link"
import apiClient from "@/lib/api-client"
import { useCart } from "@/context/cart-context"
import { CartItem } from "@/types/cart"

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [giftCardCode, setGiftCardCode] = useState("")
  const [promoCode, setPromoCode] = useState("")
  const [appliedDiscount, setAppliedDiscount] = useState(0)
  const [loading, setLoading] = useState(false)

  const customerId =
    typeof window !== "undefined" ? localStorage.getItem("customerId") : null
  const cartId =
    typeof window !== "undefined" ? localStorage.getItem("cartId") : null

  const { refreshCart } = useCart()

  // Load cart
  useEffect(() => {
    if (!cartId) return

    const fetchCart = async () => {
      setLoading(true)
      try {
        const response = await apiClient.get(`/cart/${cartId}`)
        setCartItems(response.data?.items || [])
        setLoading(false)
      } catch (error: any) {
        if (error.response?.status === 404) {
          setCartItems([])
        }
      }
    }

    fetchCart()
  }, [cartId])

  // Remove item
  const removeItem = async (index: number) => {
    try {
      await apiClient.delete(`/cart/${cartId}/items/${index}`)
      refreshCart()
      setCartItems((prev) => prev.filter((_, i) => i !== index))
    } catch (err) {
      console.error("Failed remove:", err)
    }
  }

  // Update item quantity
  const updateQuantity = async (index: number, quantity: number) => {
    if (quantity < 1) {
      removeItem(index)
    } else {
      try {
        await apiClient.put(`/cart/${cartId}/items/${index}`, { quantity })
        setCartItems((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, quantity } : item
          )
        )
        refreshCart()
      } catch (err) {
        console.error("Failed to update item quantity:", err)
      }
    }
  }

  // Persist size/color change
  const updateCartItem = async (index: number, updates: any) => {
    try {
      await apiClient.put(`/cart/${cartId}/items/${index}`, updates)
      setCartItems(prev =>
        prev.map((item, i) =>
          i === index ? { ...item, ...updates } : item
        )
      )
      refreshCart()
    } catch (err) {
      console.error("Failed to update item:", err)
    }
  }


  // Totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const tax = subtotal * 0.08
  const shipping = subtotal > 100 ? 0 : 10
  const total = subtotal + tax + shipping - appliedDiscount

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <div className="mb-12">
          <Link
            href="/shop"
            className="flex items-center gap-2 text-accent hover:text-accent/80 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>

          <h1 className="text-4xl font-serif font-bold text-foreground">
            Shopping Cart
          </h1>
        </div>
        {loading && (
          <p className="text-muted-foreground text-sm">Loading cart...</p>
        )}
        {/* Empty Cart */}
        {!loading && cartItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground mb-6">
              Your cart is empty
            </p>
            <Link href="/shop">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* ---------------- CART ITEMS ---------------- */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-6 p-4 border border-border rounded-lg"
                >
                  {/* Product Image */}
                  <div className="w-28 h-28 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.name}</h3>

                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="font-medium">Color:</span>{" "}
                      {item.color || "—"}{" "}
                      <span className="ml-4 font-medium">Size:</span>{" "}
                      {item.size || "—"}
                    </p>

                    {/* Color Selector */}
                    <div className="mt-4">
                      <p className="text-xs font-semibold mb-1 text-muted-foreground">
                        Change Color
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.availableColors?.map((color: string) => (
                          <button
                            key={color}
                            onClick={() =>
                              updateCartItem(index, { color })
                            }
                            className={`px-3 py-1 rounded-full border text-sm ${item.color === color
                              ? "bg-accent text-white border-accent"
                              : "bg-muted text-foreground hover:bg-muted-foreground border-border"
                              }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Size Selector */}
                    <div className="mt-4">
                      <p className="text-xs font-semibold mb-1 text-muted-foreground">
                        Change Size
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.availableSizes?.map((s: any) => {
                          const size = typeof s === "string" ? s : s.size
                          return (
                            <button
                              key={size}
                              onClick={() =>
                                updateCartItem(index, { size })
                              }
                              className={`px-3 py-1 rounded-full border text-sm ${item.size === size
                                ? "bg-accent text-white border-accent"
                                : "bg-muted text-foreground hover:bg-muted-foreground border-border"
                                }`}
                            >
                              {size}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Quantity + Price */}
                    <div className="flex items-center gap-4 mt-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(index, item.quantity - 1)
                          }
                          className="px-2 py-1 hover:bg-muted rounded"
                        >
                          −
                        </button>

                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(index, item.quantity + 1)
                          }
                          className="px-2 py-1 hover:bg-muted rounded"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-lg font-bold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(index)}
                    className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* ---------------- ORDER SUMMARY ---------------- */}
            <div className="bg-secondary rounded-xl p-6 space-y-6 max-h-140">
              {/* Gift Card */}
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Gift Card
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value)}
                  />
                  <Button variant="outline" onClick={() => setAppliedDiscount(25)}>
                    Apply
                  </Button>
                </div>
              </div>

              {/* Promo Code */}
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Promo Code
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <Button variant="outline" onClick={() => setAppliedDiscount(10)}>
                    Apply
                  </Button>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-sm text-accent">
                    <span>Discount</span>
                    <span>-${appliedDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout */}
              {/* <Button variant="outline" className="w-full mb-3">
                <span>Buy with</span>

                <img
                  src="/apple-pay.png"
                  alt="Apple Pay"
                  className="h-4 w-auto object-contain"
                />
              </Button> */}
              <Link href="/checkout">
                <Button className="w-full bg-primary mb-3 text-primary-foreground hover:bg-primary/90">
                  Proceed to Checkout
                </Button>
              </Link>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
