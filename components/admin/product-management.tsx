"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2, Search } from "lucide-react"
import { ProductForm } from "./product-form"
import { Product } from "@/types"
import apiClient from "@/lib/api-client"

export function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [saleItems, setSaleItems] = useState<Product[]>([])
  const [category, setCategory] = useState<string>("all")
  const [loading, setLoading] = useState(false)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  /* ----------------------------------
     Fetch products
  ---------------------------------- */
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const response = await apiClient.get("/products", {
          params: {
            ...(category !== "all" && category !== "sale" && { category }),
            ...(searchTerm && { search: searchTerm }),
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
  }, [category, searchTerm])

  useEffect(() => {
    const fetchSaleProducts = async () => {
      try {
        const response = await apiClient.get("/products/sale-items")
        setSaleItems(response.data)
      } catch (error) {
        console.error("Error fetching sale products:", error)
      }
    }

    fetchSaleProducts()
  }, [])

  /* ----------------------------------
     Filtering
  ---------------------------------- */
  const normalizedSearch = searchTerm.trim().toLowerCase()

  const baseProducts =
    category === "sale"
      ? saleItems
      : category === "all"
        ? products
        : products.filter((p) => p.category === category)

  const filteredProducts = baseProducts.filter((product) => {
    if (!normalizedSearch) return true

    return (
      product.name?.toLowerCase().includes(normalizedSearch) ||
      product.description?.toLowerCase().includes(normalizedSearch)
    )
  })

  console.log(products.map(p => p.sku))


  /* ----------------------------------
     Delete product (instant update)
  ---------------------------------- */
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      await apiClient.delete(`/products/${productId}`)

      // Instantly update UI
      setProducts((prev) => prev.filter((p) => p._id !== productId))
      setSaleItems((prev) => prev.filter((p) => p._id !== productId))
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  /* ----------------------------------
     Add / Edit success handler
  ---------------------------------- */
  const handleProductSaved = (updated?: Product) => {
    if (!updated) return

    setProducts((prev) => {
      const exists = prev.some((p) => p._id === updated._id)
      return exists
        ? prev.map((p) => (p._id === updated._id ? updated : p))
        : [updated, ...prev]
    })

    if (updated.isSale) {
      setSaleItems((prev) => {
        const exists = prev.some((p) => p._id === updated._id)
        return exists
          ? prev.map((p) => (p._id === updated._id ? updated : p))
          : [updated, ...prev]
      })
    } else {
      setSaleItems((prev) => prev.filter((p) => p._id !== updated._id))
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">
            Manage your clothing inventory and product details
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditingProduct(null)
            setIsFormOpen(true)
          }}
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-85">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="tops">Tops</SelectItem>
            <SelectItem value="bottoms">Bottoms</SelectItem>
            <SelectItem value="dresses">Dresses</SelectItem>
            <SelectItem value="sets">Sets</SelectItem>
            <SelectItem value="accessories">Accessories</SelectItem>
            <SelectItem value="self-care">Self Care</SelectItem>
            <SelectItem value="sale">Sale</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading products…</p>
        ) : (
          filteredProducts.map((product) => (
            <Card
              key={product._id}
              className="group flex flex-col h-full bg-card rounded-xl overflow-hidden hover:shadow-lg transitions transition-shadow">
              <div className="relative w-full aspect-[2/3] bg-muted overflow-hidden rounded-lg">
                <img
                  src={product.images?.[0]?.url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
              </div>
              <CardHeader className="p-3">
                <CardTitle className="text-sm">{product.name}</CardTitle>
                <div className="flex flex-wrap gap-1 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {product.colors?.length || 0} colors
                  </Badge>
                  {product.isSale && <Badge className="text-xs">Sale</Badge>}
                  <p className="ml-1 text-sm text-muted-foreground">
                  <strong>SKU#:</strong>{" "}
                  {product.sku}
                </p>
                </div>
              </CardHeader>

              <CardContent className="p-3 flex flex-col justify-between flex-1">
                <p className="text-sm text-muted-foreground">
                  <strong>Price:</strong> ${product.price}
                  {product.salePrice && (
                    <span className="text-destructive ml-2">
                      Sale: ${product.salePrice}
                    </span>
                  )}
                </p>

                <p className="text-sm text-muted-foreground">
                  <strong>Stock:</strong>{" "}
                  {product.sizes?.reduce((sum, s) => sum + (s.stock || 0), 0)}
                </p>

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => {
                      setEditingProduct(product)
                      setIsFormOpen(true)
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive"
                    onClick={() => handleDeleteProduct(product._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Empty State */}
      {!loading && filteredProducts.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-muted-foreground">No products found</p>
        </Card>
      )}

      {/* Product Form Modal */}
      {isFormOpen && (
        <ProductForm
          product={editingProduct || undefined}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleProductSaved}
        />
      )}
    </div>
  )
}
