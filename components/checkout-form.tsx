"use client"

import {
    useStripe,
    useElements,
    PaymentElement,
    AddressElement,
} from "@stripe/react-stripe-js"
import { useState } from "react"

type Props = {
    returnUrl: string
    disabled?: boolean
}

export default function CheckoutForm({ returnUrl, disabled }: Props) {
    const stripe = useStripe()
    const elements = useElements()
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!stripe || !elements) return

        setSubmitting(true)
        setError(null)

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: returnUrl,
            },
        })

        if (error) {
            setError(error.message || "Payment failed")
            setSubmitting(false)
        }
    }

    return (
        <form
            id="checkout-form"
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            {/* SHIPPING / BILLING (Stripe-managed) */}
            <div>
                <AddressElement
                    options={{
                        mode: "shipping",
                        allowedCountries: ["US"],
                    }}
                />
            </div>

            {/* PAYMENT */}
            <div>
                <PaymentElement options={{
                    layout: {
                        type: 'accordion',
                        defaultCollapsed: false,
                        radios: true,
                        spacedAccordionItems: true,
                    },
                    business: { name: "Honey & Oak Boutique" },
                    
                }} />
            </div>

            {/* ERROR MESSAGE ONLY (NO BUTTON HERE) */}
            {error && (
                <p className="text-sm text-destructive">
                    {error}
                </p>
            )}
        </form>
    )
}
