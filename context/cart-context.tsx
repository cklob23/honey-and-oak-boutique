"use client"

import { createContext, useContext, useEffect, useState } from "react"
import apiClient from "@/lib/api-client"

interface CartItem {
  productId: string
  quantity: number
  size: string
  color: string
}

interface CartContextType {
  cartItems: CartItem[]
  cartCount: number
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartId, setCartId] = useState<string | null>(null)

  useEffect(() => {
    const storedId = localStorage.getItem("cartId")
    if (storedId) {
      setCartId(storedId)
    }
  }, [])

  // Fetch cart whenever cartId changes
  const refreshCart = async () => {
    if (!cartId) return
    try {
      const res = await apiClient.get(`/cart/${cartId}`)
      setCartItems(res.data.items || [])
    } catch (err: any) {
      if (err.response?.status === 404) {
        setCartItems([])
        return
      }
      console.error("Error refreshing cart:", err)
    }
  }

  useEffect(() => {
    if (cartId) refreshCart()
  }, [cartId])

  // Compute the total number of items
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ cartItems, cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside CartProvider")
  return ctx
}
