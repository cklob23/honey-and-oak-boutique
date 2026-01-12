export type PaymentMethod =
  | "card"
  | "cash_app"
  | "affirm"
  | "apple_pay"
  | "google_pay"
  | "shop_pay"
  | "gift_card"

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  size?: string
  color?: string
}

export interface OrderShippingAddress {
  name?: string
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

export interface Order {
  _id?: string
  squareOrderId?: string
  customerId: string
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  discountCode?: string
  discountAmount?: number
  giftCardUsed?: number
  paymentMethod?: PaymentMethod
  status: OrderStatus
  shippingAddress?: OrderShippingAddress
  trackingNumber?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}
