import { useAuthStore } from '~/src/shared/store'

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()

  console.log(123)

  await auth.ensureStatus()

  if (!auth.isAuthenticated) {
    const redirectTo =
      to.fullPath && to.fullPath !== '/login'
        ? `?redirect=${encodeURIComponent(to.fullPath)}`
        : ''

    return navigateTo(`/login${redirectTo}`)
  }
})
