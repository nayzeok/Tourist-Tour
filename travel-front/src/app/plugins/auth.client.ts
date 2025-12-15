import { defineNuxtPlugin } from '#app'
import { useAuthStore } from '~/src/shared/store'

export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()

  if (auth.statusFetched) {
    return
  }

  try {
    await auth.ensureStatus()
  } catch {
    // client will handle redirect if needed later
  }
})
