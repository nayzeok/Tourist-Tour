<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAuthStore } from '~/src/shared/store'

definePageMeta({
  layout: 'empty',
})

const auth = useAuthStore()
const route = useRoute()

await auth.ensureStatus()

if (auth.isAuthenticated) {
  const redirectTo =
    typeof route.query.redirect === 'string' ? route.query.redirect : '/acc'
  await navigateTo(redirectTo || '/acc')
}

const loginForm = reactive({
  email: '',
  password: '',
})

const isVisibleReg = ref(false)

const registerForm = reactive({
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

const loginError = ref<string | null>(null)
const registerError = ref<string | null>(null)
const loginPending = ref(false)
const registerPending = ref(false)

const phoneMask = '+7 (###) ###-##-##'

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
  return 'Произошла ошибка, попробуйте ещё раз.'
}

const handleLogin = async () => {
  loginPending.value = true
  loginError.value = null

  try {
    await auth.login({
      email: loginForm.email.trim().toLowerCase(),
      password: loginForm.password,
    })

    const redirectTo =
      typeof route.query.redirect === 'string' ? route.query.redirect : '/acc'

    await navigateTo(redirectTo || '/acc')
  } catch (error) {
    loginError.value = extractErrorMessage(error)
  } finally {
    loginPending.value = false
  }
}

const handleRegister = async () => {
  registerError.value = null
  const normalizedEmail = registerForm.email.trim().toLowerCase()
  const normalizedFirstName = registerForm.firstName.trim()
  const normalizedLastName = registerForm.lastName.trim()
  const normalizedPhone = registerForm.phone.replace(/\D+/g, '').trim()
  const password = registerForm.password

  if (password.length < 8) {
    registerError.value = 'Пароль должен содержать минимум 8 символов'
    return
  }

  if (password !== registerForm.confirmPassword) {
    registerError.value = 'Пароли не совпадают'
    return
  }

  registerPending.value = true

  try {
    await auth.register({
      email: normalizedEmail,
      firstName: normalizedFirstName || undefined,
      lastName: normalizedLastName || undefined,
      phone: normalizedPhone || undefined,
      password,
    })

    const redirectTo =
      typeof route.query.redirect === 'string' ? route.query.redirect : '/acc'

    await navigateTo(redirectTo || '/acc')
  } catch (error) {
    registerError.value = extractErrorMessage(error)
  } finally {
    registerPending.value = false
  }
}
</script>

<template>
  <div class="h-[calc(100vh-65px)] bg-slate-100 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-xl">
      <div class="flex items-center">
        <button class="flex items-center space-x-2 mb-4 shadow-sm rounded-xl bg-white px-3 py-2" @click="$router.push('/')">
          <span class="flex-center text-black/80">
            <UIcon name="material-symbols-light:arrow-back-ios-new-rounded" size="12" />
          </span>

          <span class="text-xs font-medium text-black/80">
            Вернутся на сайт
          </span>
        </button>
      </div>

      <section v-if="isVisibleReg" class="bg-white rounded-2xl p-8 shadow-sm">
        <header class="mb-6">
          <h1 class="text-2xl font-semibold">
            Регистрация
          </h1>
          <p class="mt-2 text-sm text-gray-500">
            Заполните данные для создания аккаунта.
          </p>
        </header>

        <form class="space-y-5" @submit.prevent="handleRegister">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700" for="register-email">
              Email
            </label>
            
            <input
              id="register-email"
              v-model="registerForm.email"
              autocomplete="email"
              class="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="you@example.com"
              type="email"
            >
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700" for="register-first-name">
                Имя
              </label>
              <input
                id="register-first-name"
                v-model="registerForm.firstName"
                autocomplete="given-name"
                class="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Иван"
                type="text"
              >
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700" for="register-last-name">
                Фамилия
              </label>
              <input
                id="register-last-name"
                v-model="registerForm.lastName"
                autocomplete="family-name"
                class="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Иванов"
                type="text"
              >
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700" for="register-phone">
              Телефон
            </label>
            
            <input
              id="register-phone"
              v-model="registerForm.phone"
              v-maska="phoneMask"
              autocomplete="tel"
              class="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              data-maska="+7 (###) ###-##-##"
              placeholder="+7 (___) ___-__-__"
              type="tel"
            >
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700" for="register-password">
              Пароль
            </label>
            
            <input
              id="register-password"
              v-model="registerForm.password"
              autocomplete="new-password"
              class="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              minlength="8"
              placeholder="Придумайте пароль"
              required
              type="password"
            >
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700" for="register-confirm-password">
              Подтверждение пароля
            </label>
            
            <input
              id="register-confirm-password"
              v-model="registerForm.confirmPassword"
              autocomplete="new-password"
              class="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              minlength="8"
              placeholder="Повторите пароль"
              required
              type="password"
            >
          </div>

          <p v-if="registerError" class="text-sm text-red-500">
            {{ registerError }}
          </p>

          <button
            class="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-white transition duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/60"
            :disabled="registerPending"
            type="submit"
          >
            <span v-if="registerPending" class="inline-flex items-center gap-2">
              <span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
              <span>Создаём аккаунт...</span>
            </span>

            <span v-else>
              Зарегистрироваться
            </span>
          </button>

          <div class="flex-center">
            <button
              class="text-sm text-gray-500 flex-center cursor-pointer hover:text-primary"
              type="button"
              @click="isVisibleReg = false"
            >
              Назад
            </button>
          </div>
        </form>
      </section>

      <section v-else class="bg-white rounded-2xl p-8 shadow-sm">
        <header class="mb-6">
          <h2 class="text-2xl font-semibold">
            Вход в аккаунт
          </h2>
          <p class="mt-2 text-sm text-gray-500">
            Введите email и пароль для авторизации.
          </p>
        </header>

        <form class="space-y-5" @submit.prevent="handleLogin">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700" for="login-email">
              Email
            </label>
            <input
              id="login-email"
              v-model="loginForm.email"
              autocomplete="email"
              class="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="you@example.com"
              required
              type="email"
            >
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700" for="login-password">
              Пароль
            </label>
            <input
              id="login-password"
              v-model="loginForm.password"
              autocomplete="current-password"
              class="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Пароль"
              required
              type="password"
            >
          </div>

          <p v-if="loginError" class="text-sm text-red-500">
            {{ loginError }}
          </p>

          <button
            class="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-white transition duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/60"
            :disabled="loginPending"
            type="submit"
          >
            <span v-if="loginPending" class="inline-flex items-center gap-2">
              <span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
              <span>Входим...</span>
            </span>

            <span v-else>
              Войти
            </span>
          </button>

          <div class="flex-center">
            <button class="text-sm text-gray-500 flex-center cursor-pointer hover:text-primary" type="button" @click="isVisibleReg = true">
              Зарегистрироваться
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>
