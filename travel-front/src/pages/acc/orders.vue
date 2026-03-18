<script setup lang="ts">
import { computed, ref } from 'vue'
import { cancelBooking as apiCancelBooking, calculateCancellationPenalty } from '~/src/shared/api/reservation'
import { fetchUserBookings } from '~/src/shared/api/user'
import { useAuthStore } from '~/src/shared/store'
import { formatISOToDate, formatRubles } from '~/src/shared/utils'
import type { UserBooking } from '~/src/shared/types'

definePageMeta({
  layout: 'acc',
  middleware: ['auth'],
})

const auth = useAuthStore()
const toast = useToast()
await auth.ensureStatus()

const bookings = ref<UserBooking[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 10
const pending = ref(false)
const errorMessage = ref<string | null>(null)

const bookingToCancel = ref<UserBooking | null>(null)
const cancelling = ref(false)
const penaltyAmount = ref<number | null>(null)
const penaltyLoading = ref(false)

const cancelModalOpen = computed({
  get: () => !!bookingToCancel.value,
  set: (v) => {
    if (!v && !cancelling.value) {
      bookingToCancel.value = null
    }
  },
})

const totalPages = computed(() => {
  if (total.value === 0) {
    return 1
  }
  return Math.max(1, Math.ceil(total.value / pageSize))
})

const hasBookings = computed(() => bookings.value.length > 0)

const canCancelBooking = (booking: UserBooking) => {
  const s = (booking.status || '').toLowerCase()
  return s !== 'cancelled' && s !== 'canceled' && s !== 'отменено'
}

const formatBookingStatus = (status?: string | null) => {
  const normalized = (status || '').toLowerCase()
  if (normalized === 'cancelled' || normalized === 'canceled') {
    return 'Отменено'
  }
  if (normalized === 'confirmed') {
    return 'Подтверждено'
  }
  return status || '—'
}

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

const openCancelModal = async (booking: UserBooking) => {
  bookingToCancel.value = booking
  penaltyAmount.value = null
  penaltyLoading.value = true
  try {
    const result = await calculateCancellationPenalty(booking.number)
    penaltyAmount.value = result?.penaltyAmount ?? 0
  } catch {
    penaltyAmount.value = null
  } finally {
    penaltyLoading.value = false
  }
}

const closeCancelModal = () => {
  if (!cancelling.value) {
    bookingToCancel.value = null
    penaltyAmount.value = null
  }
}

const confirmCancel = async () => {
  const booking = bookingToCancel.value
  if (!booking?.number) {
    return
  }

  cancelling.value = true
  try {
    await apiCancelBooking(booking.number, {
      expectedPenaltyAmount: penaltyAmount.value ?? undefined,
    })
    toast.add({
      id: 'booking-cancelled',
      title: 'Бронирование отменено',
      description: `Бронирование № ${booking.number} отменено.`,
      color: 'success',
    })
    bookingToCancel.value = null
    penaltyAmount.value = null
    await loadBookings()
  } catch (error) {
    const message = extractErrorMessage(error)
    toast.add({
      id: 'booking-cancel-error',
      title: 'Не удалось отменить бронирование',
      description: message,
      color: 'error',
    })
  } finally {
    cancelling.value = false
  }
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
                {{ formatBookingStatus(booking.status) }}
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

          <div v-if="canCancelBooking(booking)" class="mt-4 flex justify-end">
            <UButton
              color="neutral"
              variant="soft"
              size="sm"
              :disabled="cancelling"
              @click="openCancelModal(booking)"
            >
              Отменить бронирование
            </UButton>
          </div>
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

    <UModal v-model:open="cancelModalOpen">
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-semibold">
            Отменить бронирование?
          </h3>
          <p class="mt-2 text-sm text-gray-600">
            Бронирование № {{ bookingToCancel?.number }} будет отменено. Это действие нельзя отменить.
          </p>

          <div v-if="penaltyLoading" class="mt-3 text-sm text-gray-500">
            Расчёт штрафа…
          </div>
          <div v-else-if="penaltyAmount != null && penaltyAmount > 0" class="mt-3 rounded-lg bg-red-50 p-3">
            <p class="text-sm font-medium text-red-700">
              Штраф за отмену: {{ formatRubles(penaltyAmount) }}
            </p>
          </div>
          <div v-else-if="penaltyAmount === 0" class="mt-3 rounded-lg bg-green-50 p-3">
            <p class="text-sm font-medium text-green-700">
              Бесплатная отмена — штраф не взимается
            </p>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="soft"
              :disabled="cancelling"
              @click="closeCancelModal()"
            >
              Нет
            </UButton>
            <UButton
              color="error"
              :loading="cancelling"
              @click="confirmCancel"
            >
              Отменить бронирование
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
