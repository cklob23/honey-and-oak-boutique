"use client"

import { ExpressCheckoutElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { useState } from "react"

export default function ExpressCheckout() {
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
        return_url: `${window.location.origin}/complete`,
      },
    })

    if (error) {
      setError(error.message ?? "Payment failed")
    }

    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <ExpressCheckoutElement
        onConfirm={handleConfirm}
        options={{
          layout: {
            maxColumns: 4,
            maxRows: 1,
            overflow: "auto",
          },
        }}
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
