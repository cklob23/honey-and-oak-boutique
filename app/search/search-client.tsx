"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import apiClient from "@/lib/api-client"
import { Search } from "lucide-react"
import Link from "next/link"

export default function SearchClient() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const keyword = searchParams.get("query")
  const category = searchParams.get("category")
  const searchLabel = keyword || category || ""

  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)

      let endpoint = "/search/products?"

      if (category) {
        endpoint += `category=${encodeURIComponent(category)}`
      } else if (keyword) {
        endpoint += `q=${encodeURIComponent(keyword)}`
      }

      const res = await apiClient.get(endpoint)
      setProducts(res.data)
      setLoading(false)
    }

    if (keyword || category) fetchProducts()
  }, [keyword, category])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const input = form.querySelector("input") as HTMLInputElement
    if (!input.value.trim()) return

    router.push(`/search?query=${encodeURIComponent(input.value.trim())}`)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="absolute top-0 left-15 right-0 p-4 border-t bg-sidebar border-sidebar-border">
        <Link href="/shop" className="text-sm hover:underline">
          Back to Store
        </Link>
      </div>

      <h1 className="text-3xl font-semibold mb-6 mt-5">
        Search results for <span className="text-accent">"{searchLabel}"</span>
      </h1>

      <form onSubmit={handleSearchSubmit} className="flex mb-10 items-center">
        <input
          name="query"
          defaultValue={searchLabel}
          placeholder="Search"
          className="px-4 py-2 w-64 border rounded-l-full outline-none"
        />
        <button className="px-4 py-3 border rounded-r-full hover:bg-gray-200">
          <Search className="w-4 h-4 text-muted-foreground" />
        </button>
      </form>

      {loading && <p className="text-gray-500">Searching…</p>}

      {!loading && products.length === 0 && (
        <p className="text-muted-foreground">
          No products found for "{searchLabel}".
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <div
            key={product._id}
            className="group cursor-pointer"
            onClick={() => router.push(`/product/${product._id}`)}
          >
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.images?.[0]?.url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
            </div>

            <p className="font-medium mt-2">{product.name}</p>
            <p className="text-sm text-gray-500">
              ${product.price.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
