import { Product } from "."

export interface Inventory {
  _id: string
  sku: string
  productId: string | Product
  size: string
  color: string
  quantity: number
  reserved: number
  restockThreshold: number
  lastRestocked?: string
  createdAt: string
  updatedAt: string
}