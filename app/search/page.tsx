import { Suspense } from "react"
import SearchClient from "./search-client"

export const dynamic = "force-dynamic"

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-10">Loading search…</div>}>
      <SearchClient />
    </Suspense>
  )
}
