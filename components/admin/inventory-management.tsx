"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Edit2, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import apiClient from "@/lib/api-client"

export function InventoryManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    sku: "",
    quantity: "",
    reorderLevel: "",
  })
  const [inventory, setInventory] = useState([
    {
      id: 1,
      name: "Premium Linen Shirt",
      color: "Natural",
      size: "M",
      quantity: 45,
      reorderLevel: 20,
      status: "in-stock",
    },
    {
      id: 2,
      name: "Premium Linen Shirt",
      color: "Sage",
      size: "L",
      quantity: 12,
      reorderLevel: 20,
      status: "low-stock",
    },
    {
      id: 3,
      name: "High-Waist Trousers",
      color: "Black",
      size: "S",
      quantity: 3,
      reorderLevel: 15,
      status: "critical",
    },
    {
      id: 4,
      name: "High-Waist Trousers",
      color: "Navy",
      size: "M",
      quantity: 28,
      reorderLevel: 20,
      status: "in-stock",
    },
    {
      id: 5,
      name: "Matching Set - Honey",
      color: "Honey",
      size: "XS",
      quantity: 8,
      reorderLevel: 10,
      status: "low-stock",
    },
  ])

  const statusColors = {
    "in-stock": "bg-green-100 text-green-800",
    "low-stock": "bg-yellow-100 text-yellow-800",
    critical: "bg-red-100 text-red-800",
  }

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.color.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddProduct = async () => {
    try {
      const newProduct = {
        ...formData,
        quantity: Number.parseInt(formData.quantity),
        reorderLevel: Number.parseInt(formData.reorderLevel),
      }
      await apiClient.post("/products", newProduct)
      setFormData({
        sku: "",
        quantity: "",
        reorderLevel: "",
      })
      setIsAddModalOpen(false)
    } catch (error) {
      console.error("Error adding product:", error)
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground">Track and manage product stock levels</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>Add a new product variant to your inventory</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">SKU</label>
                <Input
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g., LINEN-SHIRT-001"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Reorder Level</label>
                <Input
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                  placeholder="0"
                />
              </div>
              <Button onClick={handleAddProduct} className="w-full">
                Add Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alert */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-red-900">3 items need reordering</p>
          <p className="text-sm text-red-800">Please review critical and low-stock items</p>
        </div>
      </div>

      {/* Search */}
      <Input
        placeholder="Search by product name or color..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md"
      />

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Levels</CardTitle>
          <CardDescription>Showing {filteredInventory.length} items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Color</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Size</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Quantity</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Reorder Level</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">{item.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{item.color}</td>
                    <td className="py-3 px-4 text-muted-foreground">{item.size}</td>
                    <td className="py-3 px-4 font-semibold text-foreground">{item.quantity}</td>
                    <td className="py-3 px-4 text-muted-foreground">{item.reorderLevel}</td>
                    <td className="py-3 px-4">
                      <Badge className={statusColors[item.status as keyof typeof statusColors]}>
                        {item.status.replace("-", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
