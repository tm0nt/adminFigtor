// types/device.ts
export type DevicePlatform = 'WEB' | 'MOBILE_ANDROID' | 'MOBILE_IOS' | 'DESKTOP_WINDOWS' | 'DESKTOP_MAC' | 'DESKTOP_LINUX'

export interface Device {
  id: string
  userId: string
  deviceId: string
  platform: DevicePlatform
  userAgent: string | null
  ip: string | null
  appVersion: string | null
  lastSeenAt: string | null
  createdAt: string
  updatedAt: string
}

export interface DeviceWithInfo extends Device {
  isCurrentDevice: boolean
  browserName?: string
  osName?: string
  deviceType?: 'desktop' | 'mobile' | 'tablet'
}
