export type GiftCardStatus = "active" | "redeemed" | "expired"
export type GiftCardType = "digital" | "physical"

export interface GiftCard {
  _id: string
  squareGiftCardId?: string
  amount: number
  balance: number
  code: string
  type: GiftCardType
  recipient?: {
    email?: string
    name?: string
  }
  sender?: {
    name?: string
    email?: string
  }
  message?: string
  status: GiftCardStatus
  expiresAt?: string
  redeemedAt?: string
  createdAt: string
}