<script setup lang="ts">
import { getRentCar, createRentBooking } from '~/src/shared/api/rent'
import type { RentCar } from '~/src/shared/types/rent'
import { useAuthStore } from '~/src/shared/store'

definePageMeta({ layout: 'default' })

const auth = useAuthStore()

const route = useRoute()
const router = useRouter()

const carId = computed(() => route.params.id as string)
const city = computed(() => (route.query.city as string) || '')
const startDate = computed(() => (route.query.startDate as string) || '')
const endDate = computed(() => (route.query.endDate as string) || '')

// Кол-во дней
const daysCount = computed(() => {
  if (!startDate.value || !endDate.value) return 1
  const diff = new Date(endDate.value).getTime() - new Date(startDate.value).getTime()
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})

function formatDatetime(dt: string) {
  if (!dt) return '—'
  const d = new Date(dt)
  return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatPrice(n: number) {
  return n.toLocaleString('ru-RU') + ' ₽'
}

function daysWord(n: number) {
  if (n % 10 === 1 && n % 100 !== 11) return 'день'
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'дня'
  return 'дней'
}

// Загрузка авто
const { data: car, status, error } = await useAsyncData<RentCar>(
  `rent-car-${carId.value}`,
  () => getRentCar(carId.value, {
    cityId: city.value || undefined,
    startDate: startDate.value || undefined,
    endDate: endDate.value || undefined,
  }),
  { dedupe: 'defer' },
)

const isLoading = computed(() => status.value === 'pending')

// Галерея
const activePhoto = ref(0)

// Выбранные опции
const selectedOptions = ref<string[]>([])
function toggleOption(id: string) {
  const idx = selectedOptions.value.indexOf(id)
  if (idx === -1) selectedOptions.value.push(id)
  else selectedOptions.value.splice(idx, 1)
}

// Место подачи/возврата
const pickupLocation = ref('')
const returnSame = ref(true)
const returnLocation = ref('')

// Итоговая стоимость
const totalPrice = computed(() => {
  if (!car.value) return 0
  let total = car.value.pricePerDay * daysCount.value
  for (const optId of selectedOptions.value) {
    const opt = car.value.extraOptions?.find(o => o.id === optId)
    if (opt) total += opt.price
  }
  return total
})

// Попап бронирования
const bookingOpen = ref(false)
const form = ref({ firstName: '', lastName: '', phone: '' })
const formError = ref<string | null>(null)
const booking = ref(false)

function openBooking() {
  formError.value = null
  form.value = {
    firstName: auth.user?.firstName || '',
    lastName: auth.user?.lastName || '',
    phone: auth.user?.phone || '',
  }
  bookingOpen.value = true
}

async function confirmBooking() {
  if (!form.value.firstName.trim() || !form.value.lastName.trim() || !form.value.phone.trim()) {
    formError.value = 'Заполните все поля'
    return
  }
  if (!car.value) return

  booking.value = true
  formError.value = null
  try {
    const result = await createRentBooking({
      carId: carId.value,
      cityId: city.value,
      startDate: startDate.value,
      endDate: endDate.value,
      pickupLocation: pickupLocation.value || undefined,
      returnLocation: returnSame.value ? (pickupLocation.value || undefined) : (returnLocation.value || undefined),
      extraOptions: selectedOptions.value,
      firstName: form.value.firstName.trim(),
      lastName: form.value.lastName.trim(),
      phone: form.value.phone.replace(/\D/g, ''),
    })
    bookingOpen.value = false
    await router.push({
      path: '/rent/booking/success',
      query: { bookingId: result.booking.id, number: result.booking.number },
    })
  } catch (e: unknown) {
    formError.value = e instanceof Error ? e.message : 'Ошибка при создании бронирования'
  } finally {
    booking.value = false
  }
}

function goBack() {
  router.push({
    path: '/rent/cars',
    query: { city: city.value, startDate: startDate.value, endDate: endDate.value },
  })
}
</script>

<template>
  <div class="container py-6 lg:py-10">
    <!-- Назад -->
    <button
      class="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition mb-6"
      @click="goBack"
    >
      ← Назад к списку
    </button>

    <!-- Загрузка -->
    <div v-if="isLoading" class="grid lg:grid-cols-[1fr_380px] gap-8 animate-pulse">
      <div>
        <div class="h-72 bg-gray-100 rounded-2xl mb-3" />
        <div class="flex gap-2">
          <div v-for="i in 4" :key="i" class="w-20 h-14 bg-gray-100 rounded-xl" />
        </div>
      </div>
      <div class="space-y-4">
        <div class="h-8 bg-gray-100 rounded w-3/4" />
        <div class="h-32 bg-gray-100 rounded-2xl" />
        <div class="h-14 bg-gray-100 rounded-xl" />
      </div>
    </div>

    <!-- Ошибка -->
    <div v-else-if="error || !car" class="text-center py-20 text-gray-500">
      <div class="text-5xl mb-4">😔</div>
      <p class="text-lg font-medium mb-2">Автомобиль не найден</p>
      <button class="px-6 py-3 bg-primary text-white rounded-xl" @click="goBack">
        Вернуться
      </button>
    </div>

    <!-- Контент -->
    <div v-else class="grid lg:grid-cols-[1fr_380px] gap-8">

      <!-- ЛЕВАЯ ЧАСТЬ -->
      <div>
        <!-- Галерея -->
        <div class="rounded-2xl overflow-hidden bg-gray-50 h-64 lg:h-80 mb-3 relative">
          <img
            v-if="car.images?.[activePhoto]"
            :src="car.images[activePhoto]"
            :alt="car.name"
            class="w-full h-full object-contain p-3"
          >
          <div v-else class="w-full h-full flex items-center justify-center text-7xl">🚗</div>
        </div>
        <div v-if="car.images?.length > 1" class="flex gap-2 overflow-x-auto pb-1">
          <button
            v-for="(img, i) in car.images"
            :key="i"
            class="flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition"
            :class="activePhoto === i ? 'border-primary' : 'border-transparent'"
            @click="activePhoto = i"
          >
            <img :src="img" :alt="`Фото ${i + 1}`" class="w-full h-full object-cover">
          </button>
        </div>

        <!-- Заголовок -->
        <div class="mt-6">
          <h1 class="text-2xl lg:text-3xl font-bold mb-1">{{ car.brand }} {{ car.model }}</h1>
          <div class="flex flex-wrap gap-2 mt-2">
            <span v-if="car.year" class="text-xs px-2.5 py-1 bg-gray-100 rounded-full text-gray-600">{{ car.year }} г.</span>
            <span v-if="car.class" class="text-xs px-2.5 py-1 bg-gray-100 rounded-full text-gray-600">{{ car.class }}</span>
            <span v-if="car.bodyType" class="text-xs px-2.5 py-1 bg-gray-100 rounded-full text-gray-600">{{ car.bodyType }}</span>
            <span v-if="car.color" class="text-xs px-2.5 py-1 bg-gray-100 rounded-full text-gray-600">{{ car.color }}</span>
          </div>
        </div>

        <!-- Характеристики автомобиля -->
        <div class="mt-6">
          <h2 class="text-lg font-bold mb-3">Характеристики</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div v-if="car.transmission" class="bg-gray-50 rounded-xl p-3">
              <p class="text-xs text-gray-400 mb-0.5">Коробка передач</p>
              <p class="text-sm font-semibold">{{ car.transmission }}</p>
            </div>
            <div v-if="car.fuel" class="bg-gray-50 rounded-xl p-3">
              <p class="text-xs text-gray-400 mb-0.5">Тип топлива</p>
              <p class="text-sm font-semibold">{{ car.fuel }}</p>
            </div>
            <div v-if="car.engineCapacity" class="bg-gray-50 rounded-xl p-3">
              <p class="text-xs text-gray-400 mb-0.5">Объём двигателя</p>
              <p class="text-sm font-semibold">{{ car.engineCapacity }}</p>
            </div>
            <div v-if="car.enginePower" class="bg-gray-50 rounded-xl p-3">
              <p class="text-xs text-gray-400 mb-0.5">Мощность</p>
              <p class="text-sm font-semibold">{{ car.enginePower }} л.с.</p>
            </div>
            <div v-if="car.driveUnit" class="bg-gray-50 rounded-xl p-3">
              <p class="text-xs text-gray-400 mb-0.5">Привод</p>
              <p class="text-sm font-semibold">{{ car.driveUnit }}</p>
            </div>
            <div v-if="car.seats" class="bg-gray-50 rounded-xl p-3">
              <p class="text-xs text-gray-400 mb-0.5">Количество мест</p>
              <p class="text-sm font-semibold">{{ car.seats }}</p>
            </div>
          </div>
        </div>

        <!-- Условия аренды -->
        <div class="mt-8 space-y-4">
          <h2 class="text-lg font-bold">Условия аренды</h2>

          <div class="grid sm:grid-cols-2 gap-3">
            <div v-if="car.mileagePerDay" class="bg-gray-50 rounded-xl p-4">
              <p class="text-xs text-gray-400 mb-1">Включённый пробег</p>
              <p class="text-sm font-medium">{{ car.mileagePerDay }} км/день</p>
            </div>
            <div v-if="car.deposit" class="bg-gray-50 rounded-xl p-4">
              <p class="text-xs text-gray-400 mb-1">Страховой депозит</p>
              <p class="text-sm font-medium">{{ formatPrice(car.deposit) }}</p>
            </div>
            <div v-if="car.franchise" class="bg-gray-50 rounded-xl p-4">
              <p class="text-xs text-gray-400 mb-1">Страховая франшиза</p>
              <p class="text-sm font-medium">{{ formatPrice(car.franchise) }}</p>
            </div>
            <div v-if="car.insurance" class="bg-gray-50 rounded-xl p-4">
              <p class="text-xs text-gray-400 mb-1">Страховка</p>
              <p class="text-sm font-medium">{{ car.insurance }}</p>
            </div>
            <div v-if="car.minAge || car.minExperience" class="bg-gray-50 rounded-xl p-4">
              <p class="text-xs text-gray-400 mb-1">Требования к водителю</p>
              <p class="text-sm font-medium">
                <span v-if="car.minAge">От {{ car.minAge }} лет</span>
                <span v-if="car.minAge && car.minExperience"> · </span>
                <span v-if="car.minExperience">Стаж от {{ car.minExperience }} лет</span>
              </p>
            </div>
            <div v-if="car.documents" class="bg-gray-50 rounded-xl p-4">
              <p class="text-xs text-gray-400 mb-1">Необходимые документы</p>
              <p class="text-sm font-medium">{{ car.documents }}</p>
            </div>
            <div v-if="car.returnFuel" class="bg-gray-50 rounded-xl p-4">
              <p class="text-xs text-gray-400 mb-1">Условие по топливу</p>
              <p class="text-sm font-medium">{{ car.returnFuel }}</p>
            </div>
          </div>

          <!-- Доп. опции -->
          <div v-if="car.extraOptions?.length">
            <h3 class="font-semibold mb-3">Дополнительные опции</h3>
            <div class="space-y-2">
              <label
                v-for="opt in car.extraOptions"
                :key="opt.id"
                class="flex items-center justify-between p-3 rounded-xl border cursor-pointer transition"
                :class="selectedOptions.includes(opt.id) ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'"
              >
                <div class="flex items-center gap-3">
                  <input
                    type="checkbox"
                    :checked="selectedOptions.includes(opt.id)"
                    class="rounded text-primary"
                    @change="toggleOption(opt.id)"
                  >
                  <span class="text-sm font-medium">{{ opt.name }}</span>
                </div>
                <span class="text-sm text-primary font-semibold">+{{ formatPrice(opt.price) }}</span>
              </label>
            </div>
          </div>

          <!-- Место подачи -->
          <div>
            <h3 class="font-semibold mb-3">Место подачи</h3>
            <div class="space-y-2">
              <div v-if="car.pickupLocations?.length">
                <select
                  v-model="pickupLocation"
                  class="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:border-primary transition"
                >
                  <option value="">Офис аренды автомобиля</option>
                  <option v-for="loc in car.pickupLocations" :key="loc" :value="loc">{{ loc }}</option>
                </select>
              </div>
              <p v-else class="text-sm text-gray-500">Офис аренды автомобиля</p>
            </div>
          </div>

          <!-- Место возврата -->
          <div>
            <h3 class="font-semibold mb-2">Место возврата</h3>
            <label class="flex items-center gap-2 text-sm mb-2 cursor-pointer">
              <input v-model="returnSame" type="checkbox" class="rounded text-primary">
              Возврат в офис аренды
            </label>
            <div v-if="!returnSame && car.returnLocations?.length">
              <select
                v-model="returnLocation"
                class="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:border-primary transition"
              >
                <option value="">Выберите место возврата</option>
                <option v-for="loc in car.returnLocations" :key="loc" :value="loc">{{ loc }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- ПРАВАЯ ЧАСТЬ (sticky) -->
      <div class="lg:sticky lg:top-6 h-fit">
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <!-- Даты -->
          <div>
            <p class="text-xs text-gray-400 mb-2">Период аренды</p>
            <div class="flex flex-col gap-1.5 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Начало</span>
                <span class="font-medium">{{ formatDatetime(startDate) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Завершение</span>
                <span class="font-medium">{{ formatDatetime(endDate) }}</span>
              </div>
            </div>
          </div>

          <hr class="border-gray-100">

          <!-- Расчёт стоимости -->
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">
                {{ formatPrice(car.pricePerDay) }} × {{ daysCount }} {{ daysWord(daysCount) }}
              </span>
              <span class="font-medium">{{ formatPrice(car.pricePerDay * daysCount) }}</span>
            </div>
            <div
              v-for="optId in selectedOptions"
              :key="optId"
              class="flex justify-between text-gray-600"
            >
              <span>{{ car.extraOptions?.find(o => o.id === optId)?.name }}</span>
              <span>+{{ formatPrice(car.extraOptions?.find(o => o.id === optId)?.price ?? 0) }}</span>
            </div>
          </div>

          <hr class="border-gray-100">

          <div class="flex justify-between items-center">
            <span class="font-semibold">Итого</span>
            <span class="text-xl font-bold text-primary">{{ formatPrice(totalPrice) }}</span>
          </div>

          <p class="text-xs text-gray-400">
            Депозит {{ formatPrice(car.deposit) }} блокируется на срок аренды
          </p>

          <button
            class="w-full h-12 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition"
            @click="openBooking"
          >
            Забронировать
          </button>
        </div>
      </div>
    </div>

    <!-- ====== ПОПАП БРОНИРОВАНИЯ ====== -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="bookingOpen"
          class="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4"
        >
          <div class="absolute inset-0 bg-black/50" @click="bookingOpen = false" />
          <div class="relative bg-white rounded-2xl w-full max-w-md shadow-2xl z-10 p-6">
            <button
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
              @click="bookingOpen = false"
            >
              ✕
            </button>

            <h2 class="text-xl font-bold mb-5">Подтверждение бронирования</h2>

            <!-- Детали -->
            <div class="bg-gray-50 rounded-xl p-4 mb-5 space-y-2 text-sm">
              <p class="font-semibold text-base">{{ car?.brand }} {{ car?.model }}</p>
              <div class="flex justify-between text-gray-600">
                <span>Начало</span>
                <span>{{ formatDatetime(startDate) }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Завершение</span>
                <span>{{ formatDatetime(endDate) }}</span>
              </div>
              <div v-if="pickupLocation" class="flex justify-between text-gray-600">
                <span>Место выдачи</span>
                <span>{{ pickupLocation }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Место возврата</span>
                <span>{{ returnSame ? (pickupLocation || 'Офис аренды') : (returnLocation || 'Офис аренды') }}</span>
              </div>
              <div class="flex justify-between font-semibold text-primary border-t border-gray-200 pt-2 mt-2">
                <span>Стоимость</span>
                <span>{{ formatPrice(totalPrice) }}</span>
              </div>
            </div>

            <!-- Форма -->
            <form class="space-y-3" @submit.prevent="confirmBooking">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs text-gray-500 mb-1 block">Имя</label>
                  <input
                    v-model="form.firstName"
                    class="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                    placeholder="Иван"
                    type="text"
                    required
                  >
                </div>
                <div>
                  <label class="text-xs text-gray-500 mb-1 block">Фамилия</label>
                  <input
                    v-model="form.lastName"
                    class="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                    placeholder="Иванов"
                    type="text"
                    required
                  >
                </div>
              </div>
              <div>
                <label class="text-xs text-gray-500 mb-1 block">Номер телефона</label>
                <input
                  v-model="form.phone"
                  class="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                  placeholder="+7 (___) ___-__-__"
                  type="tel"
                  required
                >
              </div>

              <p v-if="formError" class="text-red-500 text-xs">{{ formError }}</p>

              <button
                class="w-full h-12 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50"
                type="submit"
                :disabled="booking"
              >
                {{ booking ? 'Оформляем...' : 'Подтвердить бронирование' }}
              </button>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
