// types/subscription.ts
export type PlanName = 'FREE' | 'BASIC' | 'ELITE' | 'UNLIMITED'
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED' | 'PAUSED'
export type PaymentMethod = 'PIX' | 'CREDIT_CARD' | 'BOLETO'
export type PaymentStatus = 'PENDING' | 'AUTHORIZED' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELED'

export interface Plan {
  id: string
  name: PlanName
  displayName: string
  pagesLimitPerMonth: number | null
  isUnlimited: boolean
  priceAmount: string
  currency: string
  features: any
  isActive: boolean
}

export interface Subscription {
  id: string
  userId: string
  planId: string
  status: SubscriptionStatus
  isCurrent: boolean
  startedAt: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  canceledAt: string | null
  externalId: string | null
  plan?: Plan
}

export interface Payment {
  id: string
  userId: string
  subscriptionId: string | null
  provider: string
  method: PaymentMethod
  status: PaymentStatus
  amount: string
  currency: string
  description: string | null
  pixPayload: string | null
  pixQrCode: string | null
  pixExpiresAt: string | null
  paidAt: string | null
  createdAt: string
}

export interface PaymentCard {
  id: string
  userId: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
  holderName: string | null
  isDefault: boolean
}
