"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import apiClient from "@/lib/api-client"
import type { Product, ProductCategory, ProductImage } from "@/types"

interface ProductFormProps {
  product?: Product
  onClose: () => void
  onSuccess: (updated?: Product) => void
}

interface SizeOption {
  size: string
  stock: number
  sku: string
}

interface FormData {
  name: string
  description: string
  category: ProductCategory
  price: string
  salePrice: string
  isSale: boolean
  isNewArrival: boolean
  material: string
  images: ProductImage[]
  colors: { name: string; hex: string }[]
  sizes: SizeOption[]
}

const SIZE_OPTIONS: Record<string, SizeOption[]> = {
  tops: [
    { size: "S", stock: 0, sku: "" },
    { size: "M", stock: 0, sku: "" },
    { size: "L", stock: 0, sku: "" },
    { size: "XL", stock: 0, sku: "" },
  ],
  dresses: [
    { size: "S", stock: 0, sku: "" },
    { size: "M", stock: 0, sku: "" },
    { size: "L", stock: 0, sku: "" },
    { size: "XL", stock: 0, sku: "" },
  ],
  sets: [
    { size: "S", stock: 0, sku: "" },
    { size: "M", stock: 0, sku: "" },
    { size: "L", stock: 0, sku: "" },
    { size: "XL", stock: 0, sku: "" },
  ],
  bottoms: [
    { size: "4", stock: 0, sku: "" },
    { size: "6", stock: 0, sku: "" },
    { size: "8", stock: 0, sku: "" },
    { size: "10", stock: 0, sku: "" },
    { size: "12", stock: 0, sku: "" },
    { size: "14", stock: 0, sku: "" },
  ],
  accessories: [{ size: "One Size", stock: 0, sku: "" }],
  "hair-accessories": [{ size: "One Size", stock: 0, sku: "" }],
  jewelry: [{ size: "One Size", stock: 0, sku: "" }],
  "self-care": [{ size: "One Size", stock: 0, sku: "" }],
}

const getSizesForCategory = (category: ProductCategory): SizeOption[] => {
  return SIZE_OPTIONS[category] || SIZE_OPTIONS.tops
}

const getCategoryDisplayName = (category: ProductCategory): string => {
  const displayNames: Record<ProductCategory, string> = {
    tops: "Tops",
    bottoms: "Bottoms",
    dresses: "Dresses",
    sets: "Sets",
    accessories: "Accessories",
    "hair-accessories": "Hair Accessories",
    jewelry: "Jewelry",
    "self-care": "Self Care",
  }
  return displayNames[category] || category
}

