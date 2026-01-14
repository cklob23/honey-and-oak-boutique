"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import apiClient from "@/lib/api-client"
import { Product } from "@/types/product"

export function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const customerId = typeof window !== "undefined" ? localStorage.getItem("customerId") : null

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const response = await apiClient.get("/products/new-arrivals")
        setProducts(response.data)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true)
      try {
        const response = await apiClient.get(`customers/${customerId}/favorites`)
        setFavorites(response.data)
        console.log(response.data)
      } catch (error) {
        console.error("Error fetching favorites:", error)
      } finally {
        setLoading(false)
      }
    }
    if (customerId) {
      fetchFavorites()
    }
  }, [customerId])


  const toggleFavorite = async (productId: string) => {
    const isAdding = !favorites.includes(productId)
    try {
      if (isAdding) {
        await apiClient.post(`/customers/${customerId}/favorites`, { productId })
        const response = await apiClient.get(`customers/${customerId}/favorites`)
        setFavorites(response.data)
      } else {
        await apiClient.delete(`/customers/${customerId}/favorites/${productId}`)
        setFavorites(prev => prev.filter(item => item !== productId))
      }
    } catch (err) {
      console.error("Favorite sync failed:", err)
    }
  }

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3 text-balance">New Arrivals</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Fresh styles just in. Discover our latest collection of curated pieces.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="group bg-card rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Image Container */}
              <div className="relative bg-muted overflow-hidden aspect-[3/4]">
                <img
                  src={product.images?.[0]?.url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Sale Badge */}
                {product.isSale && (
                  <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    Sale
                  </div>
                )}

                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    toggleFavorite(product._id)
                  }}
                  className="absolute top-4 left-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                >
                  <Heart
                    className="w-5 h-5"
                    fill={favorites.includes(product._id) ? "currentColor" : "none"}
                    color={favorites.includes(product._id) ? "#dc2626" : "#666"}
                  />
                </button>

                {/* Quick Add */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    Quick Add
                  </Button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{product.category}</p>
                <h3 className="font-semibold text-foreground mb-2 text-balance">{product.name}</h3>
                <div className="flex items-center gap-2">
                  {product.isSale && product.salePrice ? (
                    <>
                      <span className="text-lg font-bold text-foreground">${product.salePrice}</span>
                      <span className="text-sm text-muted-foreground line-through">${product.price}</span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-foreground">${product.price}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/shop">
            <Button variant="outline" size="lg">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
