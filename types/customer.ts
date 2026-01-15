export interface CustomerAddress {
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

export interface CustomerPreferences {
  sizes?: {
    tops?: string[]
    bottoms?: string[]
    sets?: string[]
    dresses?: string[]
  }
  colors?: string[]
}


export type CustomerRole = "customer" | "admin"

export interface Customer {
  _id?: string
  squareCustomerId: string
  email: string
  role: CustomerRole

  firstName?: string
  lastName?: string
  phoneNumber?: string
  address?: CustomerAddress

  subscribedToNewsletter: boolean
  subscribedToSales: boolean
  giftCardBalance: number

  orders: string[]
  favorites: string[]

  preferences?: CustomerPreferences
  authProvider?: String
  sessionToken?: string
  sessionExpiry?: Date
  lastPasswordReset?: Date
  createdAt: Date | String
  updatedAt: Date | String
}

