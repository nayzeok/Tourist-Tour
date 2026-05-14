<script setup lang="ts">
definePageMeta({ layout: 'acc', middleware: ['auth'] })

const { public: { apiUrl } } = useRuntimeConfig()

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
  status: BookingStatus
  paymentStatus: PaymentStatus
  paidAmount?: number
  createdAt: string
}

const activeFilter = ref<string>('all')

const filters = [
  { label: 'Все', value: 'all' },
  { label: 'Активные', value: 'active' },
  { label: 'Новые', value: 'new' },
  { label: 'Завершённые', value: 'completed' },
  { label: 'Отменённые', value: 'cancelled' },
]

const { data: bookings, status, refresh } = await useAsyncData<RentBooking[]>(
  () => `rent-bookings-${activeFilter.value}`,
  async () => {
    const params = activeFilter.value !== 'all' ? `?status=${activeFilter.value}` : ''
    return $fetch(`${apiUrl}/rent-user/bookings${params}`, {
      credentials: 'include',
    }).catch(() => []) as Promise<RentBooking[]>
  },
  { watch: [activeFilter] },
)

const isLoading = computed(() => status.value === 'pending')

function formatDate(d: string) {
  return new Date(d).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatPrice(n?: number | null) {
  if (!n) return '—'
  return n.toLocaleString('ru-RU') + ' ₽'
}

function daysCount(start: string, end: string) {
  const diff = new Date(end).getTime() - new Date(start).getTime()
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function daysWord(n: number) {
  if (n % 10 === 1 && n % 100 !== 11) return 'день'
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'дня'
  return 'дней'
}

const statusLabels: Record<BookingStatus, string> = {
  new: 'Новая',
  active: 'Активная',
  cancelled: 'Отменена',
  completed: 'Завершена',
  archived: 'Архив',
}

const statusColors: Record<BookingStatus, string> = {
  new: 'bg-blue-50 text-blue-700',
  active: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-600',
  completed: 'bg-gray-100 text-gray-600',
  archived: 'bg-gray-100 text-gray-400',
}

const paymentLabels: Record<PaymentStatus, string> = {
  unpaid: 'Не оплачено',
  partial: 'Оплачено частично',
  paid: 'Оплачено',
}

const paymentColors: Record<PaymentStatus, string> = {
  unpaid: 'text-red-500',
  partial: 'text-yellow-600',
  paid: 'text-green-600',
}

// Оплата бронирования
const paying = ref<string | null>(null)

async function payBooking(id: string) {
  paying.value = id
  try {
    const res = await $fetch<{ paymentLink: string }>(`${apiUrl}/rent-user/bookings/${id}/pay`, {
      method: 'POST',
      credentials: 'include',
    })
    window.location.href = res.paymentLink
  } catch (e: any) {
    alert(e?.data?.message || 'Не удалось создать ссылку на оплату')
  } finally {
    paying.value = null
  }
}

// Отмена бронирования (неоплаченная)
const cancelling = ref<string | null>(null)

async function cancelBooking(id: string) {
  if (!confirm('Отменить бронирование?')) return
  cancelling.value = id
  try {
    await $fetch(`${apiUrl}/rent-user/bookings/${id}/cancel`, {
      method: 'POST',
      credentials: 'include',
    })
    await refresh()
  } catch (e: any) {
    alert(e?.data?.message || 'Ошибка отмены')
  } finally {
    cancelling.value = null
  }
}

// Отмена оплаченного бронирования — через попап
const cancelRequestBooking = ref<RentBooking | null>(null)
const sendingCancelRequest = ref(false)
const cancelRequestSent = ref(false)

async function sendCancelRequest() {
  if (!cancelRequestBooking.value) return
  sendingCancelRequest.value = true
  try {
    await $fetch(`${apiUrl}/rent-user/bookings/${cancelRequestBooking.value.id}/cancel-request`, {
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

function openCancelRequest(b: RentBooking) {
  cancelRequestBooking.value = b
  cancelRequestSent.value = false
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Аренда авто</h1>
        <p class="text-sm text-gray-500 mt-1">Ваши бронирования автомобилей</p>
      </div>
      <NuxtLink
        to="/acc/rent/my-data"
        class="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:border-primary hover:text-primary transition"
      >
        Мои данные
      </NuxtLink>
    </div>

    <!-- Фильтры -->
    <div class="flex gap-2 mb-5 flex-wrap">
      <button
        v-for="f in filters"
        :key="f.value"
        :class="[
          'px-4 py-1.5 rounded-xl text-sm font-medium border transition',
          activeFilter === f.value
            ? 'bg-primary text-white border-primary'
            : 'border-gray-200 hover:border-primary hover:text-primary',
        ]"
        @click="activeFilter = f.value"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- Загрузка -->
    <div v-if="isLoading" class="space-y-3">
      <div
        v-for="i in 3"
        :key="i"
        class="rounded-2xl border border-gray-100 p-4 animate-pulse"
      >
        <div class="flex gap-4">
          <div class="w-24 h-16 bg-gray-100 rounded-xl flex-shrink-0" />
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-100 rounded w-1/3" />
            <div class="h-3 bg-gray-100 rounded w-1/2" />
            <div class="h-3 bg-gray-100 rounded w-1/4" />
          </div>
        </div>
      </div>
    </div>

    <!-- Нет бронирований -->
    <div
      v-else-if="!bookings?.length"
      class="text-center py-16 text-gray-400"
    >
      <div class="text-5xl mb-4">🚗</div>
      <p class="text-lg font-medium mb-2 text-gray-600">Бронирований нет</p>
      <p class="text-sm mb-6">Выберите автомобиль и оформите бронирование</p>
      <NuxtLink
        to="/rent"
        class="inline-block px-6 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition"
      >
        Перейти к аренде
      </NuxtLink>
    </div>

    <!-- Список бронирований -->
    <div v-else class="space-y-4">
      <article
        v-for="b in bookings"
        :key="b.id"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden"
      >
        <div class="flex gap-4 p-4">
          <!-- Фото -->
          <div class="rounded-xl overflow-hidden bg-gray-50 flex-shrink-0" style="width:112px;height:80px;min-width:112px;position:relative">
            <img
              v-if="b.carImage"
              :src="b.carImage"
              :alt="b.carName"
              style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain"
            >
            <div v-else class="w-full h-full flex items-center justify-center text-3xl">
              🚗
            </div>
          </div>

          <!-- Основная информация -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <h3 class="font-bold text-base truncate">{{ b.carName }}</h3>
              <span :class="['text-xs font-medium px-2 py-1 rounded-lg whitespace-nowrap flex-shrink-0', statusColors[b.status]]">
                {{ statusLabels[b.status] }}
              </span>
            </div>

            <div class="text-sm text-gray-500 mt-1">
              {{ formatDate(b.startDate) }} — {{ formatDate(b.endDate) }}
              <span class="text-primary ml-1">· {{ daysCount(b.startDate, b.endDate) }} {{ daysWord(daysCount(b.startDate, b.endDate)) }}</span>
            </div>

            <div class="flex items-center gap-4 mt-2 flex-wrap">
              <span class="text-sm font-semibold">{{ formatPrice(b.totalAmount) }}</span>
              <span :class="['text-xs font-medium', paymentColors[b.paymentStatus]]">
                {{ paymentLabels[b.paymentStatus] }}
              </span>
              <span v-if="b.depositAmount" class="text-xs text-gray-400">
                Залог {{ formatPrice(b.depositAmount) }} · при выдаче
              </span>
              <span v-if="b.city" class="text-xs text-gray-400">📍 {{ b.city }}</span>
            </div>
          </div>
        </div>

        <!-- Действия -->
        <div class="border-t border-gray-50 px-4 py-3 flex items-center justify-between gap-3">
          <NuxtLink
            :to="`/acc/rent/${b.id}`"
            class="text-sm text-primary font-medium hover:underline"
          >
            Подробнее →
          </NuxtLink>

          <div class="flex gap-2">
            <!-- Оплатить: для неоплаченных активных/новых броней -->
            <button
              v-if="['new', 'active'].includes(b.status) && b.paymentStatus !== 'paid' && b.totalAmount"
              :disabled="paying === b.id"
              class="text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
              @click="payBooking(b.id)"
            >
              {{ paying === b.id ? 'Загрузка...' : 'Оплатить' }}
            </button>

            <!-- Отмена: только для new/active неоплаченных -->
            <button
              v-if="['new', 'active'].includes(b.status) && b.paymentStatus !== 'paid'"
              :disabled="cancelling === b.id"
              class="text-xs px-3 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
              @click="cancelBooking(b.id)"
            >
              {{ cancelling === b.id ? 'Отмена...' : 'Отменить' }}
            </button>

            <!-- Отмена оплаченной брони — через администратора -->
            <button
              v-if="['new', 'active'].includes(b.status) && b.paymentStatus === 'paid'"
              class="text-xs px-3 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition"
              @click="openCancelRequest(b)"
            >
              Отменить
            </button>
          </div>
        </div>
      </article>
    </div>
  </div>

  <!-- Попап отмены оплаченного бронирования -->
  <Teleport to="body">
    <div
      v-if="cancelRequestBooking"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      @click.self="cancelRequestBooking = null"
    >
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <div v-if="!cancelRequestSent">
          <h3 class="font-bold text-lg mb-2">Отмена бронирования</h3>
          <p class="text-sm text-gray-600 mb-1">
            <span class="font-medium">{{ cancelRequestBooking.carName }}</span>
          </p>
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
              {{ sendingCancelRequest ? 'Отправка...' : 'Отправить заявку' }}
            </button>
            <button
              class="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
              @click="cancelRequestBooking = null"
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
            @click="cancelRequestBooking = null"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
