export interface PublicUser {
  id: string
  email: string
  role: string
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
}

export interface UserBooking {
  id: string
  number: string
  status: string
  propertyId?: string | null
  arrivalDate?: string | null
  departureDate?: string | null
  guestsCount?: number | null
  totalAmount?: number | null
  currency?: string | null
  payload?: unknown
  createdAt: string
  updatedAt: string
}

export interface PaginatedResult<T> {
  total: number
  page: number
  pageSize: number
  items: T[]
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}
