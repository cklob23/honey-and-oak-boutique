"use client"

import { useState } from "react"
import { Sidebar } from "@/components/admin/sidebar"
import { Dashboard } from "@/components/admin/dashboard"
import { OrdersManagement } from "@/components/admin/orders-management"
import { InventoryManagement } from "@/components/admin/inventory-management"
import { ReportsView } from "@/components/admin/reports-view"
import { ProductManagement } from "@/components/admin/product-management"
import { CustomerDirectory } from "@/components/admin/customer-directory"
import { PaymentsManagement } from "@/components/admin/payments-management"
import { ItemsManagement } from "@/components/admin/items-management"

export default function AdminPage() {
  const [activeView, setActiveView] = useState<
    "dashboard" | "orders" | "inventory" | "reports" | "products" | "customers" | "payments" | "items"
  >("dashboard")

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 overflow-auto">
        {activeView === "dashboard" && <Dashboard />}
        {activeView === "orders" && <OrdersManagement />}
        {activeView === "inventory" && <InventoryManagement />}
        {activeView === "reports" && <ReportsView />}
        {activeView === "products" && <ProductManagement />}
        {activeView === "customers" && <CustomerDirectory />}
        {activeView === "payments" && <PaymentsManagement />}
        {activeView === "items" && <ItemsManagement />}
      </div>
    </div>
  )
}
