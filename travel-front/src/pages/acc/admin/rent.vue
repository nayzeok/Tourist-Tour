<script setup lang="ts">
import { useAuthStore } from '~/src/shared/store'

definePageMeta({ layout: 'acc', middleware: ['auth'] })

const { public: { apiUrl } } = useRuntimeConfig()
const auth = useAuthStore()
await auth.ensureStatus()

if (auth.user?.role !== 'SUPERADMIN') await navigateTo('/acc')

interface RentProgBooking {
  id: number
  car_name?: string
  car?: { car_name?: string; id?: number }
  client?: { name?: string; lastname?: string; phone?: string; email?: string; [key: string]: any }
  car_id?: number
  start_date?: string
  end_date?: string
  name?: string
  lastname?: string
  client_name?: string
  client_lastname?: string
  phone?: string
  email?: string
  total?: number
  rental_cost?: number
  paid?: number
  debt?: number
  deposit?: number
  depositAmount?: number
  depositStatus?: 'held' | 'captured' | 'released'
  paykeeperPaymentId?: string
  active?: boolean
  status?: string
  comment?: string
  start_place?: string
  end_place?: string
  created_at?: string
  store_place?: string
  [key: string]: any
}

// ─── Состояние ───────────────────────────────────────────────────────────────
const tab = ref<'all' | 'active'>('all')
const searchInput = ref('')
const searchQuery = ref('')
const currentPage = ref(1)
const perPage = 20

const loading = ref(false)
const rawData = ref<any>(null)
const bookings = ref<RentProgBooking[]>([])
const totalCount = ref(0)

// ─── Загрузка ────────────────────────────────────────────────────────────────
async function load() {
  loading.value = true
  try {
    let url: string
    if (searchQuery.value.trim()) {
      url = `${apiUrl}/rent/bookings/admin?search=${encodeURIComponent(searchQuery.value.trim())}&page=${currentPage.value}&per_page=${perPage}`
    } else if (tab.value === 'active') {
      url = `${apiUrl}/rent/bookings/admin?type=active&page=${currentPage.value}&per_page=${perPage}`
    } else {
      url = `${apiUrl}/rent/bookings/admin?page=${currentPage.value}&per_page=${perPage}`
    }
    const res = await $fetch<any>(url, { credentials: 'include' }).catch(() => null)
    rawData.value = res
    if (Array.isArray(res)) {
      bookings.value = res
      totalCount.value = res.length
    } else if (res && Array.isArray(res.bookings)) {
      bookings.value = res.bookings
      totalCount.value = res.total ?? res.count ?? res.bookings.length
    } else if (res && Array.isArray(res.data)) {
      bookings.value = res.data
      totalCount.value = res.total ?? res.data.length
    } else if (res && Array.isArray(res.items)) {
      bookings.value = res.items
      totalCount.value = res.total ?? res.items.length
    } else {
      bookings.value = []
      totalCount.value = 0
    }
  } finally {
    loading.value = false
  }
}

const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / perPage)))

watch([tab, currentPage], load)
onMounted(load)

function search() {
  searchQuery.value = searchInput.value
  currentPage.value = 1
  load()
}
function clearSearch() {
  searchInput.value = ''
  searchQuery.value = ''
  currentPage.value = 1
  load()
}

// ─── Хелперы ─────────────────────────────────────────────────────────────────
function carName(b: RentProgBooking) {
  return b.car_name || b.car?.car_name || `Авто #${b.car_id ?? '?'}`
}
function clientName(b: RentProgBooking) {
  const first = b.name || b.client?.name || b.client_name || ''
  const last = b.lastname || b.client?.lastname || b.client_lastname || ''
  return [first, last].filter(Boolean).join(' ') || '—'
}
function formatMoney(n?: number | null) {
  if (n == null || n === 0) return null
  return n.toLocaleString('ru-RU') + ' ₽'
}
function debtColor(b: RentProgBooking) {
  if (!b.debt || b.debt <= 0) return 'text-green-600'
  return 'text-red-500'
}

// ─── Детальный попап ──────────────────────────────────────────────────────────
const detailOpen = ref(false)
const detailBooking = ref<RentProgBooking | null>(null)

