import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  fetchStatus as fetchAuthStatus,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  requestPassword,
} from '~/src/shared/api/auth'
import type { PublicUser } from '~/src/shared/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<PublicUser | null>(null)
  const statusFetched = ref(false)
  const statusPending = ref(false)

  const isAuthenticated = computed(() => Boolean(user.value))

  const setUser = (nextUser: PublicUser | null) => {
    user.value = nextUser
  }

  const ensureStatus = async (force = false) => {
    if (statusFetched.value && !force) {
      return user.value
    }

    statusPending.value = true

    try {
      const response = await fetchAuthStatus()
      user.value = response.user
      statusFetched.value = true
      return user.value
    } catch (error: unknown) {
      user.value = null
      statusFetched.value = true
      return null
    } finally {
      statusPending.value = false
    }
  }

  const login = async (payload: { email: string; password: string }) => {
    const response = await loginRequest(payload)
    user.value = response.user
    statusFetched.value = true
    return response.user
  }

  const register = async (payload: {
    email: string
    firstName?: string
    lastName?: string
    phone?: string
    password: string
  }) => {
    const response = await registerRequest(payload)
    user.value = response.user
    statusFetched.value = true
    return response.user
  }

  const logout = async () => {
    await logoutRequest()
    user.value = null
    statusFetched.value = true
  }

  const requestPasswordReset = async (payload: { email: string }) => {
    const response = await requestPassword(payload)
    return response.message
  }

  return {
    user,
    statusFetched,
    statusPending,
    isAuthenticated,
    ensureStatus,
    login,
    register,
    logout,
    requestPasswordReset,
    setUser,
  }
})
