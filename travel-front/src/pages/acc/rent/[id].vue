<script setup lang="ts">
import { useAuthStore } from '~/src/shared/store'

definePageMeta({ layout: 'acc', middleware: ['auth'] })

const route = useRoute()
const { public: { apiUrl } } = useRuntimeConfig()
const auth = useAuthStore()

const bookingId = route.params.id as string

type BookingStatus = 'new' | 'active' | 'cancelled' | 'completed' | 'archived'
type PaymentStatus = 'unpaid' | 'partial' | 'paid'

interface RentBooking {
  id: string
  carId: string
  carName: string
  carImage?: string
  city?: string
  startDate: string
  endDate: string
  pickupLocation?: string
  returnLocation?: string
  firstName: string
  lastName: string
  phone: string
  totalAmount?: number
  depositAmount?: number
  depositStatus?: 'held' | 'captured' | 'released'
  paidAmount?: number
  status: BookingStatus
  paymentStatus: PaymentStatus
  createdAt: string
  rentprogId?: string
}

const { data: booking, error, refresh } = await useAsyncData<RentBooking | null>(
  `rent-booking-${bookingId}`,
  () => $fetch<RentBooking>(`${apiUrl}/rent-user/bookings/${bookingId}`, {
    credentials: 'include',
  }).catch(() => null),
)

if (!booking.value) {
  await navigateTo('/acc/rent')
}

// Показываем успешную оплату если вернулись с PayKeeper
const justPaid = computed(() => route.query.paid === '1')

// ─── Форматирование ───────────────────────────────────────────────────────────
function formatDate(d: string) {
  return new Date(d).toLocaleString('ru-RU', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
function formatPrice(n?: number | null) {
  if (!n) return '—'
  return n.toLocaleString('ru-RU') + ' ₽'
}
function daysCount(start: string, end: string) {
  return Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000))
}
function daysWord(n: number) {
  if (n % 10 === 1 && n % 100 !== 11) return 'день'
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'дня'
  return 'дней'
}

const statusLabels: Record<BookingStatus, string> = {
  new: 'Новая', active: 'Активная', cancelled: 'Отменена', completed: 'Завершена', archived: 'Архив',
}
const statusColors: Record<BookingStatus, string> = {
  new: 'bg-blue-50 text-blue-700',
  active: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-600',
  completed: 'bg-gray-100 text-gray-600',
  archived: 'bg-gray-100 text-gray-400',
}
const paymentLabels: Record<PaymentStatus, string> = {
  unpaid: 'Не оплачено', partial: 'Оплачено частично', paid: 'Оплачено',
}
const paymentColors: Record<PaymentStatus, string> = {
  unpaid: 'text-red-500', partial: 'text-yellow-600', paid: 'text-green-600',
}

// ─── Оплата ──────────────────────────────────────────────────────────────────
const paying = ref(false)
const payError = ref<string | null>(null)

async function pay() {
  if (!booking.value) return
  paying.value = true
  payError.value = null
  try {
    const res = await $fetch<{ paymentLink: string }>(`${apiUrl}/rent-user/bookings/${bookingId}/pay`, {
      method: 'POST',
      credentials: 'include',
    })
    window.location.href = res.paymentLink
  } catch (e: any) {
    payError.value = e?.data?.message || 'Не удалось создать ссылку на оплату'
    paying.value = false
  }
}

// ─── Отмена ───────────────────────────────────────────────────────────────────
const cancelling = ref(false)

async function cancel() {
  if (!confirm('Отменить бронирование?')) return
  cancelling.value = true
  try {
    await $fetch(`${apiUrl}/rent-user/bookings/${bookingId}/cancel`, {
      method: 'POST',
      credentials: 'include',
    })
    await refresh()
  } catch (e: any) {
    alert(e?.data?.message || 'Ошибка при отмене')
  } finally {
    cancelling.value = false
  }
}

const canPay = computed(() =>
  booking.value &&
  booking.value.paymentStatus !== 'paid' &&
  !['cancelled', 'completed', 'archived'].includes(booking.value.status) &&
  (booking.value.totalAmount ?? 0) > 0
)

const canCancel = computed(() =>
  booking.value &&
  ['new', 'active'].includes(booking.value.status) &&
  booking.value.paymentStatus !== 'paid'
)

const canRequestCancel = computed(() =>
  booking.value &&
  ['new', 'active'].includes(booking.value.status) &&
  booking.value.paymentStatus === 'paid'
)

// ─── Попап отмены оплаченной брони ───────────────────────────────────────────
const cancelRequestOpen = ref(false)
const sendingCancelRequest = ref(false)
const cancelRequestSent = ref(false)

