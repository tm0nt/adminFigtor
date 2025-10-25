// types/conversion.ts
export type ConversionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export interface Conversion {
  id: string
  userId: string
  figmaUrl: string
  outputFormat: string
  status: ConversionStatus
  pagesConverted: number
  fileSize: number | null
  downloadUrl: string | null
  errorMessage: string | null
  createdAt: string
  completedAt: string | null
}
