"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Eye, RefreshCw, DollarSign, AlertCircle } from "lucide-react"
import apiClient from "@/lib/api-client"
import { Payment, PaymentMethod, PaymentStatus } from "@/types"

export function PaymentsManagement() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false)
  const [refundAmount, setRefundAmount] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get("/admin/payments")
      setPayments(response.data)
    } catch (error) {
      console.error("Error fetching payments:", error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors: Record<PaymentStatus, string> = {
    completed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-blue-100 text-blue-800",
  }

  const paymentMethodLabels: Record<PaymentMethod, string> = {
    card: "Credit Card",
    apple_pay: "Apple Pay",
    google_pay: "Google Pay",
    cash_app: "Cash App",
    affirm: "Affirm",
    gift_card: "Gift Card",
    shop_pay: "Shop Pay",
  }

  const filteredPayments = payments.filter((payment) => {
    if (statusFilter !== "all" && payment.status !== statusFilter) return false
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      const customer = payment.customerId as any
      if (
        !payment._id.toLowerCase().includes(search) &&
        !payment.transactionId?.toLowerCase().includes(search) &&
        !customer?.email?.toLowerCase().includes(search)
      ) {
        return false
      }
    }
    return true
  })

  const openPaymentDetail = (payment: Payment) => {
    setSelectedPayment(payment)
    setIsDetailOpen(true)
  }

  const openRefundDialog = (payment: Payment) => {
    setSelectedPayment(payment)
    setRefundAmount((payment.amount / 100).toFixed(2))
    setIsRefundDialogOpen(true)
  }

  const handleRefund = async () => {
    if (!selectedPayment || !refundAmount) return

    const refundCents = Math.round(Number.parseFloat(refundAmount) * 100)
    if (refundCents <= 0 || refundCents > selectedPayment.amount) {
      alert("Invalid refund amount")
      return
    }

    try {
      setProcessing(true)
      await apiClient.post(`/admin/payments/${selectedPayment._id}/refund`, {
        amount: refundCents,
      })

      // Update local state
      setPayments(
        payments.map((p) =>
          p._id === selectedPayment._id
            ? {
                ...p,
                status: "refunded" as PaymentStatus,
                refundedAmount: refundCents,
                refundedAt: new Date().toISOString(),
              }
            : p,
        ),
      )

      setIsRefundDialogOpen(false)
      setSelectedPayment(null)
      alert("Refund processed successfully!")
    } catch (error) {
      console.error("Error processing refund:", error)
      alert("Failed to process refund")
    } finally {
      setProcessing(false)
    }
  }

  const totalRevenue = payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0)

  const pendingPayments = payments.filter((p) => p.status === "pending").length
  const refundedAmount = payments.reduce((sum, p) => sum + (p.refundedAmount || 0), 0)

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Payments</h1>
        <p className="text-muted-foreground">View and manage all payment transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-green-600">${(totalRevenue / 100).toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{payments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-yellow-600">{pendingPayments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Refunded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-blue-600">${(refundedAmount / 100).toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by transaction ID or customer email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchPayments} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>Showing {filteredPayments.length} payments</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mobile view */}
          <div className="block md:hidden space-y-4">
            {filteredPayments.map((payment) => {
              const customer = payment.customerId as any
              return (
                <Card key={payment._id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-mono text-sm">{payment._id?.slice(-8)}</p>
                      <p className="text-sm text-muted-foreground">{customer?.email || "Guest"}</p>
                    </div>
                    <Badge className={statusColors[payment.status]}>{payment.status}</Badge>
                  </div>
                  <div className="text-sm space-y-1 mb-3">
                    <p>
                      <span className="text-muted-foreground">Amount:</span>{" "}
                      <span className="font-semibold">${(payment.amount / 100).toFixed(2)}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Method:</span>{" "}
                      {paymentMethodLabels[payment.method] || payment.method}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Date:</span>{" "}
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => openPaymentDetail(payment)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {payment.status === "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 bg-transparent"
                        onClick={() => openRefundDialog(payment)}
                      >
                        <DollarSign className="w-4 h-4 mr-1" />
                        Refund
                      </Button>
                    )}
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
                  <th className="text-left py-3 px-4 font-semibold text-foreground">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Method</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => {
                  const customer = payment.customerId as any
                  return (
                    <tr key={payment._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-foreground">{payment._id?.slice(-8)}</td>
                      <td className="py-3 px-4">
                        <p className="text-foreground">{customer?.email || "Guest"}</p>
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        ${(payment.amount / 100).toFixed(2)}
                        {payment.refundedAmount && (
                          <span className="text-red-600 text-xs ml-2">
                            (-${(payment.refundedAmount / 100).toFixed(2)})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {paymentMethodLabels[payment.method] || payment.method}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={statusColors[payment.status]}>{payment.status}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openPaymentDetail(payment)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {payment.status === "completed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => openRefundDialog(payment)}
                            >
                              <DollarSign className="w-4 h-4" />
                            </Button>
                          )}
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

      {/* Payment Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selectedPayment && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between">
                  <span>Transaction Details</span>
                  <Badge className={statusColors[selectedPayment.status]}>{selectedPayment.status}</Badge>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Transaction ID</h4>
                  <p className="font-mono">{selectedPayment._id}</p>
                </div>

                {selectedPayment.transactionId && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">External ID</h4>
                    <p className="font-mono">{selectedPayment.transactionId}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Amount</h4>
                  <p className="text-2xl font-bold">${(selectedPayment.amount / 100).toFixed(2)}</p>
                  {selectedPayment.refundedAmount && (
                    <p className="text-sm text-red-600">
                      Refunded: ${(selectedPayment.refundedAmount / 100).toFixed(2)}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Payment Method</h4>
                  <p>{paymentMethodLabels[selectedPayment.method] || selectedPayment.method}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Customer</h4>
                  <p>{(selectedPayment.customerId as any)?.email || "Guest checkout"}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Date</h4>
                  <p>{new Date(selectedPayment.createdAt).toLocaleString()}</p>
                </div>

                {selectedPayment.refundedAt && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Refunded At</h4>
                    <p>{new Date(selectedPayment.refundedAt).toLocaleString()}</p>
                  </div>
                )}

                {selectedPayment.status === "completed" && (
                  <Button
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                    onClick={() => {
                      setIsDetailOpen(false)
                      openRefundDialog(selectedPayment)
                    }}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Issue Refund
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Refund Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Process Refund
            </DialogTitle>
            <DialogDescription>This will refund the customer. This action cannot be undone.</DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="py-4 space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Original Amount</p>
                <p className="text-xl font-bold">${(selectedPayment.amount / 100).toFixed(2)}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Refund Amount</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={(selectedPayment.amount / 100).toFixed(2)}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="pl-7"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Max refund: ${(selectedPayment.amount / 100).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRefund}
              disabled={processing || !refundAmount || Number.parseFloat(refundAmount) <= 0}
            >
              {processing ? "Processing..." : "Confirm Refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
