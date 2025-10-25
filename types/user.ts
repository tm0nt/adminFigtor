// types/user.ts
export type PersonType = 'PF' | 'PJ'

export interface User {
  id: string
  email: string
  name: string | null
  company: string | null
  phone: string | null
  createdAt: string
  updatedAt: string
}

export interface UserProfile {
  id: string
  userId: string
  personType: PersonType
  cpf: string | null
  cnpj: string | null
  companyName: string | null
  stateReg: string | null
  birthDate: string | null
  phone: string | null
  createdAt: string
  updatedAt: string
}

export interface Address {
  id: string
  userId: string
  label: string | null
  line1: string
  line2: string | null
  city: string
  number: string | null // ← adicione este campo
  state: string
  postalCode: string
  country: string
  createdAt: string
  updatedAt: string
}

export interface UserWithProfile {
  user: User
  profile: UserProfile | null
  billingAddress: Address | null
}

export interface UpdateUserInput {
  name?: string
  company?: string
  email?: string
  phone?: string
  profile?: {
    personType?: PersonType
    cpf?: string
    cnpj?: string
    companyName?: string
    birthDate?: string
  }
  billingAddress?: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    postalCode?: string
  }
}
