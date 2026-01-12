"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2, Search } from "lucide-react"
import { ProductForm } from "./product-form"
import { Product } from "@/types"
import apiClient from "@/lib/api-client"


export function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [saleItems, setSaleItems] = useState<Product[]>([])
  const [category, setCategory] = useState<string>("all")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const response = await apiClient.get("/products", {
          params: {
            ...(category !== "all" && { category }),
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

  const filteredProducts = category === "sale" ? saleItems : products.filter(
    (product: Product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteProduct = async (productId: any) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await apiClient.delete(`/products/${productId}`)
        // Revalidate products
      } catch (error) {
        console.error("Error deleting product:", error)
      }
    }
  }

  const handleProductAdded = async () => {
    const response = await apiClient.get("/products")
    setProducts(response.data)
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your clothing inventory and product details</p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          onClick={() => setIsAddingProduct(true)}
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Search */}
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
            <SelectValue placeholder="Category" />
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
          <p className="text-muted-foreground text-sm">Loading products...</p>)
          : (filteredProducts.map((product: Product) => (
            <Card key={product._id} className="group bg-card rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
              <div className="relative bg-muted overflow-hidden aspect-[2/3]">
                <img
                  src={product.images?.[0]?.url || "/placeholder.svg?height=300&width=300&query=clothing"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader className="p-3">
                <CardTitle className="text-sm font-semibold leading-tight">
                  {product.name}
                </CardTitle>
                <div className="flex flex-wrap gap-1 mt-1">
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    {product.category[0].toUpperCase()}
                    {product.category.substring(1)}
                  </Badge>

                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    {product.colors?.length || 0} colors
                  </Badge>

                  {product.isSale && (
                    <Badge className="text-xs px-2 py-0.5">Sale</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <strong>Price:</strong> ${product.price}
                    {product.salePrice && <span className="text-destructive ml-2">Sale: ${product.salePrice}</span>}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Stock:</strong> {product.sizes?.reduce((sum, s) => sum + (s.stock || 0), 0) || 0} items
                  </p>
                </div>
                <div className="flex gap-2 pt-2 mt-2 border-t">
                  <Button variant="outline" size="sm" className="flex-1 gap-1">
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2 text-destructive bg-transparent"
                    onClick={() => handleDeleteProduct(product._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          )))}
      </div>

      {isAddingProduct && <ProductForm onClose={() => setIsAddingProduct(false)} onSuccess={handleProductAdded} />}

      {filteredProducts.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-muted-foreground">No products found</p>
        </Card>
      )}
    </div>
  )
}
