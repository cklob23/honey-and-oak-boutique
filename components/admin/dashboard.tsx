"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { DollarSign, ShoppingCart, Package, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import apiClient from "@/lib/api-client"
import { Customer } from "@/types"

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
    rate: 0
  });

  useEffect(() => {
    const id = localStorage.getItem("customerId")
    if (id) {
      const getCustomer = async () => {
        const response = await apiClient.get(`/customers/${id}`)
        setCustomer(response.data)
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
    const days = parseInt(dateRange, 10)

    const start = new Date()
    start.setDate(today.getDate() - days)

    setStartDate(start.toISOString().substring(0, 10))
    setEndDate(today.toISOString().substring(0, 10))
  }, [dateRange]);

  useEffect(() => {
    if (!startDate || !endDate || customersReport?.length === 0) return

    const s = new Date(startDate)
    const e = new Date(endDate)

    // Range length
    const ms = e.getTime() - s.getTime()
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24))

    // Previous period (same length)
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
    });
  }, [startDate, endDate, customersReport])

  // Count customers whose createdAt is within a range
  const countCustomersInRange = (customers: any[], start: Date, end: Date) => {
    return customers?.filter((c) => {
      const created = new Date(c.createdAt)
      return created >= start && created <= end
    }).length
  };

  // Avoid divide-by-zero and compute growth %
  const calculateGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0

    const rate = ((current - previous) / previous) * 100
    return Number(rate.toFixed(1))
  };

  const getTrendArrow = (rate: number) => {
    if (rate > 0) return "↑"
    if (rate < 0) return "↓"
    return "→"
  }

  const getTrendColor = (rate: number) => {
    if (rate > 0) return "text-green-600"
    if (rate < 0) return "text-red-600"
    return "text-gray-400"
  }

  const getDailyCustomerCounts = (customers: any[], days: number = 30) => {
    const today = new Date();
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const day = new Date();
      day.setDate(today.getDate() - i);

      const start = new Date(day);
      start.setHours(0, 0, 0, 0);

      const end = new Date(day);
      end.setHours(23, 59, 59, 999);

      const count = customers?.filter(c => {
        const created = new Date(c.createdAt);
        return created >= start && created <= end;
      }).length;

      data.push({
        date: day.toLocaleDateString(),
        count,
      });
    }

    return data;
  }

  const CustomerSparkline = ({ data }: { data: any[] }) => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#8B5E34"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  const chartData = [
    { date: "Mon", sales: 400, orders: 24 },
    { date: "Tue", sales: 300, orders: 13 },
    { date: "Wed", sales: 200, orders: 98 },
    { date: "Thu", sales: 278, orders: 39 },
    { date: "Fri", sales: 189, orders: 48 },
    { date: "Sat", sales: 239, orders: 43 },
    { date: "Sun", sales: 349, orders: 65 },
  ];

  const stats = [
    {
      label: "Total Revenue",
      value: salesReport?.totalRevenue ? `$${(salesReport.totalRevenue / 100).toFixed(2)}` : "$0",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-accent",
    },
    {
      label: "Total Orders",
      value: salesReport?.totalOrders || "0",
      change: "+8.2%",
      icon: ShoppingCart,
      color: "text-accent",
    },
    {
      label: "Total Customers",
      value: growth.current || 0,
      change: `${getTrendArrow(growth.rate)} ${growth.rate}%`,
      trendColor: getTrendColor(growth.rate),
      icon: Users,
      color: "text-accent",
    },
    {
      label: "Items in Stock",
      value: inventoryReport?.totalItems || "0",
      change: "Good",
      icon: Package,
      color: "text-accent",
    },
  ]

  const custChartData = getDailyCustomerCounts(customersReport, 30)

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">{`Welcome, ${customer?.firstName} ${customer?.lastName}!`}</p>
        </div>
        <div className="flex gap-4">
          <div>
            <label className="text-sm text-muted-foreground">Date Range</label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-42 mt-1">
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
          <div>
            <label className="text-sm text-muted-foreground">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={dateRange !== "custom"}
              className={dateRange !== "custom" ? "opacity-50 cursor-not-allowed mt-1" : "mt-1"}
            />
          </div>
          <div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className={`text-xs ${stat.color} mt-2`}>{stat.change}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card>
          <CardHeader>
            <CardTitle>Customers by Day</CardTitle>
            <CardDescription>
              {startDate} to {endDate}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {CustomerSparkline({ data: custChartData })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales over Time</CardTitle>
            <CardDescription>
              {startDate} to {endDate}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="hsl(var(--accent))" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders by Day</CardTitle>
            <CardDescription>
              {startDate} to {endDate}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
