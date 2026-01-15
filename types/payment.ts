import { Customer, PaymentMethod } from "."

export type PaymentStatus = "completed" | "pending" | "failed" | "refunded"

export interface Payment {
  _id: string
  orderId: string
  customerId?: Customer | string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  transactionId?: string
  refundedAmount?: number
  refundedAt?: string
  createdAt: string
  updatedAt: string
}