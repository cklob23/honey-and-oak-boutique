"use client"

import { useEffect, useState } from "react"
import { X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useCart } from "@/context/cart-context"
import apiClient from "@/lib/api-client"
import { Cart, CartItem, Customer } from "@/types"
import { ExpressCheckoutElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { stripePromise } from "@/lib/stripe"

interface CartSidebarProps {
    isOpen: boolean
    onClose: () => void
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
    const [discountCode, setDiscountCode] = useState("")
    const { cartCount, refreshCart } = useCart()
    const cartId = typeof window !== "undefined" ? localStorage.getItem("cartId") : null
    const [customerId, setCustomerId] = useState<string | null>(null)
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [cart, setCart] = useState<Cart[]>([])
    const [loading, setLoading] = useState(false)
    const [clientSecret, setClientSecret] = useState<string | null>(null)

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

    useEffect(() => {
        const id = localStorage.getItem("customerId")
        if (id) {
            apiClient.get(`/customers/${id}`).then(res => setCustomer(res.data))
        }
        setCustomerId(id)
    }, [])
    // Load cart
    useEffect(() => {
        if (!cartId) return

        const fetchCart = async () => {
            setLoading(true)
            try {
                const response = await apiClient.get(`/cart/${cartId}`)
                setCart(response.data)
                setCartItems(response.data?.items || [])
            } catch (error: any) {
                if (error.response?.status === 404) {
                    setCartItems([])
                }
            } finally {
                setLoading(false)
            }
        }

        fetchCart()
    }, [cartId, cartCount])

    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    )
    const taxRate = 0.07
    const tax = subtotal * taxRate
    const shipping = subtotal > 100 ? 0 : 10
    const total = subtotal + shipping + tax
    const totalCents = Math.round(total * 100)
    const isStripeEligible = totalCents >= 50
    console.log(totalCents)

    useEffect(() => {
        if (!cartId || !customerId) return
        if (!isStripeEligible) {
            setClientSecret(null)
            return
        }

        const createCheckoutIntent = async () => {
            try {
                const response = await apiClient.post("/checkout/preview", {
                    cartId, email: customer?.email || null
                })

                setClientSecret(response.data.clientSecret)
            } catch (err) {
                console.error("Failed to start checkout", err)
                setClientSecret(null)
            }
        }

        createCheckoutIntent()
    }, [cartId, customerId, totalCents, isStripeEligible, cartItems])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading cart…
            </div>
        )
    }


    return (
        <>
            {/* Backdrop */}
            {isOpen && <div className="fixed inset-0 bg-foreground/20 z-40 transition-opacity" onClick={onClose} />}

            {/* Sidebar */}
            <div
                className={`fixed right-0 top-0 h-full w-full sm:w-[480px] bg-background shadow-2xl z-50 transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-semibold text-foreground">Cart</h2>
                            <span className="bg-foreground text-background w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">
                                {cartCount}
                            </span>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {cartItems.map((item, index) => (
                            <div key={index} className="flex gap-4">
                                <div className="w-20 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                    <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-foreground mb-1 truncate">{item.name}</h3>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        {item.color} / {item.size}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 border border-border rounded-lg">
                                            <button
                                                onClick={() => updateQuantity(index, item.quantity - 1)}
                                                className="px-2 py-1 hover:bg-muted"
                                            >
                                                −
                                            </button>
                                            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(index, item.quantity + 1)}
                                                className="px-2 py-1 hover:bg-muted"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeItem(index)}
                                            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-border p-6 space-y-4">
                        {/* Discount Code */}
                        <div>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Discount code or gift card"
                                    value={discountCode}
                                    onChange={(e) => setDiscountCode(e.target.value)}
                                    className="flex-1"
                                />
                                <Button variant="outline" size="sm" className="bg-transparent">
                                    Apply
                                </Button>
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal · {cartItems.length} items</span>
                                <span className="font-medium">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="font-medium">{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Estimated taxes</span>
                                <span className="font-medium">${tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                                <span>Estimated total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Taxes and shipping calculated at checkout.</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            <Link href="/checkout" className="block">
                                <Button className="w-full bg-foreground text-background hover:bg-foreground/90 h-10 font-semibold">
                                    CHECK OUT
                                </Button>
                            </Link>
                            <div className="space-y-4">
                                {clientSecret && isStripeEligible ? (
                                    <Elements
                                        key={clientSecret}
                                        stripe={stripePromise}
                                        options={{
                                            clientSecret,
                                            appearance: { theme: "stripe" },
                                        }}
                                    >
                                        <ExpressCheckout clientSecret={clientSecret} />
                                    </Elements>
                                ) : (
                                    <p className="text-xs text-muted-foreground text-center">
                                        Express checkout available at checkout
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

function ExpressCheckout({ clientSecret }: { clientSecret: string }) {
    const stripe = useStripe()
    const elements = useElements()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleConfirm = async () => {
        if (!stripe || !elements) return

        setLoading(true)
        setError(null)

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/checkout/success`,
            },
        })

        if (error) {
            setError(error.message ?? "Payment failed")
        }

        setLoading(false)
    }

    return (
        <>
            <ExpressCheckoutElement
                onConfirm={handleConfirm}
                options={{
                    layout: {
                        maxColumns: 1,
                        maxRows: 5,
                        overflow: "auto",
                    },
                    emailRequired: true,
                }}
            />

            {error && <p className="text-sm text-red-600">{error}</p>}
        </>
    )
}
