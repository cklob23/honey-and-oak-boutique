"use client"

import { useState } from "react"
import { Sidebar } from "@/components/admin/sidebar"
import { Dashboard } from "@/components/admin/dashboard"
import { OrdersManagement } from "@/components/admin/orders-management"
import { PaymentsManagement } from "@/components/admin/payments-management"
import { ItemsManagement } from "@/components/admin/items-management"
import { InventoryManagement } from "@/components/admin/inventory-management"
import { ReportsView } from "@/components/admin/reports-view"
import { ProductManagement } from "@/components/admin/product-management"
import { CustomerDirectory } from "@/components/admin/customer-directory"

type View = "dashboard" | "orders" | "inventory" | "reports" | "products" | "customers" | "payments" | "items"

export default function AdminPage() {
  const [activeView, setActiveView] = useState<View>("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard />
      case "orders":
        return <OrdersManagement />
      case "payments":
        return <PaymentsManagement />
      case "items":
        return <ItemsManagement />
      case "products":
        return <ProductManagement />
      case "inventory":
        return <InventoryManagement />
      case "reports":
        return <ReportsView />
      case "customers":
        return <CustomerDirectory />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <main className="flex-1 overflow-auto pt-16 lg:pt-0">{renderView()}</main>
    </div>
  )
}