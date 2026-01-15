"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Edit2, Trash2, Plus, RefreshCw, ImageIcon } from "lucide-react"
import apiClient from "@/lib/api-client"
import type { Product } from "@/types"

export function ItemsManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category: "tops",
    price: "",
    salePrice: "",
    description: "",
    colors: "",
    material: "",
    isSale: false,
    isNewArrival: true,
  })

  useEffect(() => {
    fetchItems()
  }, [categoryFilter])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get("/products", {
        params: { category: categoryFilter !== "all" ? categoryFilter : undefined },
      })
      setItems(response.data)
    } catch (error) {
      console.error("Error fetching items:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = items.filter((item) => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      if (!item.name?.toLowerCase().includes(search) && !item.sku?.toLowerCase().includes(search)) {
        return false
      }
    }
    return true
  })

  const resetForm = () => {
    setFormData({
      sku: "",
      name: "",
      category: "tops",
      price: "",
      salePrice: "",
      description: "",
      colors: "",
      material: "",
      isSale: false,
      isNewArrival: true,
    })
  }

  const handleAddItem = async () => {
    try {
      setSaving(true)
      const newItem = {
        ...formData,
        price: Number.parseFloat(formData.price),
        salePrice: formData.salePrice ? Number.parseFloat(formData.salePrice) : undefined,
        colors: formData.colors
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
      }
      const response = await apiClient.post("/products", newItem)
      setItems([response.data, ...items])
      resetForm()
      setIsAddModalOpen(false)
    } catch (error) {
      console.error("Error adding item:", error)
      alert("Failed to add item")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateItem = async () => {
    if (!selectedItem) return
    try {
      setSaving(true)
      const updatedItem = {
        ...formData,
        price: Number.parseFloat(formData.price),
        salePrice: formData.salePrice ? Number.parseFloat(formData.salePrice) : undefined,
        colors: formData.colors
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
      }
      const response = await apiClient.put(`/products/${selectedItem._id}`, updatedItem)
      setItems(items.map((i) => (i._id === selectedItem._id ? response.data : i)))
      setIsEditSheetOpen(false)
      setSelectedItem(null)
    } catch (error) {
      console.error("Error updating item:", error)
      alert("Failed to update item")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return
    try {
      await apiClient.delete(`/products/${itemId}`)
      setItems(items.filter((i) => i._id !== itemId))
    } catch (error) {
      console.error("Error deleting item:", error)
      alert("Failed to delete item")
    }
  }

  const openEditSheet = (item: Product) => {
    setSelectedItem(item)
    setFormData({
      sku: item.sku || "",
      name: item.name || "",
      category: item.category || "tops",
      price: item.price?.toString() || "",
      salePrice: item.salePrice?.toString() || "",
      description: item.description || "",
      colors: item.colors?.join(", ") || "",
      material: item.material || "",
      isSale: item.isSale || false,
      isNewArrival: item.isNewArrival || false,
    })
    setIsEditSheetOpen(true)
  }

  const getTotalStock = (item: Product) => {
    return item.sizes?.reduce((sum, s) => sum + (s.stock || 0), 0) || 0
  }

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Items</h1>
          <p className="text-muted-foreground">Manage inventory and product catalog</p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setIsAddModalOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search items by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="tops">Tops</SelectItem>
            <SelectItem value="bottoms">Bottoms</SelectItem>
            <SelectItem value="dresses">Dresses</SelectItem>
            <SelectItem value="sets">Sets</SelectItem>
            <SelectItem value="accessories">Accessories</SelectItem>
            <SelectItem value="self-care">Self Care</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchItems} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>Showing {filteredItems.length} items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredItems.map((item) => {
              const totalStock = getTotalStock(item)
              return (
                <Card key={item._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-muted relative">
                    {item.images?.[0]?.url ? (
                      <img
                        src={item.images[0].url || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    {item.isSale && <Badge className="absolute top-2 right-2 bg-red-500 text-white">Sale</Badge>}
                    {item.isNewArrival && <Badge className="absolute top-2 left-2 bg-green-500 text-white">New</Badge>}
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">{item.category}</p>
                      <h3 className="font-semibold text-foreground line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">Variations: {item.sizes?.length}</p>
                    </div>

                    <div className="space-y-1 mb-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price</span>
                        <span className="font-semibold">${item.price?.toFixed(2)}</span>
                      </div>
                      {item.salePrice && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sale Price</span>
                          <span className="font-semibold text-red-600">${item.salePrice?.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stock</span>
                        <Badge variant={totalStock > 0 ? "outline" : "destructive"}>
                          {totalStock > 0 ? `${totalStock} in stock` : "Out of stock"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => openEditSheet(item)}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-destructive hover:text-destructive bg-transparent"
                        onClick={() => handleDeleteItem(item._id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredItems.length === 0 && !loading && (
            <div className="text-center py-12 text-muted-foreground">No items found</div>
          )}
        </CardContent>
      </Card>

      {/* Add Item Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>Create a new product item for your inventory</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">SKU</label>
                <Input
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g., LINEN-001"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tops">Tops</SelectItem>
                    <SelectItem value="bottoms">Bottoms</SelectItem>
                    <SelectItem value="dresses">Dresses</SelectItem>
                    <SelectItem value="sets">Sets</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="self-care">Self Care</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Item Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Premium Linen Shirt"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Price ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Sale Price ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Colors (comma-separated)</label>
                <Input
                  value={formData.colors}
                  onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                  placeholder="e.g., Red, Blue, Green"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Material</label>
                <Input
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  placeholder="e.g., 100% Linen"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isSale}
                  onChange={(e) => setFormData({ ...formData, isSale: e.target.checked })}
                  className="accent-primary"
                />
                <span className="text-sm">On Sale</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isNewArrival}
                  onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                  className="accent-primary"
                />
                <span className="text-sm">New Arrival</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem} disabled={saving || !formData.name || !formData.price}>
              {saving ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedItem && (
            <>
              <SheetHeader>
                <SheetTitle>Edit Item</SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">SKU</label>
                    <Input
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={formData.category}
                      onValueChange={(val) => setFormData({ ...formData, category: val })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tops">Tops</SelectItem>
                        <SelectItem value="bottoms">Bottoms</SelectItem>
                        <SelectItem value="dresses">Dresses</SelectItem>
                        <SelectItem value="sets">Sets</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                        <SelectItem value="self-care">Self Care</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Item Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Price ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Sale Price ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Colors</label>
                    <Input
                      value={formData.colors}
                      onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Material</label>
                    <Input
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isSale}
                      onChange={(e) => setFormData({ ...formData, isSale: e.target.checked })}
                      className="accent-primary"
                    />
                    <span className="text-sm">On Sale</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isNewArrival}
                      onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                      className="accent-primary"
                    />
                    <span className="text-sm">New Arrival</span>
                  </label>
                </div>

                <Button className="w-full" onClick={handleUpdateItem} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
