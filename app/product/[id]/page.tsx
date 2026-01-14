"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingBag, Truck, RotateCcw } from "lucide-react"
import Link from "next/link"
import apiClient from "@/lib/api-client"
import { Product } from "@/types/product"
import { useCart } from "@/context/cart-context"
import { CartSidebar } from "@/components/cart-sidebar"
import { toast } from "sonner"


export default function ProductPage() {
  const params = useParams()
  const id = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { refreshCart } = useCart()

  const customerId =
    typeof window !== "undefined" ? localStorage.getItem("customerId") : null

  useEffect(() => {
    if (!id) return

    const fetchProduct = async () => {
      setLoading(true)
      try {
        const response = await apiClient.get(`/products/${id}`)
        setProduct(response.data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching product:", error)
      }
    }

    fetchProduct()
  }, [id])

  useEffect(() => {
    if (!customerId || !id) return

    const fetchFavorites = async () => {
      try {
        const res = await apiClient.get(`/customers/${customerId}/favorites`)
        setFavorites(res.data || [])
        setIsFavorite(res.data.includes(id))
      } catch (err) {
        console.error("Error loading favorites:", err)
      }
    }

    fetchFavorites()
  }, [customerId, id])

  const toggleFavorite = async (productId: string) => {
    if (!customerId) return

    const adding = !isFavorite
    setIsFavorite(adding)

    try {
      if (adding) {
        await apiClient.post(`/customers/${customerId}/favorites`, { productId })
        setFavorites(prev => [...prev, productId])
      } else {
        await apiClient.delete(`/customers/${customerId}/favorites/${productId}`)
        setFavorites(prev => prev.filter(f => f !== productId))
      }
    } catch (err) {
      console.error("Favorite update failed:", err)
      setIsFavorite(!adding) // rollback UI
    }
  }

  const handleAddToCart = async (productId: string, quantity: number = 1, size?: string, color?: string) => {
    setIsCartOpen(true)
    try {
      let cartId = typeof window !== "undefined" ? localStorage.getItem("cartId") : null

      if (!cartId) {
        const sessionId = crypto.randomUUID()

        const res = await apiClient.post("/cart", { sessionId })
        cartId = res.data._id

        localStorage.setItem("cartId", cartId!)
      }

      const reponse = await apiClient.post(`/cart/${cartId}/items`, {
        productId,
        quantity,
        size,
        color
      })
      //toast.success("Added item to cart successfully!")
      refreshCart()
      return reponse.data

    } catch (error: any) {
      console.error("Add to cart failed:", error)
      toast.error("Failed to add item to cart.")
      if (error.response?.status === 404) {
        console.log("Cart not found - creating a new one")

        const sessionId = crypto.randomUUID()
        const newCart = await apiClient.post("/cart", { sessionId })

        const newCartId = newCart.data._id
        localStorage.setItem("cartId", newCartId)

        const retry = await apiClient.post(`/cart/${newCartId}/items`, {
          productId,
          quantity,
          size,
          color
        })
        // toast.success("Added item to cart successfully!")
        refreshCart()
        return retry.data
      }

      throw error
    }
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="p-12 text-center text-muted-foreground">Loading...</div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/shop" className="text-sm text-accent hover:text-accent/80">
            Back to Shop
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {loading && (
            <p className="text-muted-foreground text-sm">Loading product...</p>
          )}
          {/* Images */}
          <div className="space-y-4">
            <div className="bg-muted rounded-xl overflow-hidden aspect-[3/4]">
              <img
                src={product.images?.[0]?.url || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {product.images?.map((image, i) => (
                <button
                  key={i}
                  className="bg-muted rounded-lg overflow-hidden aspect-square hover:ring-2 ring-accent"
                >
                  <img
                    src={image.url}
                    className="w-full h-full object-cover"
                    alt={`${product.name} ${i + 1}`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">

            {/* Title / Rating */}
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-2">
                {product.category}
              </p>

              <h1 className="text-3xl md:text-4xl font-serif font-bold">
                {product.name}
              </h1>

              {/* Reviews */}
              <div className="flex items-center gap-2 mt-3 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>{i < Math.floor(product.rating) ? "★" : "☆"}</span>
                  ))}
                </div>

                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              <div className="text-3xl font-bold">${product.price}</div>

              <p className="text-muted-foreground mt-2">{product.description}</p>
            </div>

            {/* Material & Care */}
            <div className="bg-secondary rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Material</p>
                <p className="text-sm font-medium">{product.material}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase">Care Instructions</p>
                <p className="text-sm">{product.care}</p>
              </div>
            </div>

            {/* Color Selection */}
            {product.colors && (
              <div>
                <label className="text-sm font-semibold">Color</label>
                <div className="flex gap-3 mt-2">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border-2 rounded-lg ${selectedColor === color
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent"
                        }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold">Size</label>

                <button
                  onClick={() => setShowSizeChart(!showSizeChart)}
                  className="text-xs text-accent hover:underline"
                >
                  View Size Chart
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {product.category === "accessories" ? (<button
                  onClick={() => setSelectedSize("L")}
                  className={`py-2 border-2 rounded-lg ${selectedSize === "L"
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-accent"
                    }`}
                >
                  One Size
                </button>) : (product.sizes?.map(option => (
                  <button
                    key={option._id}
                    onClick={() => setSelectedSize(option.size)}
                    className={`py-2 border-2 rounded-lg ${selectedSize === option.size
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-accent"
                      }`}
                  >
                    {option.size}
                  </button>)
                ))}
              </div>

              {/* Size Chart Modal */}
              {showSizeChart && product.sizeChart && (
                <div className="mt-4 bg-muted p-4 rounded-lg">
                  <table className="text-sm w-full">
                    <thead>
                      <tr>
                        <th className="text-left py-2">Size</th>
                        <th className="text-left py-2">Bust</th>
                        <th className="text-left py-2">Length</th>
                      </tr>
                    </thead>

                    <tbody>
                      {Object.entries(product.sizeChart.measurements).map(
                        ([size, measurements]) => (
                          <tr key={size} className="border-t border-border">
                            <td className="py-2 font-medium">{size}</td>
                            <td className="py-2">{measurements.bust}</td>
                            <td className="py-2">{measurements.length}</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>

                  {product.sizeChart.image && (
                    <img
                      src={product.sizeChart.image}
                      alt="Size Chart"
                      className="mt-4 w-full rounded-lg"
                    />
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold">Quantity</label>

              <div className="flex items-center gap-4 mt-2">
                {/* Quantity Controls */}
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted"
                >
                  −
                </button>

                <span className="text-lg font-semibold w-8 text-center">
                  {quantity}
                </span>

                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted"
                >
                  +
                </button>

                {/* Action Buttons */}
                <div className="flex flex-1 gap-3">
                  <Button
                    onClick={() =>
                      handleAddToCart(
                        product._id,
                        quantity,
                        selectedSize,
                        selectedColor
                      )
                    }
                    className="h-12 flex-1 gap-2"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" className="h-12 flex-1 bg-white text-white hover:bg-gray-100 font-semibold transition-colors">
                    <img
                      src="/apple-pay.png"
                      alt="Apple Pay"
                      className="h-6 w-auto object-contain"
                    />
                  </Button>
                </div>

                {/* Favorite */}
                {customerId && (
                  <button
                    onClick={() => toggleFavorite(product._id)}
                    className="w-12 h-12 flex items-center justify-center border-2 border-border rounded-lg hover:border-accent"
                  >
                    <Heart
                      className="w-5 h-5"
                      fill={isFavorite ? "currentColor" : "none"}
                      color={isFavorite ? "#dc2626" : "currentColor"}
                    />
                  </button>
                )}
              </div>
            </div>

            {/* Shipping & Returns */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <p className="font-semibold">Free Shipping</p>
                  <p className="text-muted-foreground">On orders over $100</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <RotateCcw className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <p className="font-semibold">30-Day Returns</p>
                  <p className="text-muted-foreground">
                    Easy returns on all items
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <Footer />
    </main>
  )
}
