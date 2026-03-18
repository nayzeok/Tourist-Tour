export interface HotelPrice {
  value: number
  currency: string
  per: 'night' | 'stay'
}

export interface HotelCoordinates {
  lat?: number
  lon?: number
}

export interface CancellationPolicy {
  freeCancellationPossible: boolean
  freeCancellationDeadlineLocal?: string | null // "2025-08-19T17:41"
  freeCancellationDeadlineUtc?: string | null // "2025-08-19T14:41Z"
  penaltyAmount?: number | null
  penaltyCurrency?: string // RUB, USD и т.д.
}

export interface Hotel {
  id: string
  name: string
  address: string
  coordinates?: HotelCoordinates
  stars?: number
  thumbnail?: string[] | null
  amenities?: string[] // коды для иконок
  roomName?: string
  mealLabel?: string | null
  payOnSite?: boolean
  price?: HotelPrice
  guestsNote?: string
  left?: number
  rating?: number
  reviewsCount?: number
  checkInTime?: string // "14:00"
  checkOutTime?: string // "12:00"
  timeZone?: string // "Europe/London"
  cancellationPolicy?: CancellationPolicy
}
