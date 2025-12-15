<script setup lang="ts">
import { computed, ref } from 'vue'
import { fetchUserBookings } from '~/src/shared/api/user'
import { useAuthStore } from '~/src/shared/store'
import { formatISOToDate, formatRubles } from '~/src/shared/utils'
import type { UserBooking } from '~/src/shared/types'

definePageMeta({
  layout: 'acc',
  middleware: ['auth'],
})

const auth = useAuthStore()
await auth.ensureStatus()

const bookings = ref<UserBooking[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 10
const pending = ref(false)
const errorMessage = ref<string | null>(null)

const totalPages = computed(() => {
  if (total.value === 0) {
    return 1
  }
  return Math.max(1, Math.ceil(total.value / pageSize))
})

const hasBookings = computed(() => bookings.value.length > 0)

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
  return 'Не удалось получить список бронирований.'
}

const loadBookings = async () => {
  pending.value = true
  errorMessage.value = null

  try {
    const response = await fetchUserBookings({
      page: page.value,
      pageSize,
    })

    bookings.value = response.items
    total.value = response.total
  } catch (error) {
    errorMessage.value = extractErrorMessage(error)
  } finally {
    pending.value = false
  }
}

await loadBookings()

const goToPage = async (nextPage: number) => {
  if (nextPage < 1 || nextPage > totalPages.value || nextPage === page.value) {
    return
  }

  page.value = nextPage
  await loadBookings()
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold">
        Мои бронирования
      </h1>
      <p class="mt-1 text-sm text-gray-500">
        Здесь собраны все ваши заказы и их статусы.
      </p>
    </div>

    <div v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
      {{ errorMessage }}
    </div>

    <div
      v-else-if="pending && !hasBookings"
      class="rounded-xl border border-gray-200 px-4 py-12 text-center text-sm text-gray-500"
    >
      Загружаем бронирования...
    </div>

    <div v-else-if="!hasBookings" class="rounded-xl border border-gray-200 px-4 py-12 text-center text-sm text-gray-500">
      У вас пока нет бронирований.
    </div>

    <div v-else class="space-y-4">
      <div class="grid gap-4">
        <article
          v-for="booking in bookings"
          :key="booking.id"
          class="rounded-xl border border-gray-200 p-4"
        >
          <header class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p class="text-xs uppercase text-gray-500">
                Бронирование № {{ booking.number }}
              </p>
              <p class="text-lg font-semibold">
                {{ booking.status }}
              </p>
            </div>
            <div
              v-if="booking.totalAmount !== null && booking.totalAmount !== undefined"
              class="text-right text-sm font-semibold text-primary"
            >
              {{ formatRubles(booking.totalAmount) }}
            </div>
          </header>

          <dl class="mt-4 grid gap-2 text-sm text-gray-600">
            <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
              <dt class="text-gray-500">
                Объект
              </dt>
              <dd class="font-medium">
                {{ booking.propertyId || 'Не указан' }}
              </dd>
            </div>

            <div class="flex flex-wrap gap-4 text-sm">
              <span>
                Заезд: <strong>{{ formatISOToDate(booking.arrivalDate || '') || '—' }}</strong>
              </span>
              <span>
                Выезд: <strong>{{ formatISOToDate(booking.departureDate || '') || '—' }}</strong>
              </span>
              <span>
                Гостей: <strong>{{ booking.guestsCount ?? '—' }}</strong>
              </span>
            </div>

            <div class="text-xs text-gray-400">
              Создано: {{ formatISOToDate(booking.createdAt) || '—' }}
            </div>
          </dl>
        </article>
      </div>

      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm"
      >
        <button
          type="button"
          class="rounded-lg px-3 py-2 font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
          :disabled="page === 1 || pending"
          @click="goToPage(page - 1)"
        >
          Назад
        </button>

        <span class="text-gray-500">
          Страница {{ page }} из {{ totalPages }}
        </span>

        <button
          type="button"
          class="rounded-lg px-3 py-2 font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
          :disabled="page === totalPages || pending"
          @click="goToPage(page + 1)"
        >
          Вперёд
        </button>
      </div>
    </div>
  </div>
</template>
