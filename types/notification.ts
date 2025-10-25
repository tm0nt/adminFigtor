// types/notification.ts
export type FeedbackType = 'BUG' | 'FEATURE' | 'RATING' | 'OTHER'
export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'PUSH' | 'SMS'
export type NotificationType = 'SYSTEM' | 'BILLING' | 'USAGE' | 'ALERT' | 'MARKETING'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  channel: NotificationChannel
  title: string
  body: string
  data: Record<string, any> | null
  readAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Feedback {
  id: string
  userId: string
  type: FeedbackType
  message: string
  rating: number | null
  url: string | null
  status: string | null
  metadata: Record<string, any> | null
  createdAt: string
  updatedAt: string
}
