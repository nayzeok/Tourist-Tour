<script setup lang="ts">
import { searchRentCars } from '~/src/shared/api/rent'
import type { RentCar } from '~/src/shared/types/rent'

const config = useRuntimeConfig()

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()

const city = computed(() => (route.query.city as string) || '')
const startDate = computed(() => (route.query.startDate as string) || '')
const endDate = computed(() => (route.query.endDate as string) || '')

// Количество дней аренды
const daysCount = computed(() => {
  if (!startDate.value || !endDate.value) return 0
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

// Загрузка авто: если нет параметров — грузим все авто
const { data: cars, status, error } = await useAsyncData<RentCar[]>(
  () => `rent-cars-${city.value}-${startDate.value}-${endDate.value}`,
  async () => {
    try {
      if (city.value && startDate.value && endDate.value) {
        return await searchRentCars({ city: city.value, startDate: startDate.value, endDate: endDate.value })
      }
      // Нет параметров — показываем все авто
      return await $fetch<RentCar[]>(`${config.public.apiUrl}/rent/cars/all`)
    } catch {
      return []
    }
  },
  { watch: [city, startDate, endDate] },
)

const isLoading = computed(() => status.value === 'pending')
const hasError = computed(() => !!error.value)
const hasCars = computed(() => (cars.value?.length ?? 0) > 0)

function openCar(car: RentCar) {
  router.push({
    path: `/rent/cars/${car.id}`,
    query: { city: city.value, startDate: startDate.value, endDate: endDate.value },
  })
}
</script>

<template>
  <div>
    <div class="container py-8">
      <!-- Заголовок результатов -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold">
            {{ city ? `Аренда авто в ${city}` : 'Аренда автомобилей' }}
          </h1>
          <p v-if="startDate && endDate" class="text-sm text-gray-500 mt-1">
            {{ formatDatetime(startDate) }} — {{ formatDatetime(endDate) }}
            <span class="ml-1 text-primary font-medium">· {{ daysCount }} {{ daysWord(daysCount) }}</span>
          </p>
        </div>
        <NuxtLink
          to="/rent"
          class="text-sm text-gray-500 hover:text-primary transition"
        >
          ← Назад
        </NuxtLink>
      </div>

      <!-- Загрузка -->
      <div v-if="isLoading" class="grid lg:grid-cols-3 gap-5">
        <div
          v-for="i in 6"
          :key="i"
          class="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse"
        >
          <div class="h-44 bg-gray-100" />
          <div class="p-4 space-y-3">
            <div class="h-5 bg-gray-100 rounded w-2/3" />
            <div class="grid grid-cols-2 gap-2">
              <div class="h-8 bg-gray-100 rounded" />
              <div class="h-8 bg-gray-100 rounded" />
              <div class="h-8 bg-gray-100 rounded" />
              <div class="h-8 bg-gray-100 rounded" />
            </div>
            <div class="h-10 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>

      <!-- Нет результатов -->
      <div
        v-else-if="!isLoading && !hasCars"
        class="text-center py-20 text-gray-500"
      >
        <div class="text-5xl mb-4">😔</div>
        <p class="text-lg font-medium mb-2">Нет доступных автомобилей</p>
        <p class="text-sm mb-6">Попробуйте изменить даты или выбрать другой город</p>
        <div class="flex gap-3 justify-center">
          <NuxtLink
            to="/rent"
            class="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:border-primary hover:text-primary transition"
          >
            Изменить поиск
          </NuxtLink>
          <NuxtLink
            to="/rent"
            class="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition"
          >
            Новый поиск
          </NuxtLink>
        </div>
      </div>

      <!-- Результаты -->
      <div v-else class="grid lg:grid-cols-3 gap-5">
        <article
          v-for="car in cars"
          :key="car.id"
          class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer"
          @click="openCar(car)"
        >
          <!-- Фото -->
          <div class="h-44 bg-gray-50 overflow-hidden relative">
            <img
              v-if="car.images?.[0]"
              :src="car.images[0]"
              :alt="car.name"
              class="w-full h-full object-contain p-2"
            >
            <div v-else class="w-full h-full flex items-center justify-center">
              <span class="text-6xl">🚗</span>
            </div>
            <span v-if="car.class" class="absolute top-2 left-2 text-xs bg-black/40 text-white px-2 py-0.5 rounded-lg backdrop-blur-sm">
              {{ car.class }}
            </span>
          </div>

          <!-- Контент -->
          <div class="p-4">
            <h3 class="font-bold text-lg mb-1">{{ car.brand }} {{ car.model }}</h3>
            <p v-if="car.year" class="text-xs text-gray-400 mb-3">{{ car.year }} г.</p>

            <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
              <div>
                <span class="text-gray-400 text-xs block">КПП</span>
                <span class="font-medium">{{ car.transmission || '—' }}</span>
              </div>
              <div>
                <span class="text-gray-400 text-xs block">Топливо</span>
                <span class="font-medium">{{ car.fuel || '—' }}</span>
              </div>
              <div>
                <span class="text-gray-400 text-xs block">Пробег/день</span>
                <span class="font-medium">{{ car.mileagePerDay ? car.mileagePerDay + ' км' : 'без лимита' }}</span>
              </div>
              <div>
                <span class="text-gray-400 text-xs block">Стоимость от</span>
                <span class="font-medium text-primary">{{ formatPrice(car.pricePerDay) }}/день</span>
              </div>
            </div>

            <button
              class="w-full h-10 bg-primary text-white font-medium rounded-xl hover:opacity-90 transition text-sm"
            >
              Подробнее
            </button>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>
