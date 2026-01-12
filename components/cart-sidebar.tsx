"use client"

import { useEffect, useState } from "react"
import { X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useCart } from "@/context/cart-context"
import apiClient from "@/lib/api-client"
import { CartItem } from "@/types"

interface CartSidebarProps {
    isOpen: boolean
    onClose: () => void
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
    const [discountCode, setDiscountCode] = useState("")
    const { cartCount, refreshCart } = useCart()
    const cartId = typeof window !== "undefined" ? localStorage.getItem("cartId") : null
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(false)

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

    // Load cart
    useEffect(() => {
        if (!cartId) return

        const fetchCart = async () => {
            setLoading(true)
            try {
                const response = await apiClient.get(`/cart/${cartId}`)
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



    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shipping = subtotal > 100 ? 0 : 10
    const total = subtotal + shipping

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
                            <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                                <span>Estimated total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Taxes and shipping calculated at checkout.</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            <Link href="/checkout" className="block">
                                <Button className="w-full bg-foreground text-background hover:bg-foreground/90 h-12 font-semibold">
                                    CHECK OUT
                                </Button>
                            </Link>
                            <Button className="w-full bg-white text-white hover:bg-gray-100 h-12 font-semibold transition-colors">
                                <img
                                    src="/apple-pay.png"
                                    alt="Apple Pay"
                                    className="h-6 w-auto object-contain"
                                />
                            </Button>
                            <Button className="w-full bg-[#FF9900] text-white hover:bg-[#E88700] h-12 font-semibold pt-4">
                                <img
                                    src="https://m.media-amazon.com/images/G/01/AmazonPay/Maxo/amazonpay-logo-rgb_drk_1.svg"
                                    alt="Amazon Pay"
                                    className="h-6 object-contain"
                                />
                            </Button>
                            <Button className="w-full bg-[#FFC439] text-foreground hover:bg-[#F0B429] h-12 font-semibold"><img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAxcHgiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAxMDEgMzIiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaW5ZTWluIG1lZXQiIHhtbG5zPSJodHRwOiYjeDJGOyYjeDJGO3d3dy53My5vcmcmI3gyRjsyMDAwJiN4MkY7c3ZnIj48cGF0aCBmaWxsPSIjMDAzMDg3IiBkPSJNIDEyLjIzNyAyLjggTCA0LjQzNyAyLjggQyAzLjkzNyAyLjggMy40MzcgMy4yIDMuMzM3IDMuNyBMIDAuMjM3IDIzLjcgQyAwLjEzNyAyNC4xIDAuNDM3IDI0LjQgMC44MzcgMjQuNCBMIDQuNTM3IDI0LjQgQyA1LjAzNyAyNC40IDUuNTM3IDI0IDUuNjM3IDIzLjUgTCA2LjQzNyAxOC4xIEMgNi41MzcgMTcuNiA2LjkzNyAxNy4yIDcuNTM3IDE3LjIgTCAxMC4wMzcgMTcuMiBDIDE1LjEzNyAxNy4yIDE4LjEzNyAxNC43IDE4LjkzNyA5LjggQyAxOS4yMzcgNy43IDE4LjkzNyA2IDE3LjkzNyA0LjggQyAxNi44MzcgMy41IDE0LjgzNyAyLjggMTIuMjM3IDIuOCBaIE0gMTMuMTM3IDEwLjEgQyAxMi43MzcgMTIuOSAxMC41MzcgMTIuOSA4LjUzNyAxMi45IEwgNy4zMzcgMTIuOSBMIDguMTM3IDcuNyBDIDguMTM3IDcuNCA4LjQzNyA3LjIgOC43MzcgNy4yIEwgOS4yMzcgNy4yIEMgMTAuNjM3IDcuMiAxMS45MzcgNy4yIDEyLjYzNyA4IEMgMTMuMTM3IDguNCAxMy4zMzcgOS4xIDEzLjEzNyAxMC4xIFoiPjwvcGF0aD48cGF0aCBmaWxsPSIjMDAzMDg3IiBkPSJNIDM1LjQzNyAxMCBMIDMxLjczNyAxMCBDIDMxLjQzNyAxMCAzMS4xMzcgMTAuMiAzMS4xMzcgMTAuNSBMIDMwLjkzNyAxMS41IEwgMzAuNjM3IDExLjEgQyAyOS44MzcgOS45IDI4LjAzNyA5LjUgMjYuMjM3IDkuNSBDIDIyLjEzNyA5LjUgMTguNjM3IDEyLjYgMTcuOTM3IDE3IEMgMTcuNTM3IDE5LjIgMTguMDM3IDIxLjMgMTkuMzM3IDIyLjcgQyAyMC40MzcgMjQgMjIuMTM3IDI0LjYgMjQuMDM3IDI0LjYgQyAyNy4zMzcgMjQuNiAyOS4yMzcgMjIuNSAyOS4yMzcgMjIuNSBMIDI5LjAzNyAyMy41IEMgMjguOTM3IDIzLjkgMjkuMjM3IDI0LjMgMjkuNjM3IDI0LjMgTCAzMy4wMzcgMjQuMyBDIDMzLjUzNyAyNC4zIDM0LjAzNyAyMy45IDM0LjEzNyAyMy40IEwgMzYuMTM3IDEwLjYgQyAzNi4yMzcgMTAuNCAzNS44MzcgMTAgMzUuNDM3IDEwIFogTSAzMC4zMzcgMTcuMiBDIDI5LjkzNyAxOS4zIDI4LjMzNyAyMC44IDI2LjEzNyAyMC44IEMgMjUuMDM3IDIwLjggMjQuMjM3IDIwLjUgMjMuNjM3IDE5LjggQyAyMy4wMzcgMTkuMSAyMi44MzcgMTguMiAyMy4wMzcgMTcuMiBDIDIzLjMzNyAxNS4xIDI1LjEzNyAxMy42IDI3LjIzNyAxMy42IEMgMjguMzM3IDEzLjYgMjkuMTM3IDE0IDI5LjczNyAxNC42IEMgMzAuMjM3IDE1LjMgMzAuNDM3IDE2LjIgMzAuMzM3IDE3LjIgWiI+PC9wYXRoPjxwYXRoIGZpbGw9IiMwMDMwODciIGQ9Ik0gNTUuMzM3IDEwIEwgNTEuNjM3IDEwIEMgNTEuMjM3IDEwIDUwLjkzNyAxMC4yIDUwLjczNyAxMC41IEwgNDUuNTM3IDE4LjEgTCA0My4zMzcgMTAuOCBDIDQzLjIzNyAxMC4zIDQyLjczNyAxMCA0Mi4zMzcgMTAgTCAzOC42MzcgMTAgQyAzOC4yMzcgMTAgMzcuODM3IDEwLjQgMzguMDM3IDEwLjkgTCA0Mi4xMzcgMjMgTCAzOC4yMzcgMjguNCBDIDM3LjkzNyAyOC44IDM4LjIzNyAyOS40IDM4LjczNyAyOS40IEwgNDIuNDM3IDI5LjQgQyA0Mi44MzcgMjkuNCA0My4xMzcgMjkuMiA0My4zMzcgMjguOSBMIDU1LjgzNyAxMC45IEMgNTYuMTM3IDEwLjYgNTUuODM3IDEwIDU1LjMzNyAxMCBaIj48L3BhdGg+PHBhdGggZmlsbD0iIzAwOWNkZSIgZD0iTSA2Ny43MzcgMi44IEwgNTkuOTM3IDIuOCBDIDU5LjQzNyAyLjggNTguOTM3IDMuMiA1OC44MzcgMy43IEwgNTUuNzM3IDIzLjYgQyA1NS42MzcgMjQgNTUuOTM3IDI0LjMgNTYuMzM3IDI0LjMgTCA2MC4zMzcgMjQuMyBDIDYwLjczNyAyNC4zIDYxLjAzNyAyNCA2MS4wMzcgMjMuNyBMIDYxLjkzNyAxOCBDIDYyLjAzNyAxNy41IDYyLjQzNyAxNy4xIDYzLjAzNyAxNy4xIEwgNjUuNTM3IDE3LjEgQyA3MC42MzcgMTcuMSA3My42MzcgMTQuNiA3NC40MzcgOS43IEMgNzQuNzM3IDcuNiA3NC40MzcgNS45IDczLjQzNyA0LjcgQyA3Mi4yMzcgMy41IDcwLjMzNyAyLjggNjcuNzM3IDIuOCBaIE0gNjguNjM3IDEwLjEgQyA2OC4yMzcgMTIuOSA2Ni4wMzcgMTIuOSA2NC4wMzcgMTIuOSBMIDYyLjgzNyAxMi45IEwgNjMuNjM3IDcuNyBDIDYzLjYzNyA3LjQgNjMuOTM3IDcuMiA2NC4yMzcgNy4yIEwgNjQuNzM3IDcuMiBDIDY2LjEzNyA3LjIgNjcuNDM3IDcuMiA2OC4xMzcgOCBDIDY4LjYzNyA4LjQgNjguNzM3IDkuMSA2OC42MzcgMTAuMSBaIj48L3BhdGg+PHBhdGggZmlsbD0iIzAwOWNkZSIgZD0iTSA5MC45MzcgMTAgTCA4Ny4yMzcgMTAgQyA4Ni45MzcgMTAgODYuNjM3IDEwLjIgODYuNjM3IDEwLjUgTCA4Ni40MzcgMTEuNSBMIDg2LjEzNyAxMS4xIEMgODUuMzM3IDkuOSA4My41MzcgOS41IDgxLjczNyA5LjUgQyA3Ny42MzcgOS41IDc0LjEzNyAxMi42IDczLjQzNyAxNyBDIDczLjAzNyAxOS4yIDczLjUzNyAyMS4zIDc0LjgzNyAyMi43IEMgNzUuOTM3IDI0IDc3LjYzNyAyNC42IDc5LjUzNyAyNC42IEMgODIuODM3IDI0LjYgODQuNzM3IDIyLjUgODQuNzM3IDIyLjUgTCA4NC41MzcgMjMuNSBDIDg0LjQzNyAyMy45IDg0LjczNyAyNC4zIDg1LjEzNyAyNC4zIEwgODguNTM3IDI0LjMgQyA4OS4wMzcgMjQuMyA4OS41MzcgMjMuOSA4OS42MzcgMjMuNCBMIDkxLjYzNyAxMC42IEMgOTEuNjM3IDEwLjQgOTEuMzM3IDEwIDkwLjkzNyAxMCBaIE0gODUuNzM3IDE3LjIgQyA4NS4zMzcgMTkuMyA4My43MzcgMjAuOCA4MS41MzcgMjAuOCBDIDgwLjQzNyAyMC44IDc5LjYzNyAyMC41IDc5LjAzNyAxOS44IEMgNzguNDM3IDE5LjEgNzguMjM3IDE4LjIgNzguNDM3IDE3LjIgQyA3OC43MzcgMTUuMSA4MC41MzcgMTMuNiA4Mi42MzcgMTMuNiBDIDgzLjczNyAxMy42IDg0LjUzNyAxNCA4NS4xMzcgMTQuNiBDIDg1LjczNyAxNS4zIDg1LjkzNyAxNi4yIDg1LjczNyAxNy4yIFoiPjwvcGF0aD48cGF0aCBmaWxsPSIjMDA5Y2RlIiBkPSJNIDk1LjMzNyAzLjMgTCA5Mi4xMzcgMjMuNiBDIDkyLjAzNyAyNCA5Mi4zMzcgMjQuMyA5Mi43MzcgMjQuMyBMIDk1LjkzNyAyNC4zIEMgOTYuNDM3IDI0LjMgOTYuOTM3IDIzLjkgOTcuMDM3IDIzLjQgTCAxMDAuMjM3IDMuNSBDIDEwMC4zMzcgMy4xIDEwMC4wMzcgMi44IDk5LjYzNyAyLjggTCA5Ni4wMzcgMi44IEMgOTUuNjM3IDIuOCA5NS40MzcgMyA5NS4zMzcgMy4zIFoiPjwvcGF0aD48L3N2Zz4" className="h-6 w-auto" /></Button>
                            <Button
                                aria-label="Checkout with Google Pay"
                                className="
                                    w-full
                                    h-12
                                    bg-foreground
                                    hover:bg-foreground/90
                                    rounded-lg
                                    flex
                                    items-center
                                    justify-center
                                    "
                            >
                                <img
                                    src="/google-icon.svg"
                                    alt="Google Pay"
                                    className="h-5 w-auto object-contain block opacity-100"
                                />
                                <span>Pay</span>
                            </Button>

                            <Button
                                aria-label="Checkout with Sezzle"
                                className="
                                    w-full
                                    h-12
                                    bg-[#3E2A5E]
                                    hover:bg-[#35234F]
                                    rounded-lg
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    text-white
                                    font-medium
                                "
                            >
                                <span>Checkout with</span>

                                <img
                                    className="sezzle-button-logo-img h-5 w-auto object-contain block opacity-100"
                                    alt="Sezzle"
                                    src="https://media.sezzle.com/branding/2.0/Sezzle_Logo_FullColor_WhiteWM.svg"
                                />
                            </Button>


                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
