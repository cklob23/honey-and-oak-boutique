"use client"

import { Users, BarChart3, Package, ShoppingCart, CreditCard, Shirt, DollarSign } from "lucide-react"
import Link from "next/link"

interface SidebarProps {
  activeView: "dashboard" | "orders" | "inventory" | "reports" | "products" | "customers" | "payments" | "items"
  onViewChange: (
    view: "dashboard" | "orders" | "inventory" | "reports" | "products" | "customers" | "payments" | "items",
  ) => void
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "customers", label: "Customers", icon: Users },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "items", label: "Items", icon: DollarSign },
    { id: "products", label: "Products", icon: Shirt },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "reports", label: "Reports", icon: BarChart3 },
  ]

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border">
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/" className="text-xl font-semibold text-sidebar-foreground">
          Honey & Oak
        </Link>
        <p className="text-xs text-sidebar-accent-foreground">Admin Dashboard</p>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === item.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border bg-sidebar">
        <Link href="/" className="text-sm text-sidebar-foreground hover:underline">
          Back to Store
        </Link>
      </div>
    </aside>
  )
}
