import { defineNuxtPlugin } from '#app'
import { useAuthStore } from '~/src/shared/store'

export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()

  if (auth.statusFetched) {
    return
  }

  try {
    await auth.ensureStatus(true)
  } catch {
    // ignore status errors during SSR bootstrap
  }

  console.log(auth.isAuthenticated)
})
