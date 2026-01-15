export interface SalesMetrics {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    refundRate: number
    previousPeriod: {
        totalRevenue: number
        totalOrders: number
        averageOrderValue: number
        refundRate: number
    }
}

export interface SalesReport {
    salesData: Array<{
        orderId: string
        date: string
        total: number
        status: string
        itemCount: number
    }>
    metrics: SalesMetrics
    salesByCategory: Record<string, number>
}

export interface InventoryReport {
    inventoryData: Array<{
        productId: string
        name: string
        category: string
        price: number
        totalStock: number
    }>
    lowStockItems: Array<{
        productId: string
        name: string
        category: string
        price: number
        totalStock: number
    }>
    totalProducts: number
}