function openDetail(b: RentProgBooking) {
  detailBooking.value = b
  detailOpen.value = true
}

// ─── Завершение аренды (capture/void холда) ────────────────────────────────
const completeOpen = ref(false)
const completeBooking = ref<RentProgBooking | null>(null)
const damageAmount = ref('')
const completing = ref(false)
const completeError = ref<string | null>(null)

function openComplete(b: RentProgBooking) {
  completeBooking.value = b
  damageAmount.value = ''
  completeError.value = null
  completeOpen.value = true
}

async function completeRental() {
  if (!completeBooking.value) return
  completing.value = true
  completeError.value = null
  try {
    await $fetch(`${apiUrl}/rent-user/admin/bookings/${completeBooking.value.id}/complete`, {
      method: 'POST',
      credentials: 'include',
      body: { damageAmount: damageAmount.value ? Number(damageAmount.value) : 0 },
    })
    completeOpen.value = false
    await load()
  } catch (e: any) {
    completeError.value = e?.data?.message || 'Ошибка завершения аренды'
  } finally {
    completing.value = false
  }
}

async function releaseDeposit(b: RentProgBooking) {
  if (!confirm('Отменить холд и вернуть всю сумму клиенту?')) return
  try {
    await $fetch(`${apiUrl}/rent-user/admin/bookings/${b.id}/release-deposit`, {
      method: 'POST',
      credentials: 'include',
    })
    await load()
  } catch (e: any) {
    alert(e?.data?.message || 'Ошибка отмены холда')
  }
}

// ─── Редактирование ──────────────────────────────────────────────────────────
const editOpen = ref(false)
const editBooking = ref<RentProgBooking | null>(null)
const editForm = ref({
  active: false,
  paid: '',
  comment: '',
  start_place: '',
  end_place: '',
})
const editSaving = ref(false)
const editError = ref<string | null>(null)

function openEdit(b: RentProgBooking) {
  editBooking.value = b
  editForm.value = {
    active: !!b.active,
    paid: b.paid != null ? String(b.paid) : '',
    comment: b.comment || '',
    start_place: b.start_place || '',
    end_place: b.end_place || '',
  }
  editError.value = null
  editOpen.value = true
}

async function saveEdit() {
  if (!editBooking.value) return
  editSaving.value = true
  editError.value = null
  try {
    const body: Record<string, any> = { active: editForm.value.active }
    if (editForm.value.paid !== '') body.paid = Number(editForm.value.paid)
    if (editForm.value.comment) body.comment = editForm.value.comment
    if (editForm.value.start_place) body.start_place = editForm.value.start_place
    if (editForm.value.end_place) body.end_place = editForm.value.end_place

    await $fetch(`${apiUrl}/rent/bookings/${editBooking.value.id}/update`, {
      method: 'POST',
      credentials: 'include',
      body,
    })
    editOpen.value = false
    // обновляем запись локально
    const idx = bookings.value.findIndex(b => b.id === editBooking.value!.id)
    if (idx !== -1) {
      bookings.value[idx] = {
        ...bookings.value[idx],
        active: editForm.value.active,
        paid: editForm.value.paid !== '' ? Number(editForm.value.paid) : bookings.value[idx].paid,
        comment: editForm.value.comment || bookings.value[idx].comment,
        start_place: editForm.value.start_place || bookings.value[idx].start_place,
        end_place: editForm.value.end_place || bookings.value[idx].end_place,
      }
    }
  } catch (e: any) {
    editError.value = e?.data?.message || 'Ошибка сохранения'
  } finally {
    editSaving.value = false
  }
}
</script>

