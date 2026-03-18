<script setup lang="ts">
import { useCitiesStore, useReplaceUrl } from '~/src/shared/store'
import type { Adult, Guest } from '.'

import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
} from '@internationalized/date'

const route = useRoute()
const router = useRouter()

const useReplaceUrlStore = useReplaceUrl()

const isLoading = computed(() => useReplaceUrlStore.loading)

const df = new DateFormatter('ru-RU', {
  dateStyle: 'medium',
})

const modelValue = shallowRef<{
  start: CalendarDate | null
  end: CalendarDate | null
}>({
  start: null,
  end: null,
})

const citiesStore = useCitiesStore()

const cities = ref<{ label: string; value: string }[]>([])

const selectedCity = ref<{ label: string; value: string }>()

const isOpenCalendar = ref(false)

const people = ref<Adult>({
  guests: [{ type: 'adult' }],
  room: 1,
})

const adultsCount = ref(1)
const childrenCount = ref(0)
const childAges = ref<number[]>([])

function formatDateToUrl(date: CalendarDate): string {
  const day = String(date.day).padStart(2, '0')
  const month = String(date.month).padStart(2, '0')
  const year = String(date.year)
  return `${day}.${month}.${year}`
}

function parseDateFromUrl(dateStr: string): CalendarDate | null {
  try {
    const [day, month, year] = dateStr.split('.').map(Number)
    return new CalendarDate(year, month, day)
  } catch {
    return null
  }
}

watch(childrenCount, (newCount, oldCount) => {
  if (newCount > oldCount) {
    // Добавляем возраста для новых детей
    for (let i = oldCount; i < newCount; i++) {
      childAges.value.push(0)
    }
  } else if (newCount < oldCount) {
    // Удаляем лишние возраста
    childAges.value = childAges.value.slice(0, newCount)
  }
})

function updateChildAge(index: number, age: number) {
  if (index >= 0 && index < childAges.value.length) {
    childAges.value[index] = age
  }
}

async function goToSearch() {
  const dates =
    modelValue.value.start && modelValue.value.end
      ? `${formatDateToUrl(modelValue.value.start)}-${formatDateToUrl(modelValue.value.end)}`
      : ''

  const childAgesParam = childAges.value.length > 0 ? childAges.value.join(',') : undefined

  const query: Record<string, string> = {
    cityId: selectedCity.value?.value || '',
    dates,
    adultCount: String(adultsCount.value),
  }

  if (childAgesParam) {
    query.childAges = childAgesParam
  }

  await router.push({
    path: '/hotels',
    query,
  })

  await new Promise((resolve) => setTimeout(resolve, 0))

  useReplaceUrlStore.setKey()

  console.log('goToSearch')
}

// Флаг для избежания циклических обновлений URL
const isUpdatingFromUrl = ref(false)
// Флаг для избежания обновления URL до инициализации
const isInitialized = ref(false)

onMounted(async () => {
  await citiesStore.getCities()

  cities.value = citiesStore.cities.map((city) => {
    return {
      label: city.name,
      value: city.id,
    }
  })

  selectedCity.value = cities.value.find(
    (city) => city.value === route.query.cityId
  )

  // Читаем даты из URL в формате DD.MM.YYYY-DD.MM.YYYY
  let datesSet = false
  if (route.query.dates && typeof route.query.dates === 'string') {
    const [startDateStr, endDateStr] = route.query.dates.split('-')

    if (startDateStr && endDateStr) {
      const startDate = parseDateFromUrl(startDateStr)
      const endDate = parseDateFromUrl(endDateStr)

      if (startDate && endDate) {
        isUpdatingFromUrl.value = true
        modelValue.value = {
          start: startDate,
          end: endDate,
        }
        datesSet = true
        nextTick(() => {
          isUpdatingFromUrl.value = false
        })
      }
    }
  }

  // Если даты не были установлены из URL, устанавливаем дефолтные
  if (!datesSet) {
    modelValue.value = {
      start: new CalendarDate(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        new Date().getDate() + 1
      ),
      end: new CalendarDate(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        new Date().getDate() + 2
      ),
    }
  }

  // Разрешаем обновление URL после инициализации
  isInitialized.value = true
})
</script>

