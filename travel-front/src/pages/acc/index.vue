<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '~/src/shared/store'

definePageMeta({
  layout: 'acc',
  middleware: ['auth'],
})

const auth = useAuthStore()
await auth.ensureStatus()

const user = computed(() => auth.user)
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold">
        Профиль
      </h1>
      <p class="mt-1 text-sm text-gray-500">
        Управляйте персональными данными и бронированиями.
      </p>
    </div>

    <div v-if="user" class="grid gap-4">
      <div class="rounded-xl border border-gray-200 p-4">
        <h2 class="text-lg font-semibold">
          Контакты
        </h2>
        <dl class="mt-3 grid gap-2 text-sm">
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <dt class="text-gray-500">
              Email
            </dt>
            <dd class="font-medium">
              {{ user.email }}
            </dd>
          </div>
          <div
            v-if="user.phone"
            class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
          >
            <dt class="text-gray-500">
              Телефон
            </dt>
            <dd class="font-medium">
              {{ user.phone }}
            </dd>
          </div>
        </dl>
      </div>

      <div class="rounded-xl border border-gray-200 p-4">
        <h2 class="text-lg font-semibold">
          Общая информация
        </h2>
        <dl class="mt-3 grid gap-2 text-sm">
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <dt class="text-gray-500">
              Имя
            </dt>
            <dd class="font-medium">
              {{ user.firstName || '—' }}
            </dd>
          </div>
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <dt class="text-gray-500">
              Фамилия
            </dt>
            <dd class="font-medium">
              {{ user.lastName || '—' }}
            </dd>
          </div>
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <dt class="text-gray-500">
              Роль
            </dt>
            <dd class="font-medium uppercase">
              {{ user.role }}
            </dd>
          </div>
        </dl>
      </div>
    </div>

    <div v-else class="text-sm text-gray-500">
      Не удалось загрузить информацию о профиле.
    </div>
  </div>
</template>
