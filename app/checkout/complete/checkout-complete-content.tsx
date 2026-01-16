"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Package, Mail } from "lucide-react"
import apiClient from "@/lib/api-client"

export default function CheckoutCompleteContent() {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get("paymentId")

  const [payment, setPayment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (paymentId) {
      apiClient
        .get(`/checkout/square/payment/${paymentId}`)
        .then((res) => {
          setPayment(res.data)
        })
        .catch((err) => {
          console.error("Error fetching payment:", err)
        })
        .finally(() => {
          setLoading(false)
          // Clear cart after successful payment
          localStorage.removeItem("cartId")
        })
    } else {
      setLoading(false)
    }
  }, [paymentId])

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="bg-background min-h-screen">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="mb-8">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
        </div>

        <h1 className="text-3xl font-bold mb-4">Thank you for your order!</h1>

        <p className="text-muted-foreground mb-8">
          Your payment has been processed successfully. We&apos;ll send you an email confirmation shortly.
        </p>

        {payment && (
          <div className="bg-muted/30 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-semibold mb-4">Order Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment ID</span>
                <span className="font-mono">{payment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="text-green-600 font-medium">{payment.status}</span>
              </div>
              {payment.amountMoney && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">
                    ${(Number.parseInt(payment.amountMoney.amount) / 100).toFixed(2)} {payment.amountMoney.currency}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-muted/30 rounded-lg p-4 text-left">
            <Package className="w-6 h-6 mb-2 text-primary" />
            <h3 className="font-medium mb-1">Shipping Updates</h3>
            <p className="text-sm text-muted-foreground">
              You&apos;ll receive shipping updates via email once your order ships.
            </p>
          </div>
          <div className="bg-muted/30 rounded-lg p-4 text-left">
            <Mail className="w-6 h-6 mb-2 text-primary" />
            <h3 className="font-medium mb-1">Order Confirmation</h3>
            <p className="text-sm text-muted-foreground">Check your email for your order confirmation and receipt.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>

      <Footer />
    </main>
  )
}
