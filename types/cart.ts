export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  size?: string
  color?: string
  availableSizes?: string[]
  availableColors?: string[]
  image?: string
}

export interface Cart {
  _id?: string
  customerId?: string
  sessionId?: string
  items: CartItem[]
  subtotal: number
  discountCode?: string
  discountAmount: number
  giftCardCode?: string
  giftCardAmount: number
  abandonedAt?: Date
  notificationSent: boolean
  createdAt: Date
  updatedAt: Date
}
