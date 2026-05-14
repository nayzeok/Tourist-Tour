import { apiFetch } from './http'
import type { RentCar, RentBookingPayload, RentBooking, RentCity } from '../types/rent'

export const getRentCities = () =>
  apiFetch<RentCity[]>('/rent/cities')

export const searchRentCars = (params: {
  city: string
  startDate: string
  endDate: string
}) =>
  apiFetch<RentCar[]>('/rent/cars', { params })

export const getRentCar = (id: string, params?: {
  cityId?: string
  startDate?: string
  endDate?: string
}) =>
  apiFetch<RentCar>(`/rent/cars/${id}`, { params })

export const createRentBooking = (payload: RentBookingPayload) =>
  apiFetch<{ booking: RentBooking }>('/rent/bookings', {
    method: 'POST',
    body: payload,
  })

export const getUserRentBookings = (params?: { page?: number; pageSize?: number }) =>
  apiFetch<{ items: RentBooking[]; total: number; page: number; pageSize: number }>(
    '/rent/bookings/my',
    { params },
  )

export const getRentBooking = (id: string) =>
  apiFetch<RentBooking>(`/rent/bookings/${id}`)

export const cancelRentBooking = (id: string) =>
  apiFetch<{ success: boolean }>(`/rent/bookings/${id}/cancel`, { method: 'POST' })
