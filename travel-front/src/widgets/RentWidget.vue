<script setup lang="ts">
const router = useRouter()
const route = useRoute()

const { data: rentCities } = await useAsyncData<string[]>(
  'rent-cities',
  () => $fetch(`${useRuntimeConfig().public.apiUrl}/rent/cities`).catch(() => []),
  { default: () => [] },
)

const selectedCity = ref('')
const cityDropdownOpen = ref(false)
const startDate = ref('')
const endDate = ref('')
const searching = ref(false)

const tomorrow = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 16)
})
const dayAfter = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 3)
  return d.toISOString().slice(0, 16)
})

onMounted(() => {
  startDate.value = (route.query.startDate as string) || tomorrow.value
  endDate.value = (route.query.endDate as string) || dayAfter.value
  if (route.query.city) selectedCity.value = route.query.city as string
})

function selectCity(city: string) {
  selectedCity.value = city
  cityDropdownOpen.value = false
}

async function search() {
  if (!selectedCity.value || !startDate.value || !endDate.value) return
  searching.value = true
  await router.push({
    path: '/rent/cars',
    query: { city: selectedCity.value, startDate: startDate.value, endDate: endDate.value },
  })
  searching.value = false
}

const canSearch = computed(() => !!selectedCity.value && !!startDate.value && !!endDate.value && !searching.value)
</script>

<template>
  <div class="container py-6 lg:py-10">
    <div class="bg-white rounded-2xl p-4 grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto] text-gray-900">
      <!-- Город -->
      <div class="flex flex-col gap-1 relative">
        <label class="text-xs text-gray-500 font-medium px-1">Город</label>
        <button
          class="h-12 rounded-xl border border-gray-200 bg-white px-3 text-left flex items-center justify-between focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
          type="button"
          @click="cityDropdownOpen = !cityDropdownOpen"
        >
          <span :class="selectedCity ? 'text-gray-900' : 'text-gray-400'">
            {{ selectedCity || 'Выберите город' }}
          </span>
          <span class="text-gray-400 text-sm">▾</span>
        </button>
        <div
          v-if="cityDropdownOpen"
          class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
        >
          <button
            v-for="city in rentCities"
            :key="city"
            class="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 hover:text-primary transition"
            :class="{ 'bg-blue-50 text-primary font-medium': selectedCity === city }"
            type="button"
            @click="selectCity(city)"
          >
            {{ city }}
          </button>
          <div v-if="!rentCities?.length" class="px-4 py-3 text-sm text-gray-400">
            Загрузка городов...
          </div>
        </div>
      </div>

      <!-- Начало аренды -->
      <div class="flex flex-col gap-1">
        <label class="text-xs text-gray-500 font-medium px-1">Начало аренды</label>
        <input
          v-model="startDate"
          class="h-12 rounded-xl border border-gray-200 px-3 text-gray-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
          type="datetime-local"
        >
      </div>

      <!-- Завершение аренды -->
      <div class="flex flex-col gap-1">
        <label class="text-xs text-gray-500 font-medium px-1">Завершение аренды</label>
        <input
          v-model="endDate"
          class="h-12 rounded-xl border border-gray-200 px-3 text-gray-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
          type="datetime-local"
        >
      </div>

      <!-- Кнопка -->
      <button
        class="h-12 mt-5 lg:mt-auto px-8 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 whitespace-nowrap"
        :disabled="!canSearch"
        @click="search"
      >
        {{ searching ? 'Поиск...' : 'Найти автомобиль' }}
      </button>
    </div>
  </div>
</template>
