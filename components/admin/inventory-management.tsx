"use client"

import { useState, useEffect, Fragment } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Edit2,
  Plus,
  RefreshCw,
  Package,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  AlertTriangle,
  AlertCircle,
} from "lucide-react"
import apiClient from "@/lib/api-client"
import type { Inventory, Product } from "@/types"

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

interface InventoryItem extends Inventory {
  productId: Product
}

type SortKey = "name" | "category" | "sku" | "quantity" | "available"

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  /* ----------------------------- ADD / EDIT ----------------------------- */

  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null)

  const [form, setForm] = useState({
    productId: "",
    sku: "",
    size: "",
    color: "",
    quantity: "",
    restockThreshold: "",
  })

  /* -------------------------------------------------------------------------- */
  /* DATA                                                                       */
  /* -------------------------------------------------------------------------- */

  const fetchData = async () => {
    setLoading(true)
    try {
      const [invRes, prodRes] = await Promise.all([
        apiClient.get("/admin/inventory"),
        apiClient.get("/products"),
      ])
      setInventory(invRes.data)
      setProducts(prodRes.data)
      setSelected({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  /* -------------------------------------------------------------------------- */
  /* HELPERS                                                                    */
  /* -------------------------------------------------------------------------- */

  const getStatus = (item: InventoryItem) => {
    const available = item.quantity - item.reserved
    if (available <= 0) return "out-of-stock"
    if (available <= item.restockThreshold / 2) return "critical"
    if (available <= item.restockThreshold) return "low-stock"
    return "in-stock"
  }

  const statusColors: Record<string, string> = {
    "in-stock": "bg-green-100 text-green-800",
    "low-stock": "bg-yellow-100 text-yellow-800",
    critical: "bg-red-100 text-red-800",
    "out-of-stock": "bg-gray-100 text-gray-800",
  }

  /* -------------------------------------------------------------------------- */
  /* FILTER + SORT                                                              */
  /* -------------------------------------------------------------------------- */

  const filtered = inventory.filter((item) => {
    const status = getStatus(item)
    if (statusFilter !== "all" && status !== statusFilter) return false
    if (!searchTerm) return true

    const s = searchTerm.toLowerCase()
    return (
      item.productId.name.toLowerCase().includes(s) ||
      item.productId.category?.toLowerCase().includes(s) ||
      item.sku?.toLowerCase().includes(s) ||
      item.size?.toLowerCase().includes(s) ||
      item.color?.toLowerCase().includes(s)
    )
  })

  const sorted = [...filtered].sort((a, b) => {
    let av: any
    let bv: any

    switch (sortKey) {
      case "name":
        av = a.productId.name
        bv = b.productId.name
        break
      case "category":
        av = a.productId.category
        bv = b.productId.category
        break
      case "sku":
        av = a.sku
        bv = b.sku
        break
      case "quantity":
        av = a.quantity
        bv = b.quantity
        break
      case "available":
        av = a.quantity - a.reserved
        bv = b.quantity - b.reserved
        break
    }

    if (av < bv) return sortDir === "asc" ? -1 : 1
    if (av > bv) return sortDir === "asc" ? 1 : -1
    return 0
  })

  const grouped = sorted.reduce((acc, item) => {
    const id = item.productId._id
    if (!acc[id]) acc[id] = { product: item.productId, items: [] }
    acc[id].items.push(item)
    return acc
  }, {} as Record<string, { product: Product; items: InventoryItem[] }>)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  /* -------------------------------------------------------------------------- */
  /* ACTIONS                                                                    */
  /* -------------------------------------------------------------------------- */

  const openEdit = (item: InventoryItem) => {
    setActiveItem(item)
    setForm({
      productId: item.productId._id,
      sku: item?.sku,
      size: item.size,
      color: item.color,
      quantity: item.quantity.toString(),
      restockThreshold: item.restockThreshold.toString(),
    })
    setEditOpen(true)
  }

  const saveEdit = async () => {
    if (!activeItem) return
    await apiClient.put(`/admin/inventory/${activeItem._id}`, {
      sku: form.sku,
      quantity: Number(form.quantity),
      restockThreshold: Number(form.restockThreshold),
    })
    setEditOpen(false)
    fetchData()
  }

  const quickRestock = async (item: InventoryItem) => {
    await apiClient.put(`/admin/inventory/${item._id}/restock`, { quantity: 1 })
    fetchData()
  }

  const addInventory = async () => {
    await apiClient.post("/admin/inventory", {
      ...form,
      quantity: Number(form.quantity),
      restockThreshold: Number(form.restockThreshold),
    })
    setAddOpen(false)
    fetchData()
  }

  const lowStockCount = inventory.filter((item) => {
    const status = getStatus(item)
    return status === "low-stock" || status === "critical"
  }).length

  const outOfStockCount = inventory.filter((item) => getStatus(item) === "out-of-stock").length

  /* -------------------------------------------------------------------------- */
  /* UI                                                                         */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => {
            setForm({
              productId: "",
              sku: "",
              size: "",
              color: "",
              quantity: "",
              restockThreshold: "10",
            })
            setAddOpen(true)
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Inventory
          </Button>
        </div>
      </div>
      {/* Alert Section */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="space-y-3">
          {outOfStockCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">{outOfStockCount} items out of stock</p>
                <p className="text-sm text-red-800">These items need immediate restocking</p>
              </div>
            </div>
          )}
          {lowStockCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">{lowStockCount} items running low</p>
                <p className="text-sm text-yellow-800">Review and reorder these items soon</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total SKUs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{inventory.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-green-600">
              {inventory.filter((i) => getStatus(i) === "in-stock").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-yellow-600">{lowStockCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-red-600">{outOfStockCount}</div>
          </CardContent>
        </Card>
      </div>
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Search name, SKU, category…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["all", "in-stock", "low-stock", "critical", "out-of-stock"].map(
              (s) => (
                <SelectItem key={s} value={s}>
                  {s.replace("-", " ")}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      {/* TABLE (UNCHANGED UI) */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm min-w-[1100px]">
            <thead className="sticky top-0 bg-background border-b z-10">
              <tr>
                <th className="w-10" />
                <th className="w-10" />
                <th className="w-12" />
                <th onClick={() => toggleSort("name")} className="cursor-pointer">
                  Item <ArrowUpDown className="inline w-3 h-3 ml-1" />
                </th>
                <th onClick={() => toggleSort("category")} className="cursor-pointer">
                  Category <ArrowUpDown className="inline w-3 h-3 ml-1" />
                </th>
                <th onClick={() => toggleSort("sku")} className="cursor-pointer">
                  SKU <ArrowUpDown className="inline w-3 h-3 ml-1" />
                </th>
                <th>Size</th>
                <th>Color</th>
                <th onClick={() => toggleSort("quantity")} className="cursor-pointer">
                  Stock <ArrowUpDown className="inline w-3 h-3 ml-1" />
                </th>
                <th onClick={() => toggleSort("available")} className="cursor-pointer">
                  Available <ArrowUpDown className="inline w-3 h-3 ml-1" />
                </th>
                <th>Status</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {Object.values(grouped).map(({ product, items }) => (
                <Fragment key={product._id}>
                  <tr className="bg-muted/40 font-medium">
                    <td />
                    <td>
                      <button onClick={() =>
                        setCollapsed(c => ({ ...c, [product._id]: !c[product._id] }))
                      }>
                        {collapsed[product._id] ? (
                          <ChevronRight className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td>
                      <Image
                        src={product.images?.[0]?.url || "/placeholder.svg"}
                        alt={product.name}
                        width={36}
                        height={36}
                        className="rounded"
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td colSpan={2}>{items.length} variants</td>
                    <td />
                    <td className="font-semibold">
                      {items.reduce((s, i) => s + i.quantity, 0)}
                    </td>
                    <td className="font-semibold">
                      {items.reduce((s, i) => s + i.quantity, 0)}
                    </td>
                    <td />
                  </tr>

                  {!collapsed[product._id] &&
                    items.map((item) => {
                      const status = getStatus(item)
                      return (
                        <tr key={item._id} className="border-b">
                          <td />
                          <td />
                          <td />
                          <td />
                          <td />
                          <td>{item.sku || '-'}</td>
                          <td>{item.size}</td>
                          <td>{item.color}</td>
                          <td>{item.quantity}</td>
                          <td>{item.quantity - item.reserved}</td>
                          <td>
                            <Badge className={statusColors[status]}>
                              {status.replace("-", " ")}
                            </Badge>
                          </td>
                          <td className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => openEdit(item)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => quickRestock(item)}>
                              <Package className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ADD INVENTORY */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Add Inventory</DialogTitle>
          </DialogHeader>
          <Select value={form.productId} onValueChange={(v) => setForm({ ...form, productId: v })} >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p._id} value={p._id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          <Input placeholder="Size" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
          <Input placeholder="Color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
          <Input type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          <Input type="number" placeholder="Restock Threshold" value={form.restockThreshold} onChange={(e) => setForm({ ...form, restockThreshold: e.target.value })} />

          <DialogFooter>
            <Button onClick={addInventory}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT INVENTORY */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Edit Inventory</DialogTitle>
          </DialogHeader>
          <Input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          <p className="font-medium">Quantity</p>
          <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          <p className="font-medium">Restock Threshold</p>
          <Input type="number" value={form.restockThreshold} onChange={(e) => setForm({ ...form, restockThreshold: e.target.value })} />

          <DialogFooter>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
