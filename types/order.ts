import { Customer } from "."

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  size?: string
  color?: string
}

export interface ShippingAddress {
  name?: string
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled"
export type PaymentMethod = "card" | "cash_app" | "affirm" | "apple_pay" | "google_pay" | "shop_pay" | "gift_card"

export interface Order {
  _id: string
  squareOrderId?: string
  customerId: Customer | string
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  discountCode?: string
  discountAmount?: number
  giftCardUsed?: number
  paymentMethod: PaymentMethod
  status: OrderStatus
  shippingAddress?: ShippingAddress
  trackingNumber?: string
  notes?: string
  createdAt: string
  updatedAt: string
}