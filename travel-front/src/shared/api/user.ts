import { apiFetch } from './http'
import type {
  ChangePasswordPayload,
  PaginatedResult,
  PublicUser,
  UserBooking,
} from '~/src/shared/types'

export function fetchCurrentUser() {
  return apiFetch<{ user: PublicUser | null }>('/users/me')
}

export function fetchUserBookings(
  query: {
    page?: number
    pageSize?: number
  } = {}
) {
  return apiFetch<PaginatedResult<UserBooking>>('/users/bookings', {
    query,
  })
}

export function updatePassword(payload: ChangePasswordPayload) {
  return apiFetch<{ success: boolean }>('/users/password', {
    method: 'PATCH',
    body: payload,
  })
}
