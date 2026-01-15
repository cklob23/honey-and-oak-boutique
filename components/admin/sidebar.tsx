"use client"

import { useState } from "react"
import {
  Users,
  BarChart3,
  Package,
  ShoppingCart,
  CreditCard,
  Shirt,
  DollarSign,
  Menu,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeView: "dashboard" | "orders" | "inventory" | "reports" | "products" | "customers" | "payments" | "items"
  onViewChange: (
    view: "dashboard" | "orders" | "inventory" | "reports" | "products" | "customers" | "payments" | "items",
  ) => void
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "customers", label: "Customers", icon: Users },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "payments", label: "Payments", icon: CreditCard },
  //{ id: "items", label: "Items", icon: DollarSign },
  { id: "products", label: "Products", icon: Shirt },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "reports", label: "Reports", icon: BarChart3 },
]

function DesktopSidebar({ activeView, onViewChange, collapsed, onCollapsedChange }: SidebarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col bg-sidebar border-r border-sidebar-border h-screen sticky top-0 transition-all duration-300",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div
          className={cn(
            "p-4 border-b border-sidebar-border flex items-center",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          {!collapsed && (
            <div>
              <Link href="/" className="text-xl font-semibold text-sidebar-foreground">
                Honey & Oak
              </Link>
              <p className="text-xs text-sidebar-accent-foreground">Admin Dashboard</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCollapsedChange?.(!collapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            <span className="sr-only">{collapsed ? "Expand sidebar" : "Collapse sidebar"}</span>
          </Button>
        </div>

        <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const button = (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as any)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg transition-colors",
                  collapsed ? "px-0 py-3 justify-center" : "px-4 py-3",
                  activeView === item.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return button
          })}
        </nav>

        <div className={cn("p-4 border-t border-sidebar-border bg-sidebar", collapsed && "flex justify-center")}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/shop" className="text-sidebar-foreground hover:text-sidebar-accent-foreground">
                  <LogOut className="w-4 h-4" />
                  <span className="sr-only">Back to Store</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                Back to Store
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link href="/shop" className="text-sm text-sidebar-foreground hover:underline flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Back to Store
            </Link>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}

function MobileSidebar({ activeView, onViewChange }: SidebarProps) {
  const [open, setOpen] = useState(false)

  const handleViewChange = (view: any) => {
    onViewChange(view)
    setOpen(false)
  }

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 bg-background shadow-md">
            <Menu className="w-6 h-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="p-6 border-b border-sidebar-border">
            <Link href="/" className="text-xl font-semibold text-foreground">
              Honey & Oak
            </Link>
            <p className="text-xs text-muted-foreground">Admin Dashboard</p>
          </div>

          <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => handleViewChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeView === item.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              )
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background">
            <Link href="/shop" className="text-sm text-foreground hover:underline flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Back to Store
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export function Sidebar({ activeView, onViewChange, collapsed, onCollapsedChange }: SidebarProps) {
  return (
    <>
      <DesktopSidebar
        activeView={activeView}
        onViewChange={onViewChange}
        collapsed={collapsed}
        onCollapsedChange={onCollapsedChange}
      />
      <MobileSidebar activeView={activeView} onViewChange={onViewChange} />
    </>
  )
}
