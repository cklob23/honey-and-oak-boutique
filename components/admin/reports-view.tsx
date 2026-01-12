"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Download } from "lucide-react"
import apiClient from "@/lib/api-client"

const categoryData = [
  { name: "Shirts", value: 45 },
  { name: "Pants", value: 30 },
  { name: "Sets", value: 15 },
  { name: "Accessories", value: 10 },
]

const COLORS = ["hsl(var(--accent))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"]

const downloadReportAsCSV = (data: any[], filename: string) => {
  console.log(data, filename)
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

const downloadReportAsJSON = (data: any[], filename: string) => {
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

export function ReportsView() {
  const [selectedFormat, setSelectedFormat] = useState("csv")
  const [reportData, setReportData] = useState<any>(null)
  const [dateRange, setDateRange] = useState("last-30")
  const [reportType, setReportType] = useState("sales")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true)
      try {
        const endpoint = `/reports/${reportType}`
        const response = await apiClient.get(endpoint, {
          params: { dateRange },
        })
        setReportData(response.data)
      } catch (error) {
        console.error("Error fetching report:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [dateRange, reportType])

  const handleExportReport = async () => {
    try {
      const timestamp = new Date().toISOString().split("T")[0]
      const filename = `${reportType}-report-${timestamp}`

      if (selectedFormat === "csv") {
        downloadReportAsCSV(reportData?.data || [], `${filename}.csv`)
      } else {
        downloadReportAsJSON(reportData || {}, `${filename}.json`)
      }
    } catch (error) {
      console.error("Error exporting report:", error)
    }
  }

  const salesData = [
    { month: "Jan", sales: 4000, refunds: 240 },
    { month: "Feb", sales: 3000, refunds: 221 },
    { month: "Mar", sales: 2000, refunds: 229 },
    { month: "Apr", sales: 2780, refunds: 200 },
    { month: "May", sales: 1890, refunds: 229 },
    { month: "Jun", sales: 2390, refunds: 200 },
  ]

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Sales analytics and business insights</p>
        </div>
        <div className="flex gap-4">
          <Select value={selectedFormat} onValueChange={setSelectedFormat}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">Export as CSV</SelectItem>
              <SelectItem value="json">Export as JSON</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2" onClick={handleExportReport}>
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Report Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sales">Sales Report</SelectItem>
            <SelectItem value="customers">Customer Report</SelectItem>
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
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales & Refunds</CardTitle>
            <CardDescription>Monthly comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="hsl(var(--accent))" />
                <Bar dataKey="refunds" fill="hsl(var(--destructive))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Product category breakdown</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${reportData?.totalRevenue ? (reportData.totalRevenue / 100).toFixed(2) : "0"}
            </div>
            <p className="text-xs text-accent mt-2">+12% from previous period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{reportData?.totalOrders || "0"}</div>
            <p className="text-xs text-accent mt-2">+8% from previous period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${reportData?.avgOrderValue ? (reportData.avgOrderValue / 100).toFixed(2) : "0"}
            </div>
            <p className="text-xs text-accent mt-2">+3% from previous period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Refund Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{reportData?.refundRate || "0"}%</div>
            <p className="text-xs text-accent mt-2">-0.5% from previous period</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
