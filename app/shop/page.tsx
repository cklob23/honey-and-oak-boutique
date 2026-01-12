import { Suspense } from "react"
import ShopClient from "./shop-client"

export const dynamic = "force-dynamic"

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-10">Loading shop…</div>}>
      <ShopClient />
    </Suspense>
  )
}
