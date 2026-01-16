"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { DollarSign, ShoppingCart, Package, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import apiClient from "@/lib/api-client"
import type { Customer } from "@/types"

export function Dashboard() {
  const [salesReport, setSalesReport] = useState<any>(null)
  const [inventoryReport, setInventoryReport] = useState<any>(null)
  const [customersReport, setCustomersReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<string>("30")
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  )
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [growth, setGrowth] = useState({
    current: 0,
    previous: 0,
    rate: 0,
  })

  useEffect(() => {
    const id = localStorage.getItem("customerId")
    if (id) {
      const getCustomer = async () => {
        try {
          const response = await apiClient.get(`/customers/${id}`)
          setCustomer(response.data)
        } catch (error) {
          console.error("Error fetching customer:", error)
        }
      }
      getCustomer()
    }
    setCustomerId(id)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, salesRes, inventoryRes] = await Promise.all([
          apiClient.get("/square/customers"),
          apiClient.get("/admin/reports/sales", {
            params: { startDate, endDate },
          }),
          apiClient.get("/admin/reports/inventory"),
        ])
        setCustomersReport(customersRes.data.customers)
        setSalesReport(salesRes.data)
        setInventoryReport(inventoryRes.data)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [startDate, endDate])

  useEffect(() => {
    if (dateRange === "custom") return

    const today = new Date()
    const days = Number.parseInt(dateRange, 10)

    const start = new Date()
    start.setDate(today.getDate() - days)

    setStartDate(start.toISOString().substring(0, 10))
    setEndDate(today.toISOString().substring(0, 10))
  }, [dateRange])

  useEffect(() => {
    if (!startDate || !endDate || customersReport?.length === 0) return

    const s = new Date(startDate)
    const e = new Date(endDate)

    const ms = e.getTime() - s.getTime()
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24))

    const prevEnd = new Date(s)
    prevEnd.setDate(s.getDate() - 1)

    const prevStart = new Date(prevEnd)
    prevStart.setDate(prevStart.getDate() - days)

    const currentCount = customersReport?.length
    const previousCount = customersReport?.length - countCustomersInRange(customersReport, prevStart, prevEnd)

    const rate = calculateGrowthRate(currentCount, previousCount)

    setGrowth({
      current: currentCount,
      previous: previousCount,
      rate,
    })
  }, [startDate, endDate, customersReport])

  const countCustomersInRange = (customers: any[], start: Date, end: Date) => {
    return customers?.filter((c) => {
      const created = new Date(c.createdAt)
      return created >= start && created <= end
    }).length
  }

  const calculateGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    const rate = ((current - previous) / previous) * 100
    return Number(rate.toFixed(1))
  }

  const getTrendArrow = (rate: number) => {
    if (rate > 0) return "↑"
    if (rate < 0) return "↓"
    return "→"
  }

  const getTrendColor = (rate: number) => {
    if (rate > 0) return "text-green-600"
    if (rate < 0) return "text-red-600"
    return "text-muted-foreground"
  }

  const getDailyCustomerCounts = (customers: any[], days = 30) => {
    const today = new Date()
    const data = []

    for (let i = days - 1; i >= 0; i--) {
      const day = new Date()
      day.setDate(today.getDate() - i)

      const start = new Date(day)
      start.setHours(0, 0, 0, 0)

      const end = new Date(day)
      end.setHours(23, 59, 59, 999)

      const count = customers?.filter((c) => {
        const created = new Date(c.createdAt)
        return created >= start && created <= end
      }).length

      data.push({
        date: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count,
      })
    }

    return data
  }

  const chartData = salesReport?.salesData?.slice(0, 7).map((item: any) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { weekday: "short" }),
    sales: item.total / 100,
    orders: 1,
  })) || [
    { date: "Mon", sales: 0, orders: 0 },
    { date: "Tue", sales: 0, orders: 0 },
    { date: "Wed", sales: 0, orders: 0 },
    { date: "Thu", sales: 0, orders: 0 },
    { date: "Fri", sales: 0, orders: 0 },
    { date: "Sat", sales: 0, orders: 0 },
    { date: "Sun", sales: 0, orders: 0 },
  ]

  const stats = [
    {
      label: "Total Revenue",
      value: salesReport?.metrics?.totalRevenue ? `$${(salesReport.metrics.totalRevenue / 100).toFixed(2)}` : "$0.00",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      label: "Total Orders",
      value: salesReport?.metrics?.totalOrders || "0",
      change: "+8.2%",
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      label: "Total Customers",
      value: growth.current || 0,
      change: `${getTrendArrow(growth.rate)} ${growth.rate}%`,
      trendColor: getTrendColor(growth.rate),
      icon: Users,
      color: "text-purple-600",
    },
    {
      label: "Items in Stock",
      value: inventoryReport?.totalItems || "0",
      change: "Good",
      icon: Package,
      color: "text-orange-600",
    },
  ]
  console.log(inventoryReport)
  const custChartData = getDailyCustomerCounts(customersReport, 30)

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            {customer ? `Welcome, ${customer.firstName} ${customer.lastName}!` : "Welcome back!"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div>
            <label className="text-sm text-muted-foreground">Date Range</label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full sm:w-40 mt-1">
                <SelectValue placeholder="Select Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24 Hours</SelectItem>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={dateRange !== "custom"}
                className={dateRange !== "custom" ? "opacity-50 cursor-not-allowed mt-1" : "mt-1"}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-muted-foreground">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={dateRange !== "custom"}
                className={dateRange !== "custom" ? "opacity-50 cursor-not-allowed mt-1" : "mt-1"}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="hidden sm:inline">{stat.label}</span>
                  <span className="sm:hidden">{stat.label.split(" ")[1] || stat.label.split(" ")[0]}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold text-foreground">{stat.value}</div>
                <p className={`text-xs ${stat.trendColor || stat.color} mt-1 md:mt-2`}>{stat.change}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Customers by Day</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {startDate} to {endDate}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={custChartData}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8B5E34" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Sales over Time</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {startDate} to {endDate}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="hsl(var(--chart-1))" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Orders by Day</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {startDate} to {endDate}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="sales" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
