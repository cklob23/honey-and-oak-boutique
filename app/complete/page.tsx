import { Suspense } from "react"
import { Elements } from "@stripe/react-stripe-js"
import { stripePromise } from "@/lib/stripe"
import CompleteClient from "./complete-client"

export const dynamic = "force-dynamic"

export default function CompletePage() {
  return (
    <Suspense fallback={<div className="p-10">Loading payment…</div>}>
      <Elements stripe={stripePromise}>
        <CompleteClient />
      </Elements>
    </Suspense>
  )
}