async function sendCancelRequest() {
  if (!booking.value) return
  sendingCancelRequest.value = true
  try {
    await $fetch(`${apiUrl}/rent-user/bookings/${bookingId}/cancel-request`, {
      method: 'POST',
      credentials: 'include',
    })
    cancelRequestSent.value = true
  } catch (e: any) {
    alert(e?.data?.message || 'Ошибка отправки заявки')
  } finally {
    sendingCancelRequest.value = false
  }
}

const days = computed(() =>
  booking.value ? daysCount(booking.value.startDate, booking.value.endDate) : 0
)

const debt = computed(() => {
  const b = booking.value
  if (!b) return null
  const total = b.totalAmount ?? 0
  const paid = b.paidAmount ?? 0
  return total - paid > 0 ? total - paid : null
})
</script>

<template>
  <div v-if="booking">
    <!-- Навигация -->
    <div class="flex items-center gap-2 mb-6 text-sm">
      <NuxtLink to="/acc/rent" class="text-gray-400 hover:text-primary transition">
        ← Аренда авто
      </NuxtLink>
    </div>

    <!-- Успешная оплата -->
    <div v-if="justPaid" class="mb-5 bg-green-50 border border-green-100 rounded-2xl p-4 flex items-start gap-3">
      <span class="text-2xl">✅</span>
      <div>
        <p class="font-semibold text-green-800">Оплата прошла успешно</p>
        <p class="text-sm text-green-700 mt-0.5">Бронирование подтверждено. Детали ниже.</p>
      </div>
    </div>

    <!-- Шапка -->
    <div class="flex items-start gap-4 mb-6">
      <div class="rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100" style="width:112px;height:80px;min-width:112px;position:relative">
        <img
          v-if="booking.carImage"
          :src="booking.carImage"
          :alt="booking.carName"
          style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain"
        >
        <div v-else class="w-full h-full flex items-center justify-center text-3xl">🚗</div>
      </div>
      <div class="flex-1 min-w-0">
        <h1 class="text-xl font-bold truncate">{{ booking.carName }}</h1>
        <p v-if="booking.city" class="text-sm text-gray-400 mt-0.5">📍 {{ booking.city }}</p>
        <div class="flex flex-wrap gap-2 mt-2">
          <span :class="['text-xs font-medium px-2.5 py-1 rounded-lg', statusColors[booking.status]]">
            {{ statusLabels[booking.status] }}
          </span>
          <span :class="['text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-50', paymentColors[booking.paymentStatus]]">
            {{ paymentLabels[booking.paymentStatus] }}
          </span>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <!-- Период -->
      <div class="rounded-2xl border border-gray-100 p-4">
        <p class="text-xs text-gray-400 uppercase font-medium tracking-wide mb-3">Период аренды</p>
        <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <p class="text-xs text-gray-400 mb-0.5">Начало</p>
            <p class="font-semibold">{{ formatDate(booking.startDate) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 mb-0.5">Конец</p>
            <p class="font-semibold">{{ formatDate(booking.endDate) }}</p>
          </div>
        </div>
        <p class="text-sm text-primary font-medium mt-3">
          Итого: {{ days }} {{ daysWord(days) }}
        </p>
        <div v-if="booking.pickupLocation || booking.returnLocation" class="mt-3 space-y-1">
          <p v-if="booking.pickupLocation" class="text-sm text-gray-600">
            <span class="text-gray-400 text-xs">Выдача:</span> {{ booking.pickupLocation }}
          </p>
          <p v-if="booking.returnLocation" class="text-sm text-gray-600">
            <span class="text-gray-400 text-xs">Возврат:</span> {{ booking.returnLocation }}
          </p>
        </div>
      </div>

      <!-- Финансы -->
      <div class="rounded-2xl border border-gray-100 p-4">
        <p class="text-xs text-gray-400 uppercase font-medium tracking-wide mb-3">Стоимость</p>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Аренда ({{ days }} {{ daysWord(days) }})</span>
            <span class="font-bold text-lg">{{ formatPrice(booking.totalAmount) }}</span>
          </div>
          <div v-if="(booking.paidAmount ?? 0) > 0" class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Оплачено</span>
            <span class="font-semibold text-green-600">{{ formatPrice(booking.paidAmount) }}</span>
          </div>
          <div v-if="debt" class="flex items-center justify-between pt-2 border-t border-gray-100">
            <span class="text-sm font-medium">К оплате</span>
            <span class="font-bold text-red-500">{{ formatPrice(debt) }}</span>
          </div>
          <div v-if="booking.depositAmount" class="flex items-center justify-between pt-2 border-t border-gray-100">
            <span class="text-sm text-gray-600">Залог</span>
            <div class="text-right">
              <span class="font-medium">{{ formatPrice(booking.depositAmount) }}</span>
              <span class="ml-1.5 text-xs text-gray-400">· оплачивается при выдаче авто</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Арендатор -->
      <div class="rounded-2xl border border-gray-100 p-4">
        <p class="text-xs text-gray-400 uppercase font-medium tracking-wide mb-3">Арендатор</p>
        <div class="grid sm:grid-cols-2 gap-3 text-sm">
          <div>
            <p class="text-xs text-gray-400 mb-0.5">ФИО</p>
            <p class="font-medium">{{ booking.firstName }} {{ booking.lastName }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 mb-0.5">Телефон</p>
            <p class="font-medium">{{ booking.phone }}</p>
          </div>
        </div>
      </div>

      <!-- Номер брони -->
      <div class="rounded-2xl bg-gray-50 p-4 text-xs text-gray-400 space-y-1">
        <p>Бронирование: <span class="font-mono text-gray-600">{{ booking.id }}</span></p>
        <p v-if="booking.rentprogId">ID в RentProg: <span class="font-mono text-gray-600">{{ booking.rentprogId }}</span></p>
        <p>Создано: {{ new Date(booking.createdAt).toLocaleString('ru-RU') }}</p>
      </div>

      <!-- Действия -->
      <div class="space-y-2 pt-1">
        <div class="flex flex-col sm:flex-row gap-3">
          <!-- Оплата -->
          <button
            v-if="canPay"
            :disabled="paying"
            class="flex-1 h-12 bg-primary text-white rounded-2xl font-semibold text-base hover:opacity-90 transition disabled:opacity-50"
            @click="pay"
          >
            {{ paying ? 'Подготовка оплаты...' : `Оплатить ${formatPrice(debt ?? booking.totalAmount)}` }}
          </button>

          <!-- Отмена (неоплаченная) -->
          <button
            v-if="canCancel"
            :disabled="cancelling"
            class="h-12 px-6 border border-red-200 text-red-500 rounded-2xl font-medium text-sm hover:bg-red-50 transition disabled:opacity-50"
            @click="cancel"
          >
            {{ cancelling ? 'Отмена...' : 'Отменить' }}
          </button>

          <!-- Отмена (оплаченная — через администратора) -->
          <button
            v-if="canRequestCancel"
            class="h-12 px-6 border border-red-200 text-red-500 rounded-2xl font-medium text-sm hover:bg-red-50 transition"
            @click="cancelRequestOpen = true"
          >
            Отменить
          </button>

          <NuxtLink
            to="/acc/rent"
            class="h-12 px-6 border border-gray-200 rounded-2xl font-medium text-sm hover:bg-gray-50 transition flex items-center justify-center"
          >
            Назад к списку
          </NuxtLink>
        </div>
        <p v-if="canPay" class="text-xs text-gray-400 text-center">Безопасная оплата через PayKeeper</p>
        <p v-if="payError" class="text-red-500 text-xs text-center">{{ payError }}</p>
      </div>
    </div>
  </div>

  <!-- Попап: отмена оплаченного бронирования -->
  <Teleport to="body">
    <div
      v-if="cancelRequestOpen"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      @click.self="cancelRequestOpen = false"
    >
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <div v-if="!cancelRequestSent">
          <h3 class="font-bold text-lg mb-2">Отмена бронирования</h3>
          <p class="text-sm text-gray-600 mb-4">
            Отмена оплаченного бронирования возможна только через администратора.
            После отправки заявки мы свяжемся с вами для уточнения деталей.
          </p>
          <div class="flex gap-3">
            <button
              :disabled="sendingCancelRequest"
              class="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
              @click="sendCancelRequest"
            >
              {{ sendingCancelRequest ? 'Отправка...' : 'Отправить заявку на отмену' }}
            </button>
            <button
              class="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
              @click="cancelRequestOpen = false"
            >
              Назад
            </button>
          </div>
        </div>
        <div v-else class="text-center py-4">
          <div class="text-4xl mb-3">✅</div>
          <h3 class="font-bold text-lg mb-2">Заявка отправлена</h3>
          <p class="text-sm text-gray-600 mb-4">Администратор свяжется с вами в ближайшее время.</p>
          <button
            class="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition"
            @click="cancelRequestOpen = false"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
