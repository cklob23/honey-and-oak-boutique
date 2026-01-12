"use client"

import { useCallback } from "react"

export function useNotifications() {
  const sendPurchaseAlert = useCallback(async (orderData: any) => {
    try {
      await fetch("/api/emails/order-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData._id }),
      })
    } catch (error) {
      console.error("Error sending purchase alert:", error)
    }
  }, [])

  const sendAbandonedCartEmail = useCallback(async (cartData: any, customerEmail: any) => {
    try {
      await fetch("/api/emails/abandoned-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail,
          cartItems: cartData.items,
          cartLink: `${typeof window !== "undefined" ? window.location.origin : ""}/cart`,
        }),
      })
    } catch (error) {
      console.error("Error sending abandoned cart email:", error)
    }
  }, [])

  const sendOrderStatusUpdate = useCallback(async (orderId: any, status: any) => {
    try {
      await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }, [])

  return {
    sendPurchaseAlert,
    sendAbandonedCartEmail,
    sendOrderStatusUpdate,
  }
}
