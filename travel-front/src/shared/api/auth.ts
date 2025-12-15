import { apiFetch } from './http'
import type { PublicUser } from '~/src/shared/types'

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  user: PublicUser
}

export interface StatusResponse {
  authorized: boolean
  user: PublicUser
}

export interface LogoutResponse {
  success: boolean
}

export interface RequestPasswordPayload {
  email: string
}

export interface RequestPasswordResponse {
  message: string
}

export interface RegisterPayload {
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  password: string
}

export interface RegisterResponse {
  user: PublicUser
}

export function login(payload: LoginPayload) {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: payload,
  })
}

export function register(payload: RegisterPayload) {
  return apiFetch<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: payload,
  })
}

export function fetchStatus() {
  return apiFetch<StatusResponse>('/auth/status')
}

export function logout() {
  return apiFetch<LogoutResponse>('/auth/logout', {
    method: 'POST',
  })
}

export function requestPassword(payload: RequestPasswordPayload) {
  return apiFetch<RequestPasswordResponse>('/auth/request-password', {
    method: 'POST',
    body: payload,
  })
}
