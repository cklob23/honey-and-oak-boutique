"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, ShoppingBag, Filter, ChevronDown } from "lucide-react"
import Link from "next/link"
import apiClient from "@/lib/api-client"
import { Product } from "@/types/product"
import { useCart } from "@/context/cart-context"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"


export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [saleItems, setSaleItems] = useState<Product[]>([])
  const [category, setCategory] = useState<string>("all")
  const [clothingOpen, setClothingOpen] = useState(true)
  const [accessoriesOpen, setAccessoriesOpen] = useState(false)
  const [sortBy, setSortBy] = useState<string>("newest")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [favorites, setFavorites] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(false)
  const customerId = typeof window !== "undefined" ? localStorage.getItem("customerId") : null
  const { refreshCart } = useCart()
  const searchParams = useSearchParams()
  const urlCategory = searchParams.get("category") || "all"
  const [priceFilter, setPriceFilter] = useState<string>("none");


  // Sync URL param → state
  useEffect(() => {
    setCategory(urlCategory)
  }, [urlCategory])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [category])


  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const response = await apiClient.get("/products", {
          params: {
            ...(category !== "all" && { category }),
            ...(searchTerm && { search: searchTerm }),
            sort: sortBy,
          },

        })
        setProducts(response.data)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [category, sortBy, searchTerm])

  useEffect(() => {
    const fetchSaleProducts = async () => {
      setLoading(true)
      try {
        const response = await apiClient.get("/products/sale-items")
        setSaleItems(response.data)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSaleProducts()
  }, [])

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true)
      try {
        const response = await apiClient.get(`customers/${customerId}/favorites`)
        setFavorites(response.data)
      } catch (error) {
        console.error("Error fetching favorites:", error)
      } finally {
        setLoading(false)
      }
    }
    if (customerId) {
      fetchFavorites()
    }
  }, [])

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

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!customerId) return

    // Fetch customer + product
    const customerRes = await apiClient.get(`/customers/${customerId}`)
    const customer = customerRes.data

    const productRes = await apiClient.get(`/products/${productId}`)
    const product = productRes.data

    // -------------------------------
    // 1. Determine product category key
    // -------------------------------
    const category = product.category?.toLowerCase()
    const validCategories = ["tops", "bottoms", "dresses", "sets", "accessories", "self-care"] as const

    // If category is not one of our size-bucket categories → no size selection
    const categoryKey = validCategories.includes(category)
      ? (category as typeof validCategories[number])
      : null

    // -------------------------------
    // 2. Select SIZE based on preferences
    // -------------------------------
    let selectedSize: any | undefined = undefined

    if (categoryKey) {
      const preferredSizes: string[] =
        customer.preferences?.sizes?.[categoryKey] ?? []

      const availableSizes: string[] =
        product.sizes?.map((s: any) => s.size) ?? [];

      // Find the first preferred size that exists in this product
      selectedSize =
        preferredSizes.find((ps) => availableSizes.includes(ps)) ||
        availableSizes[0] // default to first available if no match
    }

    // -------------------------------
    // 3. Select COLOR based on preferences
    // -------------------------------
    let selectedColor: string | undefined = undefined

    const preferredColors: string[] = customer.preferences?.colors ?? []
    const availableColors: string[] = product.colors ?? []

    selectedColor =
      preferredColors.find((c) => availableColors.includes(c)) ||
      availableColors[0] // fallback

    // -------------------------------
    // 4. Ensure there is a cart
    // -------------------------------
    let cartId =
      typeof window !== "undefined" ? localStorage.getItem("cartId") : null

    try {
      if (!cartId) {
        const sessionId = crypto.randomUUID()
        const res = await apiClient.post("/cart", { sessionId })
        cartId = res.data._id
        localStorage.setItem("cartId", cartId!)
      }
      console.log()
      // -------------------------------
      // 5. Add to cart with smart selections
      // -------------------------------
      const response = await apiClient.post(`/cart/${cartId}/items`, {
        productId,
        quantity,
        size: selectedSize,
        color: selectedColor,
      })
      //toast.success("Added item to cart successfully!")
      refreshCart()
      return response.data

    } catch (error: any) {
      console.error("Add to cart failed:", error)
      toast.error("Failed to add item to cart.")
      if (error.response?.status === 404) {
        // Retry with new cart
        const sessionId = crypto.randomUUID();
        const newCart = await apiClient.post("/cart", { sessionId })

        const newCartId = newCart.data._id;
        localStorage.setItem("cartId", newCartId);

        const retry = await apiClient.post(`/cart/${newCartId}/items`, {
          productId,
          quantity,
          size: selectedSize,
          color: selectedColor,
        })
        //toast.success("Added item to cart successfully!")
        refreshCart()
        return retry.data;
      }

      throw error;
    }
  }

  const filteredProducts = category === "sale" ? saleItems : products.filter((product) => {
    const productCategory = product.category?.toLowerCase() || ""
    const isSaleProduct = product.isSale === true

    let matchesCategory = false

    if (category === "all") {
      matchesCategory = true
    }
    else if (category === "sale") {
      matchesCategory = isSaleProduct
    }
    else {
      matchesCategory = productCategory === category.toLowerCase()
    }

    const matchesSearch =
      searchTerm.trim() === "" ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase())

    let matchesPrice = true

    if (priceFilter === "under-50") {
      matchesPrice = (product.salePrice ?? product.price) < 50
    }

    if (priceFilter === "50-100") {
      const price = product.salePrice ?? product.price
      matchesPrice = price >= 50 && price <= 100
    }

    if (priceFilter === "over-100") {
      matchesPrice = (product.salePrice ?? product.price) > 100
    }

    // --------------------------
    // FINAL RETURN
    // --------------------------
    return matchesCategory && matchesSearch && matchesPrice
  });


  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Shop Our Collection</h1>
          <p className="text-muted-foreground">Discover our curated selection of timeless pieces</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-48 space-y-6`}>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Search</h3>
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-3">Category</h3>

              <div className="space-y-2">

                {/* ALL */}
                <button
                  onClick={() => setCategory("all")}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${category === "all"
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                    }`}
                >
                  All
                </button>

                {/* CLOTHING ACCORDION */}
                <button
                  onClick={() => setClothingOpen(!clothingOpen)}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-muted transition"
                >
                  <span>Clothing</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${clothingOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* SUBCATEGORIES */}
                {clothingOpen && (
                  <div className="ml-4 space-y-2">

                    {[
                      { key: "tops", label: "Tops" },
                      { key: "bottoms", label: "Bottoms" },
                      { key: "dresses", label: "Dresses" },
                      { key: "sets", label: "Sets" },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setCategory(key)}
                        className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${category === key
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted"
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
                {/* CLOTHING ACCORDION */}
                <button
                  onClick={() => setAccessoriesOpen(!accessoriesOpen)}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-muted transition"
                >
                  <span>Accessories</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${accessoriesOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* SUBCATEGORIES */}
                {accessoriesOpen && (
                  <div className="ml-4 space-y-2">

                    {[
                      { key: "hair-accessories", label: "Hair Accessories" },
                      { key: "jewelry", label: "Jewelry" },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setCategory(key)}
                        className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${category === key
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted"
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
                {/* OTHER MAIN CATEGORIES */}
                {[
                  { key: "self-care", label: "Self Care" },
                  { key: "sale", label: "Sale" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setCategory(key)}
                    className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${category === key
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted"
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-3">Price</h3>

              <div className="space-y-2 text-sm">

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    className="accent-foreground"
                    type="radio"
                    name="priceFilter"
                    checked={priceFilter === "under-50"}
                    onChange={() => setPriceFilter("under-50")}
                  />
                  Under $50
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    className="accent-foreground"
                    type="radio"
                    name="priceFilter"
                    checked={priceFilter === "50-100"}
                    onChange={() => setPriceFilter("50-100")}
                  />
                  $50 - $100
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    className="accent-foreground"
                    type="radio"
                    name="priceFilter"
                    checked={priceFilter === "over-100"}
                    onChange={() => setPriceFilter("over-100")}
                  />
                  Over $100
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    className="accent-foreground"
                    type="radio"
                    name="priceFilter"
                    checked={priceFilter === "none"}
                    onChange={() => setPriceFilter("none")}
                  />
                  No Filter
                </label>
              </div>
            </div>

          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-8">
              <p className="text-muted-foreground">Showing {filteredProducts.length} products</p>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-42">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading && (
                <p className="text-muted-foreground text-sm">Loading products...</p>
              )}
              {filteredProducts.map((product) => (
                <Link key={product._id} href={`/product/${product._id}`}>
                  <div className="group bg-card rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                    {/* Image Container */}
                    <div className="relative bg-muted overflow-hidden aspect-[3/4]">
                      <img
                        src={product.images?.[0]?.url || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {product.isSale && (
                        <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold">
                          Sale
                        </div>
                      )}
                      {customerId && (
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            toggleFavorite(product._id)
                            console.log(product._id)
                          }}
                          className="absolute top-4 left-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                        >
                          <Heart
                            className="w-5 h-5"
                            fill={favorites.includes(product._id) ? "currentColor" : "none"}
                            color={favorites.includes(product._id) ? "#dc2626" : "#666"}
                          />
                        </button>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <Button
                          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
                          onClick={(e) => {
                            e.preventDefault()
                            addToCart(product._id)
                          }}
                        >
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
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