<template>
  <div>
    <!-- Заголовок -->
    <div class="flex items-center justify-between mb-5">
      <div>
        <h1 class="text-2xl font-bold">Аренда авто</h1>
        <p class="text-sm text-gray-400 mt-0.5">Бронирования из RentProg</p>
      </div>
      <button
        class="h-9 px-4 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition"
        :disabled="loading"
        @click="load"
      >
        {{ loading ? '...' : '↻ Обновить' }}
      </button>
    </div>

    <!-- Вкладки + поиск -->
    <div class="flex flex-wrap items-center gap-3 mb-5">
      <div class="flex gap-1 bg-gray-100 rounded-xl p-1">
        <button
          :class="['px-4 py-1.5 rounded-lg text-sm font-medium transition', tab === 'all' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700']"
          @click="tab = 'all'; currentPage = 1"
        >
          Все
        </button>
        <button
          :class="['px-4 py-1.5 rounded-lg text-sm font-medium transition', tab === 'active' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700']"
          @click="tab = 'active'; currentPage = 1"
        >
          Активные
        </button>
      </div>

      <div class="flex gap-2 flex-1 min-w-0">
        <input
          v-model="searchInput"
          class="h-9 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:border-primary transition flex-1 min-w-0 max-w-xs"
          placeholder="Имя, телефон, email..."
          @keydown.enter="search"
        >
        <button
          class="h-9 px-4 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition shrink-0"
          @click="search"
        >
          Найти
        </button>
        <button
          v-if="searchQuery"
          class="h-9 px-3 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition shrink-0"
          @click="clearSearch"
        >
          ✕
        </button>
      </div>

      <p class="text-sm text-gray-400 ml-auto shrink-0">
        {{ totalCount ? `Всего: ${totalCount}` : '' }}
      </p>
    </div>

    <!-- Скелетон -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 6" :key="i" class="h-20 bg-gray-100 rounded-2xl animate-pulse" />
    </div>

    <!-- Пусто -->
    <div v-else-if="!bookings.length" class="text-center py-16 text-gray-400">
      <p class="text-4xl mb-3">🚗</p>
      <p class="text-lg font-medium">Бронирований не найдено</p>
    </div>

    <!-- Таблица -->
    <div v-else class="overflow-x-auto rounded-2xl border border-gray-100">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
          <tr>
            <th class="px-4 py-3 text-left whitespace-nowrap">Бронь</th>
            <th class="px-4 py-3 text-left">Клиент</th>
            <th class="px-4 py-3 text-left">Автомобиль</th>
            <th class="px-4 py-3 text-left whitespace-nowrap">Период / Места</th>
            <th class="px-4 py-3 text-left">Финансы</th>
            <th class="px-4 py-3 text-left">Статус</th>
            <th class="px-4 py-3 text-left"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr
            v-for="b in bookings"
            :key="b.id"
            class="bg-white hover:bg-gray-50/80 transition cursor-pointer"
            @click="openDetail(b)"
          >
            <!-- Бронь -->
            <td class="px-4 py-3 whitespace-nowrap" @click.stop>
              <p class="font-mono text-xs text-gray-400">#{{ b.id }}</p>
              <p v-if="b.created_at" class="text-xs text-gray-400 mt-0.5">
                {{ new Date(b.created_at).toLocaleDateString('ru-RU') }}
              </p>
            </td>

            <!-- Клиент -->
            <td class="px-4 py-3">
              <p class="font-semibold">{{ clientName(b) }}</p>
              <p v-if="b.phone" class="text-xs text-gray-500 mt-0.5">{{ b.phone }}</p>
              <p v-if="b.email" class="text-xs text-gray-400">{{ b.email }}</p>
            </td>

            <!-- Автомобиль -->
            <td class="px-4 py-3">
              <p class="font-medium">{{ carName(b) }}</p>
              <p v-if="b.store_place" class="text-xs text-gray-400 mt-0.5">{{ b.store_place }}</p>
            </td>

            <!-- Период -->
            <td class="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
              <p class="font-medium">{{ b.start_date || '—' }}</p>
              <p class="text-gray-400">{{ b.end_date || '—' }}</p>
              <p v-if="b.start_place" class="mt-1 text-gray-400 max-w-32 truncate" :title="b.start_place">
                ↑ {{ b.start_place }}
              </p>
              <p v-if="b.end_place" class="text-gray-400 max-w-32 truncate" :title="b.end_place">
                ↓ {{ b.end_place }}
              </p>
            </td>

            <!-- Финансы -->
            <td class="px-4 py-3 whitespace-nowrap">
              <p v-if="formatMoney(b.total ?? b.rental_cost)" class="font-semibold">
                {{ formatMoney(b.total ?? b.rental_cost) }}
              </p>
              <p v-if="formatMoney(b.paid)" class="text-xs text-green-600 mt-0.5">
                Оплачено: {{ formatMoney(b.paid) }}
              </p>
              <p v-if="b.debt != null" :class="['text-xs mt-0.5', debtColor(b)]">
                Долг: {{ formatMoney(b.debt) ?? '0 ₽' }}
              </p>
              <p v-if="formatMoney(b.deposit)" class="text-xs text-gray-400 mt-0.5">
                Залог: {{ formatMoney(b.deposit) }}
              </p>
            </td>

            <!-- Статус -->
            <td class="px-4 py-3">
              <span
                :class="[
                  'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg',
                  b.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                ]"
              >
                <span :class="['w-1.5 h-1.5 rounded-full', b.active ? 'bg-green-500' : 'bg-gray-400']" />
                {{ b.active ? 'Активна' : 'Неактивна' }}
              </span>
              <div v-if="b.depositAmount" class="mt-1">
                <span class="text-xs text-gray-400">Залог {{ b.depositAmount?.toLocaleString('ru-RU') }} ₽ · при выдаче</span>
              </div>
              <p v-if="b.comment" class="text-xs text-gray-400 mt-1 max-w-28 truncate" :title="b.comment">
                {{ b.comment }}
              </p>
            </td>

            <!-- Действия -->
            <td class="px-4 py-3" @click.stop>
              <div class="flex flex-col gap-1.5">
                <button
                  class="text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:opacity-80 transition whitespace-nowrap"
                  @click="openEdit(b)"
                >
                  Изменить
                </button>
                <button
                  v-if="b.depositStatus === 'held'"
                  class="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:opacity-80 transition whitespace-nowrap"
                  @click="openComplete(b)"
                >
                  Завершить аренду
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Пагинация -->
    <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-5 flex-wrap">
      <button
        :disabled="currentPage === 1"
        class="h-9 px-3 rounded-xl text-sm border border-gray-200 hover:border-primary hover:text-primary transition disabled:opacity-40"
        @click="currentPage--"
      >
        ←
      </button>
      <button
        v-for="p in Math.min(totalPages, 10)"
        :key="p"
        :class="['w-9 h-9 rounded-xl text-sm font-medium border transition', p === currentPage ? 'bg-primary text-white border-primary' : 'border-gray-200 hover:border-primary hover:text-primary']"
        @click="currentPage = p"
      >
        {{ p }}
      </button>
      <span v-if="totalPages > 10" class="flex items-center text-sm text-gray-400 px-2">... {{ totalPages }}</span>
      <button
        :disabled="currentPage === totalPages"
        class="h-9 px-3 rounded-xl text-sm border border-gray-200 hover:border-primary hover:text-primary transition disabled:opacity-40"
        @click="currentPage++"
      >
        →
      </button>
    </div>

    <!-- ====== Попап деталей ====== -->
    <Teleport to="body">
      <div
        v-if="detailOpen && detailBooking"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
        @click.self="detailOpen = false"
      >
        <div class="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
          <div class="flex items-start justify-between mb-5">
            <div>
              <h3 class="font-bold text-lg">Бронирование #{{ detailBooking.id }}</h3>
              <p v-if="detailBooking.created_at" class="text-xs text-gray-400 mt-0.5">
                Создано: {{ new Date(detailBooking.created_at).toLocaleString('ru-RU') }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <span
                :class="[
                  'text-xs font-medium px-2.5 py-1 rounded-lg',
                  detailBooking.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                ]"
              >
                {{ detailBooking.active ? 'Активна' : 'Неактивна' }}
              </span>
              <button class="text-gray-400 hover:text-gray-600 text-xl leading-none" @click="detailOpen = false">✕</button>
            </div>
          </div>

          <div class="space-y-4">
            <!-- Клиент -->
            <div class="rounded-xl border border-gray-100 p-4">
              <p class="text-xs text-gray-400 uppercase font-medium mb-3">Клиент</p>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p class="text-xs text-gray-400">ФИО</p>
                  <p class="font-medium">{{ clientName(detailBooking) }}</p>
                </div>
                <div v-if="detailBooking.phone">
                  <p class="text-xs text-gray-400">Телефон</p>
                  <p class="font-medium">{{ detailBooking.phone }}</p>
                </div>
                <div v-if="detailBooking.email" class="col-span-2">
                  <p class="text-xs text-gray-400">Email</p>
                  <p class="font-medium">{{ detailBooking.email }}</p>
                </div>
              </div>
            </div>

            <!-- Автомобиль -->
            <div class="rounded-xl border border-gray-100 p-4">
              <p class="text-xs text-gray-400 uppercase font-medium mb-3">Автомобиль</p>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div class="col-span-2">
                  <p class="text-xs text-gray-400">Название</p>
                  <p class="font-medium">{{ carName(detailBooking) }}</p>
                </div>
                <div v-if="detailBooking.store_place" class="col-span-2">
                  <p class="text-xs text-gray-400">Место хранения</p>
                  <p class="font-medium">{{ detailBooking.store_place }}</p>
                </div>
              </div>
            </div>

            <!-- Период и места -->
            <div class="rounded-xl border border-gray-100 p-4">
              <p class="text-xs text-gray-400 uppercase font-medium mb-3">Период аренды</p>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p class="text-xs text-gray-400">Начало</p>
                  <p class="font-medium">{{ detailBooking.start_date || '—' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400">Конец</p>
                  <p class="font-medium">{{ detailBooking.end_date || '—' }}</p>
                </div>
                <div v-if="detailBooking.start_place" class="col-span-2">
                  <p class="text-xs text-gray-400">Место выдачи</p>
                  <p class="font-medium">{{ detailBooking.start_place }}</p>
                </div>
                <div v-if="detailBooking.end_place" class="col-span-2">
                  <p class="text-xs text-gray-400">Место возврата</p>
                  <p class="font-medium">{{ detailBooking.end_place }}</p>
                </div>
              </div>
            </div>

            <!-- Финансы -->
            <div class="rounded-xl border border-gray-100 p-4">
              <p class="text-xs text-gray-400 uppercase font-medium mb-3">Финансы</p>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div v-if="detailBooking.rental_cost != null">
                  <p class="text-xs text-gray-400">Стоимость аренды</p>
                  <p class="font-semibold">{{ formatMoney(detailBooking.rental_cost) }}</p>
                </div>
                <div v-if="detailBooking.total != null">
                  <p class="text-xs text-gray-400">Итого</p>
                  <p class="font-semibold">{{ formatMoney(detailBooking.total) }}</p>
                </div>
                <div v-if="detailBooking.paid != null">
                  <p class="text-xs text-gray-400">Оплачено</p>
                  <p class="font-semibold text-green-600">{{ formatMoney(detailBooking.paid) }}</p>
                </div>
                <div v-if="detailBooking.debt != null">
                  <p class="text-xs text-gray-400">Долг</p>
                  <p :class="['font-semibold', debtColor(detailBooking)]">{{ formatMoney(detailBooking.debt) ?? '0 ₽' }}</p>
                </div>
                <div v-if="detailBooking.deposit != null">
                  <p class="text-xs text-gray-400">Залог</p>
                  <p class="font-semibold">{{ formatMoney(detailBooking.deposit) }}</p>
                </div>
              </div>
            </div>

            <!-- Комментарий -->
            <div v-if="detailBooking.comment" class="rounded-xl bg-yellow-50 border border-yellow-100 p-4">
              <p class="text-xs text-gray-400 uppercase font-medium mb-1">Комментарий</p>
              <p class="text-sm">{{ detailBooking.comment }}</p>
            </div>
          </div>

          <div class="flex gap-3 mt-5">
            <button
              class="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition"
              @click="detailOpen = false; openEdit(detailBooking)"
            >
              Редактировать
            </button>
            <button
              class="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
              @click="detailOpen = false"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ====== Попап редактирования ====== -->
    <Teleport to="body">
      <div
        v-if="editOpen"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
        @click.self="editOpen = false"
      >
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
          <h3 class="font-bold text-lg mb-1">Редактировать бронь #{{ editBooking?.id }}</h3>
          <p class="text-sm text-gray-500 mb-4">{{ editBooking ? carName(editBooking) : '' }}, {{ editBooking ? clientName(editBooking) : '' }}</p>

          <div class="space-y-3">
            <div class="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <div>
                <p class="text-sm font-medium">Активна</p>
                <p class="text-xs text-gray-400">Отображается как действующее бронирование</p>
              </div>
              <button
                :class="['relative w-11 h-6 rounded-full transition-colors', editForm.active ? 'bg-primary' : 'bg-gray-200']"
                @click="editForm.active = !editForm.active"
              >
                <span :class="['absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform', editForm.active ? 'translate-x-6' : 'translate-x-1']" />
              </button>
            </div>

            <div>
              <label class="text-xs text-gray-500 block mb-1">Оплачено (₽)</label>
              <input
                v-model="editForm.paid"
                type="number"
                placeholder="0"
                class="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:border-primary transition"
              >
            </div>

            <div>
              <label class="text-xs text-gray-500 block mb-1">Место выдачи</label>
              <input
                v-model="editForm.start_place"
                class="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:border-primary transition"
                placeholder="Адрес или офис"
              >
            </div>

            <div>
              <label class="text-xs text-gray-500 block mb-1">Место возврата</label>
              <input
                v-model="editForm.end_place"
                class="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:border-primary transition"
                placeholder="Адрес или офис"
              >
            </div>

            <div>
              <label class="text-xs text-gray-500 block mb-1">Комментарий</label>
              <textarea
                v-model="editForm.comment"
                rows="2"
                class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary transition resize-none"
                placeholder="Необязательно"
              />
            </div>
          </div>

          <p v-if="editError" class="text-red-500 text-xs mt-3">{{ editError }}</p>

          <div class="flex gap-3 mt-5">
            <button
              :disabled="editSaving"
              class="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
              @click="saveEdit"
            >
              {{ editSaving ? 'Сохранение...' : 'Сохранить' }}
            </button>
            <button
              class="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
              @click="editOpen = false"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>

  <!-- ====== Попап завершения аренды ====== -->
  <Teleport to="body">
    <div
      v-if="completeOpen && completeBooking"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      @click.self="completeOpen = false"
    >
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <h3 class="font-bold text-lg mb-1">Завершить аренду</h3>
        <p class="text-sm text-gray-500 mb-4">
          {{ completeBooking ? carName(completeBooking) : '' }},
          {{ completeBooking ? clientName(completeBooking) : '' }}
        </p>

        <div class="bg-orange-50 border border-orange-100 rounded-xl p-3 mb-4 text-sm text-orange-700">
          <p class="font-medium mb-1">Залог заблокирован: {{ completeBooking.depositAmount?.toLocaleString('ru-RU') }} ₽</p>
          <p class="text-xs">Стоимость аренды {{ completeBooking.total?.toLocaleString('ru-RU') ?? '—' }} ₽ будет списана. Остаток возвращён клиенту.</p>
        </div>

        <div class="space-y-3">
          <div>
            <label class="text-xs text-gray-500 block mb-1">Сумма ущерба (₽)</label>
            <input
              v-model="damageAmount"
              type="number"
              min="0"
              :max="completeBooking.depositAmount"
              placeholder="0 — нет повреждений"
              class="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:border-primary transition"
            >
            <p class="text-xs text-gray-400 mt-1">Будет удержано из залога. Максимум: {{ completeBooking.depositAmount?.toLocaleString('ru-RU') }} ₽</p>
          </div>
        </div>

        <p v-if="completeError" class="text-red-500 text-xs mt-3">{{ completeError }}</p>

        <div class="flex flex-col gap-2 mt-5">
          <button
            :disabled="completing"
            class="py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            @click="completeRental"
          >
            {{ completing ? 'Обработка...' : damageAmount && Number(damageAmount) > 0 ? `Завершить и удержать ${Number(damageAmount).toLocaleString('ru-RU')} ₽` : 'Завершить и вернуть залог' }}
          </button>
          <button
            :disabled="completing"
            class="py-2.5 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition disabled:opacity-50"
            @click="releaseDeposit(completeBooking); completeOpen = false"
          >
            Отменить и вернуть всё
          </button>
          <button
            class="py-2 text-gray-400 text-sm hover:text-gray-600 transition"
            @click="completeOpen = false"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
