"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Eye, Mail, Truck, Package, RefreshCw } from "lucide-react"
import apiClient from "@/lib/api-client"
import type { Order, OrderStatus } from "@/types"

export function OrdersManagement() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get("/admin/orders")
      setOrders(response.data)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors: Record<OrderStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  }

  const filteredOrders = orders.filter((order: Order) => {
    if (statusFilter !== "all" && order.status !== statusFilter) return false
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      const customer = order.customerId as any
      if (
        !order._id.toLowerCase().includes(search) &&
        !customer?.email?.toLowerCase().includes(search) &&
        !customer?.firstName?.toLowerCase().includes(search) &&
        !customer?.lastName?.toLowerCase().includes(search)
      ) {
        return false
      }
    }
    return true
  })

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdating(true)
      await apiClient.put(`/admin/orders/${orderId}/status`, { status: newStatus })
      setOrders(orders.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)))
      if (selectedOrder?._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
    } catch (error) {
      console.error("Error updating order:", error)
      alert("Failed to update order status")
    } finally {
      setUpdating(false)
    }
  }

  const handleAddTracking = async () => {
    if (!selectedOrder || !trackingNumber) return
    try {
      setUpdating(true)
      await apiClient.put(`/admin/orders/${selectedOrder._id}`, { trackingNumber })
      setOrders(orders.map((o) => (o._id === selectedOrder._id ? { ...o, trackingNumber } : o)))
      setSelectedOrder({ ...selectedOrder, trackingNumber })
      setIsTrackingDialogOpen(false)
      setTrackingNumber("")
      // Auto-update status to shipped if adding tracking
      if (selectedOrder.status === "processing") {
        handleUpdateStatus(selectedOrder._id, "shipped")
      }
    } catch (error) {
      console.error("Error adding tracking:", error)
      alert("Failed to add tracking number")
    } finally {
      setUpdating(false)
    }
  }

  const handleSendEmail = async () => {
    if (!selectedOrder) return
    try {
      setUpdating(true)
      const customer = selectedOrder.customerId as any
      await apiClient.post("/emails/custom", {
        to: customer?.email,
        subject: emailSubject,
        body: emailBody,
        orderId: selectedOrder._id,
      })
      setIsEmailDialogOpen(false)
      setEmailSubject("")
      setEmailBody("")
      alert("Email sent successfully!")
    } catch (error) {
      console.error("Error sending email:", error)
      alert("Failed to send email")
    } finally {
      setUpdating(false)
    }
  }

  const handleSendOrderConfirmation = async (order: Order) => {
    try {
      await apiClient.post("/emails/order-confirmation", { orderId: order._id })
      alert("Order confirmation email sent!")
    } catch (error) {
      console.error("Error sending confirmation:", error)
      alert("Failed to send confirmation email")
    }
  }

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailOpen(true)
  }

  const openEmailDialog = (order: Order) => {
    setSelectedOrder(order)
    const customer = order.customerId as any
    setEmailSubject(`Order Update - #${order._id.slice(-8)}`)
    setEmailBody(`Hi ${customer?.firstName || "Customer"},\n\nThank you for your order!\n\nBest regards,\nHoney & Oak`)
    setIsEmailDialogOpen(true)
  }

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders and track shipments</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by order ID, customer name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchOrders} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Showing {filteredOrders.length} orders</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mobile view */}
          <div className="block md:hidden space-y-4">
            {filteredOrders.map((order: Order) => {
              const customer = order.customerId as any
              return (
                <Card key={order._id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium">#{order._id?.slice(-8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {customer?.firstName} {customer?.lastName}
                      </p>
                    </div>
                    <Badge className={statusColors[order.status]}>{order.status}</Badge>
                  </div>
                  <div className="text-sm space-y-1 mb-3">
                    <p>
                      <span className="text-muted-foreground">Amount:</span>{" "}
                      <span className="font-semibold">${(order.total / 100).toFixed(2)}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Items:</span> {order.items?.length}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Date:</span>{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => openOrderDetail(order)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => openEmailDialog(order)}
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Email
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Desktop view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Items</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order: Order) => {
                  const customer = order.customerId as any
                  return (
                    <tr key={order._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">#{order._id?.slice(-8)}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-foreground">
                            {customer?.firstName} {customer?.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{customer?.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground">${(order.total / 100).toFixed(2)}</td>
                      <td className="py-3 px-4 text-muted-foreground">{order.items?.length}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={statusColors[order.status]}>{order.status}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openOrderDetail(order)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEmailDialog(order)}>
                            <Mail className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Order Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedOrder && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between">
                  <span>Order #{selectedOrder._id.slice(-8)}</span>
                  <Badge className={statusColors[selectedOrder.status]}>{selectedOrder.status}</Badge>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Status Update */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Update Status</label>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value: OrderStatus) => handleUpdateStatus(selectedOrder._id, value)}
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tracking */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Tracking Number</label>
                  {selectedOrder.trackingNumber ? (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Truck className="w-4 h-4" />
                      <span className="font-mono">{selectedOrder.trackingNumber}</span>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => setIsTrackingDialogOpen(true)}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Add Tracking Number
                    </Button>
                  )}
                </div>

                {/* Customer Info */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Customer</h4>
                  <div className="p-3 bg-muted rounded-lg space-y-1">
                    <p className="font-medium">
                      {(selectedOrder.customerId as any)?.firstName} {(selectedOrder.customerId as any)?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{(selectedOrder.customerId as any)?.email}</p>
                    <p className="text-sm text-muted-foreground">{(selectedOrder.customerId as any)?.phoneNumber}</p>
                  </div>
                </div>

                {/* Shipping Address */}
                {selectedOrder.shippingAddress && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Shipping Address</h4>
                    <div className="p-3 bg-muted rounded-lg text-sm">
                      <p>{selectedOrder.shippingAddress.name}</p>
                      <p>{selectedOrder.shippingAddress.street}</p>
                      <p>
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{" "}
                        {selectedOrder.shippingAddress.zip}
                      </p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.size && `Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                          </p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">${(item.price / 100).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${(selectedOrder.subtotal / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${(selectedOrder.tax / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>${(selectedOrder.shipping / 100).toFixed(2)}</span>
                  </div>
                  {selectedOrder.discountAmount && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-${(selectedOrder.discountAmount / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>${(selectedOrder.total / 100).toFixed(2)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => handleSendOrderConfirmation(selectedOrder)}>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Confirmation
                  </Button>
                  <Button variant="outline" onClick={() => openEmailDialog(selectedOrder)}>
                    Custom Email
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Tracking Dialog */}
      <Dialog open={isTrackingDialogOpen} onOpenChange={setIsTrackingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tracking Number</DialogTitle>
            <DialogDescription>Enter the tracking number for this order.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="e.g., 1Z999AA10123456784"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTrackingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTracking} disabled={updating || !trackingNumber}>
              {updating ? "Saving..." : "Save Tracking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Email to Customer</DialogTitle>
            <DialogDescription>Sending to: {(selectedOrder?.customerId as any)?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="mt-1 min-h-[150px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} disabled={updating || !emailSubject || !emailBody}>
              {updating ? "Sending..." : "Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
