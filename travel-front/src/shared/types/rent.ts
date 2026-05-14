export interface RentCity {
  id: string
  name: string
}

export interface RentCarOption {
  id: string
  name: string
  price: number
}

export interface RentCar {
  id: string
  name: string
  brand: string
  model: string
  year?: number
  class?: string
  bodyType?: string
  transmission?: string
  fuel?: string
  color?: string
  engineCapacity?: string
  enginePower?: string
  driveUnit?: string
  seats?: string
  images: string[]
  pricePerDay: number
  deposit?: number | null      // залог (только в детальной карточке)
  franchise?: number | null    // страховая франшиза
  minRentDays: number
  mileagePerDay?: number | null
  city?: string | null
  insurance?: string | null
  minAge?: number | null
  minExperience?: number | null
  documents?: string | null
  returnFuel?: string | null
  extraOptions?: RentCarOption[]
  pickupLocations?: string[]
  returnLocations?: string[]
  pricePeriods?: { period: string; price: number }[]
  available?: boolean
}

export interface RentCarSearchParams {
  cityId: string
  startDate: string   // ISO datetime "2025-01-15T10:00"
  endDate: string     // ISO datetime "2025-01-20T10:00"
}

export interface RentBookingPayload {
  carId: string
  cityId: string
  startDate: string
  endDate: string
  pickupLocation?: string
  returnLocation?: string
  extraOptions?: string[]
  firstName: string
  lastName: string
  phone: string
}

export interface RentBooking {
  id: string
  number: string
  car: Pick<RentCar, 'id' | 'name' | 'brand' | 'model' | 'images'>
  cityId: string
  startDate: string
  endDate: string
  daysCount: number
  pickupLocation?: string | null
  returnLocation?: string | null
  extraOptions?: RentCarOption[]
  totalAmount?: number | null
  paymentStatus: 'unpaid' | 'partial' | 'paid'
  status: 'new' | 'active' | 'cancelled' | 'completed' | 'archived'
  createdAt: string
}
