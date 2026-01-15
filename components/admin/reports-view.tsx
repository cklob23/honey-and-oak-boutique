"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts"
import { Download, RefreshCw, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users } from "lucide-react"
import apiClient from "@/lib/api-client"
import type { SalesReport, InventoryReport } from "@/types"

const COLORS = ["#8B5E34", "#4A90A4", "#6B8E23", "#CD853F", "#708090"]

export function ReportsView() {
  const [selectedFormat, setSelectedFormat] = useState("csv")
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null)
  const [inventoryReport, setInventoryReport] = useState<InventoryReport | null>(null)
  const [dateRange, setDateRange] = useState("last-30")
  const [reportType, setReportType] = useState("sales")
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    fetchReports()
  }, [dateRange])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const params: any = { period: dateRange }
      if (dateRange === "custom" && startDate && endDate) {
        params.startDate = startDate
        params.endDate = endDate
      }

      const [salesRes, inventoryRes] = await Promise.all([
        apiClient.get("/reports/sales", { params }),
        apiClient.get("/reports/inventory"),
      ])
      console.log(salesRes.data)
      setSalesReport(salesRes.data)
      setInventoryReport(inventoryRes.data)
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const percentChange = (current: number, previous?: number) => {
    if (!previous || previous === 0) return null
    return ((current - previous) / previous) * 100
  }


  const downloadReportAsCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      alert("No data to export")
      return
    }
    const csv = [Object.keys(data[0]).join(","), ...data.map((row) => Object.values(row).join(","))].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const downloadReportAsJSON = (data: any, filename: string) => {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleExportReport = () => {
    const timestamp = new Date().toISOString().split("T")[0]
    const filename = `${reportType}-report-${timestamp}`

    if (reportType === "sales" && salesReport) {
      if (selectedFormat === "csv") {
        downloadReportAsCSV(salesReport.salesData || [], `${filename}.csv`)
      } else {
        downloadReportAsJSON(salesReport, `${filename}.json`)
      }
    } else if (reportType === "inventory" && inventoryReport) {
      if (selectedFormat === "csv") {
        downloadReportAsCSV(inventoryReport.inventoryData || [], `${filename}.csv`)
      } else {
        downloadReportAsJSON(inventoryReport, `${filename}.json`)
      }
    }
  }

  // Process sales data for charts
  const salesChartData =
    salesReport?.salesData?.reduce(
      (acc: any[], item) => {
        const date = new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        const existing = acc.find((d) => d.date === date)
        if (existing) {
          existing.sales += item.total / 100
          existing.orders += 1
        } else {
          acc.push({ date, sales: item.total / 100, orders: 1 })
        }
        return acc
      },
      [] as { date: string; sales: number; orders: number }[],
    ) || []

  // Process category data for pie chart
  const categoryData = salesReport?.salesByCategory
    ? Object.entries(salesReport.salesByCategory).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }))
    : []

  // Process inventory data for chart
  const inventoryChartData =
    inventoryReport?.inventoryData?.slice(0, 10).map((item) => ({
      name: item.name.length > 15 ? item.name.substring(0, 15) + "..." : item.name,
      stock: item.totalStock,
    })) || []

  const metrics = salesReport?.metrics

  const revenueChange = percentChange(
    metrics?.totalRevenue ?? 0,
    metrics?.previousPeriod?.totalRevenue
  )

  const ordersChange = percentChange(
    metrics?.totalOrders ?? 0,
    metrics?.previousPeriod?.totalOrders
  )

  const aovChange = percentChange(
    metrics?.averageOrderValue ?? 0,
    metrics?.previousPeriod?.averageOrderValue
  )

  const refundChange = percentChange(
    metrics?.refundRate ?? 0,
    metrics?.previousPeriod?.refundRate
  )

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Sales analytics and business insights</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Select value={selectedFormat} onValueChange={setSelectedFormat}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Report Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sales">Sales Report</SelectItem>
            <SelectItem value="inventory">Inventory Report</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last-7">Last 7 days</SelectItem>
            <SelectItem value="last-30">Last 30 days</SelectItem>
            <SelectItem value="last-90">Last 90 days</SelectItem>
            <SelectItem value="year">This year</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
        {dateRange === "custom" && (
          <>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-40" />
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-40" />
            <Button variant="outline" onClick={fetchReports}>
              Apply
            </Button>
          </>
        )}
        <Button variant="outline" onClick={fetchReports} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              ${((metrics?.totalRevenue ?? 0) / 100).toFixed(2)}
            </div>

            {revenueChange !== null && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${revenueChange >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                {revenueChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {revenueChange.toFixed(1)}% from previous period
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {metrics?.totalOrders ?? 0}
            </div>

            {ordersChange !== null && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${ordersChange >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                {ordersChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {ordersChange.toFixed(1)}% from previous period
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-600" />
              Avg Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              ${((metrics?.averageOrderValue ?? 0) / 100).toFixed(2)}
            </div>

            {aovChange !== null && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${aovChange >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                {aovChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {aovChange.toFixed(1)}% from previous period
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-600" />
              Refund Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {(metrics?.refundRate ?? 0).toFixed(1)}%
            </div>

            {refundChange !== null && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${refundChange <= 0 ? "text-green-600" : "text-red-600"
                }`}>
                {refundChange <= 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                {refundChange.toFixed(1)}% from previous period
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Sales Over Time</CardTitle>
            <CardDescription className="text-xs md:text-sm">Daily revenue breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8B5E34" strokeWidth={2} name="Revenue ($)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Sales by Category</CardTitle>
            <CardDescription className="text-xs md:text-sm">Product category breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Orders by Day</CardTitle>
            <CardDescription className="text-xs md:text-sm">Daily order count</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
                <Bar dataKey="orders" fill="#4A90A4" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Inventory Levels</CardTitle>
            <CardDescription className="text-xs md:text-sm">Top 10 products by stock</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inventoryChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
                <Bar dataKey="stock" fill="#6B8E23" name="Stock" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {inventoryReport?.lowStockItems && inventoryReport.lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg text-orange-600">Low Stock Alert</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {inventoryReport.lowStockItems.length} items need restocking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-semibold">Product</th>
                    <th className="text-left py-2 px-4 font-semibold">Category</th>
                    <th className="text-left py-2 px-4 font-semibold">Price</th>
                    <th className="text-left py-2 px-4 font-semibold">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryReport.lowStockItems.map((item) => (
                    <tr key={item.productId} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">{item.name}</td>
                      <td className="py-2 px-4 capitalize">{item.category}</td>
                      <td className="py-2 px-4">${item.price?.toFixed(2)}</td>
                      <td className="py-2 px-4">
                        <span className={`font-semibold ${item.totalStock < 5 ? "text-red-600" : "text-orange-600"}`}>
                          {item.totalStock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
