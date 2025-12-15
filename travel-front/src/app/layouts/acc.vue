<script setup lang="ts">
import { computed, reactive } from 'vue'
import { ru } from '#ui/locale'
import { useAuthStore } from '~/src/shared/store'

const accMenu = reactive({
  booking: {
    title: 'Мои бронирования',
    url: '/acc/orders',
  },
  changePassword: {
    title: 'Изменить пароль',
    url: '/acc/change-password',
  },
})

const auth = useAuthStore()
await auth.ensureStatus()

const displayName = computed(() => {
  const currentUser = auth.user
  if (!currentUser) {
    return 'Личный кабинет'
  }

  const parts = [currentUser.firstName, currentUser.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()

  return parts.length > 0 ? parts : currentUser.email
})

const handleLogout = async () => {
  await auth.logout()
  await navigateTo('/login')
}
</script>

<template>
  <UApp :locale="ru">
    <NuxtLoadingIndicator />
    <div class="min-h-screen flex flex-col">
      <div class="px-4 lg:px-0 bg-primary">
        <HeaderWidget />
      </div>

      <div class="px-4 max-w-240 mx-auto grid grid-cols-12 items-start gap-4 py-8">
        <div class="col-span-12 lg:col-span-3">
          <div class=" bg-white rounded-2xl p-4 space-y-6">
            <div class="space-y-1">
              <p class="text-lg font-semibold">
                {{ displayName }}
              </p>
              <p v-if="auth.user?.email" class="text-sm text-gray-500">
                {{ auth.user.email }}
              </p>
            </div>

            <div class="grid gap-2">
              <NuxtLink
                v-for="item in accMenu"
                :key="item.url"
                class="rounded-xl px-3 py-2 transition-colors duration-200" 
                :class="[
                  $route.path === item.url
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'hover:bg-gray-100',
                ]"
                :to="item.url"
              >
                {{ item.title }}
              </NuxtLink>
            </div>

            <button
              class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors duration-200 hover:bg-gray-100"
              type="button"
              @click="handleLogout"
            >
              Выйти
            </button>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-9 bg-white rounded-2xl p-4">
          <slot />
        </div>
      </div>
    
      <FooterWidget class="mt-auto" />
    </div>
  </UApp>
</template>
