"use client"

import {
    PaymentElement,
    ExpressCheckoutElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js"
import { useState } from "react"

export default function CheckoutForm() {
    const stripe = useStripe()
    const elements = useElements()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const confirm = async () => {
        if (!stripe || !elements) return

        setLoading(true)
        setError(null)

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: "http://localhost:3000/complete",
            },
        })

        if (error) {
            setError(error.message || "Payment failed")
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* STRIPE EXPRESS CHECKOUT */}
            {stripe && elements && (
                <div>
                    <h2 className="text-sm font-semibold mb-4">
                        Express checkout
                    </h2>

                    <ExpressCheckoutElement
                        options={{
                            layout: {
                                maxColumns: 4,
                                maxRows: 1,
                                overflow: "auto",
                            },
                        }}
                        onConfirm={confirm}
                        onLoadError={() => {
                            console.warn("Express Checkout not available")
                        }}
                    />
                </div>
            )}

            {/* OR DIVIDER */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or pay with card
                    </span>
                </div>
            </div>

            {/* CARD + METHODS */}
            <PaymentElement options={{ layout: "tabs" }} />

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}

            <button
                onClick={confirm}
                disabled={loading}
                className="
          w-full
          h-14
          bg-[#C8A882]
          text-white
          font-semibold
          rounded-lg
          hover:bg-[#B89872]
          disabled:opacity-50
        "
            >
                {loading ? "Processing…" : "Pay now"}
            </button>
        </div>
    )
}
