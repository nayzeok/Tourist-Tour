<script setup lang="ts">
import { reactive, ref } from 'vue'
import { resetPassword } from '~/src/shared/api/auth'

definePageMeta({
  layout: 'empty',
})

const route = useRoute()
const token = computed(() =>
  typeof route.query.token === 'string' ? route.query.token.trim() : '',
)

const form = reactive({
  password: '',
  confirmPassword: '',
})

const pending = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const submit = async () => {
  errorMessage.value = null
  successMessage.value = null

  if (!token.value) {
    errorMessage.value = 'Ссылка недействительна или не содержит токен.'
    return
  }

  if (form.password.length < 8) {
    errorMessage.value = 'Пароль должен содержать минимум 8 символов.'
    return
  }

  if (form.password !== form.confirmPassword) {
    errorMessage.value = 'Пароли не совпадают.'
    return
  }

  pending.value = true
  try {
    await resetPassword({
      token: token.value,
      password: form.password,
    })
    successMessage.value = 'Пароль успешно обновлен. Теперь можно войти.'
  } catch (error) {
    if (error && typeof error === 'object' && 'data' in error) {
      const data = (error as { data?: { message?: string } }).data
      if (data?.message) {
        errorMessage.value = data.message
      } else {
        errorMessage.value = 'Не удалось обновить пароль.'
      }
    } else if (error instanceof Error) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Не удалось обновить пароль.'
    }
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="h-[calc(100vh-65px)] bg-slate-100 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-xl">
      <section class="bg-white rounded-2xl p-8 shadow-sm">
        <header class="mb-6">
          <h1 class="text-2xl font-semibold">
            Восстановление пароля
          </h1>
          <p class="mt-2 text-sm text-gray-500">
            Введите новый пароль для вашего аккаунта.
          </p>
        </header>

        <form class="space-y-5" @submit.prevent="submit">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700" for="new-password">
              Новый пароль
            </label>
            <input
              id="new-password"
              v-model="form.password"
              autocomplete="new-password"
              class="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              minlength="8"
              placeholder="Введите новый пароль"
              required
              type="password"
            >
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700" for="confirm-new-password">
              Подтвердите пароль
            </label>
            <input
              id="confirm-new-password"
              v-model="form.confirmPassword"
              autocomplete="new-password"
              class="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              minlength="8"
              placeholder="Повторите новый пароль"
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
            class="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-white transition duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/60"
            :disabled="pending"
            type="submit"
          >
            {{ pending ? 'Сохраняем...' : 'Сохранить новый пароль' }}
          </button>

          <div class="flex-center">
            <NuxtLink class="text-sm text-gray-500 hover:text-primary" to="/login">
              Вернуться ко входу
            </NuxtLink>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>