export function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const isEdit = Boolean(product)

  const [formData, setFormData] = useState<FormData>(() => {
    const initialCategory: ProductCategory = product?.category || "tops"
    return {
      name: product?.name || "",
      description: product?.description || "",
      category: initialCategory,
      price: product?.price?.toString() || "",
      salePrice: product?.salePrice?.toString() || "",
      isSale: product?.isSale || false,
      isNewArrival: product?.isNewArrival ?? true,
      material: product?.material || "",
      images: product?.images?.length ? product.images : [{ url: "", alt: "" }],
      colors: product?.colors?.map((c: string) => ({ name: c, hex: "#000000" })) || [{ name: "", hex: "#000000" }],
      sizes: product?.sizes?.map((s: any) => ({ ...s, sku: s.sku || "" })) || getSizesForCategory(initialCategory),
    }
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isEdit) {
      setFormData((prev) => ({
        ...prev,
        sizes: getSizesForCategory(prev.category),
      }))
    }
  }, [formData.category, isEdit])

  const updateField = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (newCategory: ProductCategory) => {
    if (!isEdit) {
      setFormData((prev) => ({
        ...prev,
        category: newCategory,
        sizes: getSizesForCategory(newCategory),
      }))
    } else {
      updateField("category", newCategory)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
        colors: formData.colors.map((c) => c.name).filter(Boolean),
        images: formData.images.filter((img) => img.url),
        sizes: formData.sizes.map((s) => ({
          size: s.size,
          stock: s.stock,
          sku: s.sku,
        })),
      }

      const res = isEdit
        ? await apiClient.put(`/products/${product?._id}`, payload)
        : await apiClient.post("/products", payload)

      if (!isEdit && res.data) {
        const newProduct = res.data
        const colors = payload.colors.length > 0 ? payload.colors : ["Default"]
      
        for (const sizeObj of payload.sizes) {
          for (const color of colors) {
            await apiClient.post("/admin/inventory", {
              productId: res.data.product._id,
              size: sizeObj.size,
              color: color,
              quantity: sizeObj.stock,
              sku: sizeObj.sku, // Pass SKU to inventory
              restockThreshold: 1,
            })
          }
        }
      }

      onSuccess(res.data.product)
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to save product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>{isEdit ? "Edit Product" : "Add Product"}</CardTitle>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="text-sm text-red-600 bg-red-50 border p-3 rounded">{error}</div>}
            {/* Name + Category */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Product name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />

              <Select value={formData.category} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue>{getCategoryDisplayName(formData.category)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tops">Tops</SelectItem>
                  <SelectItem value="bottoms">Bottoms</SelectItem>
                  <SelectItem value="dresses">Dresses</SelectItem>
                  <SelectItem value="sets">Sets</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                  <SelectItem value="hair-accessories">Hair Accessories</SelectItem>
                  <SelectItem value="jewelry">Jewelry</SelectItem>
                  <SelectItem value="self-care">Self Care</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <textarea
              className="w-full border rounded p-3"
              rows={3}
              placeholder="Product description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
            />

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                step="0.01"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => updateField("price", e.target.value)}
                required
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Sale Price (optional)"
                value={formData.salePrice}
                onChange={(e) => updateField("salePrice", e.target.value)}
              />
            </div>

            <Input
              placeholder="Material (e.g. Linen)"
              value={formData.material}
              onChange={(e) => updateField("material", e.target.value)}
            />

            {/* Images */}
            <div>
              <p className="font-medium mb-2">Images</p>
              {formData.images.map((img, i) => (
                <div key={i} className="grid grid-cols-2 gap-2 mb-2">
                  <Input
                    placeholder="Image URL"
                    value={img.url}
                    onChange={(e) => {
                      const images = [...formData.images]
                      images[i].url = e.target.value
                      updateField("images", images)
                    }}
                  />
                  <Input
                    placeholder="Alt text"
                    value={img.alt}
                    onChange={(e) => {
                      const images = [...formData.images]
                      images[i].alt = e.target.value
                      updateField("images", images)
                    }}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => updateField("images", [...formData.images, { url: "", alt: "" }])}
              >
                Add Image
              </Button>
            </div>

            {/* Colors */}
            <div>
              <p className="font-medium mb-2">Available Colors</p>

              <div className="space-y-2">
                {formData.colors.map((color, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      placeholder="Color name (e.g. Black)"
                      value={color.name}
                      onChange={(e) => {
                        const colors = [...formData.colors]
                        colors[index].name = e.target.value
                        updateField("colors", colors)
                      }}
                    />

                    <input
                      type="color"
                      value={color.hex}
                      onChange={(e) => {
                        const colors = [...formData.colors]
                        colors[index].hex = e.target.value
                        updateField("colors", colors)
                      }}
                      className="h-10 w-10 rounded border"
                    />

                    {formData.colors.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          updateField(
                            "colors",
                            formData.colors.filter((_, i) => i !== index),
                          )
                        }
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 bg-transparent"
                onClick={() => updateField("colors", [...formData.colors, { name: "", hex: "#000000" }])}
              >
                Add Color
              </Button>
            </div>

            <div>
              <p className="font-medium mb-2">
                Sizes, Stock & SKU
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  (
                  {formData.category === "hair-accessories" ||
                  formData.category === "jewelry" ||
                  formData.category === "self-care"
                    ? "One Size"
                    : formData.category === "bottoms"
                      ? "Pant Sizes"
                      : "Standard Sizes"}
                  )
                </span>
              </p>
              <div className="space-y-2">
                {/* Header row */}
                <div className="grid grid-cols-[80px_1fr_1fr] gap-2 text-sm font-medium text-muted-foreground px-1">
                  <span>Size</span>
                  <span>SKU</span>
                  <span>Stock</span>
                </div>
                {formData.sizes.map((s, i) => (
                  <div key={i} className="grid grid-cols-[80px_1fr_1fr] gap-2 items-center">
                    <div className="px-3 py-2 border rounded bg-muted text-sm font-medium">{s.size}</div>
                    <Input
                      placeholder={`SKU-${s.size}`}
                      value={s.sku}
                      onChange={(e) => {
                        const sizes = [...formData.sizes]
                        sizes[i].sku = e.target.value
                        updateField("sizes", sizes)
                      }}
                    />
                    <Input
                      type="number"
                      min="0"
                      placeholder="Stock"
                      value={s.stock}
                      onChange={(e) => {
                        const sizes = [...formData.sizes]
                        sizes[i].stock = Number(e.target.value) || 0
                        updateField("sizes", sizes)
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  className="accent-foreground"
                  type="checkbox"
                  checked={formData.isSale}
                  onChange={(e) => updateField("isSale", e.target.checked)}
                />
                On Sale
              </label>

              <label className="flex items-center gap-2">
                <input
                  className="accent-foreground"
                  type="checkbox"
                  checked={formData.isNewArrival}
                  onChange={(e) => updateField("isNewArrival", e.target.checked)}
                />
                New Arrival
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