<template>
  <div class="container bg-[#4E97FF]  p-4 rounded-2xl">
    <div class="grid lg:grid-cols-[1fr_1fr_280px_150px] gap-4 lg:gap-2">
      <USelectMenu
        v-model="selectedCity"
        class="h-14 rounded-xl ring-0"
        icon="mingcute:location-line"
        :items="cities"
        :loading="citiesStore.isLoading"
        placeholder="Выберите город"
        :search-input="{
          placeholder: 'Поиск по городу...',
        }"
        size="xl"
        trailing-icon=""
        :ui="{
          content: 'rounded-lg p-1',
          base: 'font-medium',
        }"
      >
        <template #empty>
          <div class="text-gray-500 dark:text-gray-400 py-2">
            Нет совпадений
          </div>
        </template>
      </USelectMenu>

      <UPopover v-model:open="isOpenCalendar">
        <template #default>
          <button
            class="flex items-center px-4 h-14 bg-white rounded-xl relative"
          >
            <span class="flex-center">
              <UIcon
                class="mr-2 text-(--ui-color-neutral-400)"
                name="i-lucide-calendar"
                size="24"
              />
            </span>

            <span class="font-medium">
              <template v-if="modelValue.start">
                <template v-if="modelValue.end">
                  {{ df.format(modelValue.start.toDate(getLocalTimeZone())) }} -
                  {{ df.format(modelValue.end.toDate(getLocalTimeZone())) }}
                </template>

                <template v-else>
                  {{ df.format(modelValue.start.toDate(getLocalTimeZone())) }}
                </template>
              </template>

              <template v-else> Выберите дату </template>
            </span>
          </button>
        </template>

        <template #content>
          <UCalendar
            v-model="modelValue"
            class="p-2"
            :number-of-months="2"
            range
          />
        </template>
      </UPopover>

      <UPopover
        :ui="{
          content: 'rounded-xl overflow-hidden',
        }"
      >
        <div
          class="flex h-14 bg-white cursor-pointer px-4 items-center rounded-xl"
        >
          <div class="flex-center mr-2 text-(--ui-color-neutral-400)">
            <UIcon name="line-md:account" size="24" />
          </div>

          <div class="flex items-center space-x-2">
            <div class="flex items-center space-x-2 font-medium">
              <div>{{ adultsCount }} взр.</div>
              <div v-if="childrenCount > 0">
                · {{ childrenCount }} реб.
              </div>
            </div>

            <div>·</div>

            <div class="flex items-center space-x-2 font-medium">
              <div>{{ people?.room }} -</div>

              <div>Номер</div>
            </div>
          </div>
        </div>

        <template #content>
          <div class="size-full flex flex-col w-[320px] max-h-[500px]">
            <div class="flex flex-col gap-3 p-4 overflow-y-auto">
              <div class="flex items-center justify-between">
                <div class="font-medium text-base">
                  Взрослые
                </div>

                <UInputNumber
                  v-model="adultsCount"
                  class="w-30 overflow-hidden rounded-xl !select-none ring-1 ring-black/5"
                  :max="15"
                  :min="1"
                  size="xl"
                  :ui="{
                    base: 'rounded-lg ring-0 focus-visible:ring-transparent',
                  }"
                />
              </div>

              <USeparator />

              <div class="flex items-center justify-between">
                <div class="font-medium text-base">
                  Дети
                </div>

                <UInputNumber
                  v-model="childrenCount"
                  class="w-30 overflow-hidden rounded-xl !select-none ring-1 ring-black/5"
                  :max="15"
                  :min="0"
                  size="xl"
                  :ui="{
                    base: 'rounded-lg ring-0 focus-visible:ring-transparent',
                  }"
                />
              </div>

              <div v-if="childrenCount > 0" class="flex flex-col gap-2 mt-2">
                <div class="text-sm font-medium text-gray-700">
                  Возраст детей:
                </div>

                <div
                  v-for="(age, index) in childAges"
                  :key="index"
                  class="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg"
                >
                  <label class="text-sm text-gray-600">
                    Ребенок {{ index + 1 }}
                  </label>

                  <USelectMenu
                    :model-value="age"
                    class="w-28"
                    :items="Array.from({ length: 18 }, (_, i) => ({ label: `${i} лет`, value: i }))"
                    option-attribute="label"
                    placeholder="Возраст"
                    size="sm"
                    value-attribute="value"
                    @update:model-value="(val) => updateChildAge(index, val)"
                  />
                </div>
              </div>
            </div>

            <USeparator />

            <div class="flex items-center justify-between p-4">
              <div class="flex items-center justify-between flex-1">
                <div class="font-medium text-base">
                  Номера
                </div>

                <UInputNumber
                  v-model="people.room"
                  class="w-30 overflow-hidden rounded-xl !select-none ring-1 ring-black/5"
                  :max="15"
                  :min="1"
                  size="xl"
                  :ui="{
                    base: 'rounded-lg ring-0 focus-visible:ring-transparent',
                  }"
                />
              </div>
            </div>
          </div>
        </template>
      </UPopover>

      <UButton
        block
        class="h-14"
        :loading="isLoading"
        size="xl"
        :ui="{
          base: 'rounded-xl',
        }"
        variant="solid"
        @click="goToSearch"
      >
        Найти
      </UButton>
    </div>
  </div>
</template>