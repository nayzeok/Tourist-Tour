<script setup lang="ts">
import { reactive, ref } from 'vue'
import { updatePassword } from '~/src/shared/api/user'
import { useAuthStore } from '~/src/shared/store'

definePageMeta({
  layout: 'acc',
  middleware: ['auth'],
})

const auth = useAuthStore()
await auth.ensureStatus()

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const pending = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const extractErrorMessage = (error: unknown) => {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: { message?: string } }).data
    if (data?.message) {
      return data.message
    }
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Не удалось изменить пароль. Попробуйте позже.'
}

const handleSubmit = async () => {
  errorMessage.value = null
  successMessage.value = null

  if (form.newPassword !== form.confirmPassword) {
    errorMessage.value = 'Пароли не совпадают'
    return
  }

  pending.value = true

  try {
    await updatePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    })

    successMessage.value = 'Пароль успешно обновлён.'
    form.currentPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
  } catch (error) {
    errorMessage.value = extractErrorMessage(error)
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="max-w-xl space-y-6">
    <div>
      <h1 class="text-2xl font-semibold">
        Изменить пароль
      </h1>
      <p class="mt-1 text-sm text-gray-500">
        Используйте сложный пароль и храните его в защищённом месте.
      </p>
    </div>

    <form class="space-y-5" @submit.prevent="handleSubmit">
      <div class="space-y-1">
        <label class="text-sm font-medium text-gray-700" for="current-password">
          Текущий пароль
        </label>
        <input
          id="current-password"
          v-model="form.currentPassword"
          autocomplete="current-password"
          class="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          required
          type="password"
        >
      </div>

      <div class="space-y-1">
        <label class="text-sm font-medium text-gray-700" for="new-password">
          Новый пароль
        </label>
        <input
          id="new-password"
          v-model="form.newPassword"
          autocomplete="new-password"
          class="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          minlength="8"
          required
          type="password"
        >
      </div>

      <div class="space-y-1">
        <label class="text-sm font-medium text-gray-700" for="confirm-password">
          Подтверждение пароля
        </label>
        <input
          id="confirm-password"
          v-model="form.confirmPassword"
          autocomplete="new-password"
          class="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          minlength="8"
          required
          type="password"
        >
      </div>

      <p v-if="errorMessage" class="text-sm text-red-500">
        {{ errorMessage }}
      </p>

      <p v-if="successMessage" class="text-sm text-green-600">
        {{ successMessage }}
      </p>

      <button
        class="rounded-xl bg-primary px-5 py-3 font-semibold text-white transition duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/60"
        :disabled="pending"
        type="submit"
      >
        <span v-if="pending" class="inline-flex items-center gap-2">
          <span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
          <span>Сохраняем...</span>
        </span>
        <span v-else>
          Сохранить
        </span>
      </button>
    </form>
  </div>
</template>
