<script lang="ts" setup>
import { hotelAmenities } from '~/src/shared/constants'
import type { RoomOffer } from '~/src/entities/offer/Offer.vue'
import { useImageUrl } from '~/src/shared/utils/imageUrl'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const router = useRouter()

const viewport = useViewport()

const apiParams = computed(() => {
  const cityId = route.query.cityId as string
  const dates = route.query.dates as string
  const adultCount = route.query.adultCount as string
  const childAges = route.query.childAges as string

  return {
    cityId,
    dates,
    adultCount,
    childAges,
  }
})

// Уникальный ключ для кэширования, включающий все параметры запроса
const cacheKey = computed(() => {
  const { cityId, dates, adultCount, childAges } = apiParams.value
  return `offer-${route.params.id}-${cityId}-${dates}-${adultCount}-${childAges || ''}`
})

const {
  data: hotel,
  status,
  refresh,
} = await useAsyncData<any>(
  cacheKey.value,
  async () => {
    const { cityId, dates, adultCount, childAges } = apiParams.value

    const params = new URLSearchParams({
      cityId,
      dates,
      ...(adultCount && { adultCount }),
      ...(childAges && { childAges }),
    })

    return $fetch(
      `${useRuntimeConfig().public.apiUrl}/offer/${route.params.id}?${params.toString()}`
    )
  },
  {
    // Предотвращаем дублирование запросов при одновременных вызовах
    dedupe: 'defer',
  }
)

function parseDateSegment(date?: string | null) {
  if (!date) {
    return null
  }

  const [day, month, year] = date.split('.')
  if (!day || !month || !year) {
    return null
  }

  return `${year}-${month}-${day}`
}

const stayDates = computed(() => {
  const dates = route.query.dates as string | undefined

  if (!dates) {
    return null
  }

  const [arrivalRaw, departureRaw] = dates.split('-')
  const arrival = parseDateSegment(arrivalRaw)
  const departure = parseDateSegment(departureRaw)

  if (!arrival || !departure) {
    return null
  }

  return { arrival, departure }
})

const adultCount = computed(() => {
  const raw = Number(route.query.adultCount)
  return Number.isFinite(raw) && raw > 0 ? raw : 1
})

const childAges = computed(() => {
  const raw = route.query.childAges

  if (!raw || typeof raw !== 'string') {
    return [] as number[]
  }

  return raw
    .split(',')
    .map((age) => Number(age))
    .filter((age) => Number.isFinite(age) && age >= 0)
})

const guestsCount = computed(() => ({
  adultCount: adultCount.value,
  ...(childAges.value.length ? { childAges: childAges.value } : {}),
}))

const propertyId = computed(() => {
  return (
    (hotel.value?.property?.id as string | undefined) ??
    (route.params.id as string | undefined) ??
    ''
  )
})

function goBack() {
  router.push({
    path: `/hotels`,
    query: { ...route.query },
  })
}

function openBooking(option: RoomOffer) {
  router.push({
    path: `/hotels/${propertyId.value}/booking`,
    query: {
      ...route.query,
      ratePlanId: option.ratePlanId,
      roomTypeId: option.roomTypeId,
    },
  })
}

// Преобразуем URL изображений для работы с API proxy
const { getImageUrl } = useImageUrl()

const allImages = computed(() => {
  const res = hotel.value.offers.reduce((acc: Set<string>, current: RoomOffer) => {
    for (const img of current.images || []) {
      // Преобразуем URL через наш прокси
      acc.add(getImageUrl(img))
    }

    return acc
  }, new Set<string>())

  return [...res]
})

// const hotelData = computed(() => {
//   return hotel.value[0]?.data
// })

// const hotelStartPrice = computed(() => {
//   return hotel.value.ratePlans.reduce((pre, val) => {}, 0)
// })

const offers = computed(() => {
  return hotel.value.offers.reduce((acc, current) => {
    const id = current.roomTypeId

    if (!acc[id]) {
      acc[id] = []
    }

    acc[id].push(current)

    return acc
  }, {})
})

const propertyAmenities = computed(() => {
  const rawPropertyAmenities = hotel.value?.property?.amenities ?? []
  const rawRoomAmenities = (hotel.value?.offers ?? []).flatMap(
    (o: any) => o?.amenities ?? [],
  )

  const source =
    rawPropertyAmenities.length > 0 ? rawPropertyAmenities : rawRoomAmenities

  const normalized = source
    .map((a: any) => {
      const code =
        typeof a === 'string'
          ? a
          : String(a?.code ?? a?.id ?? '').trim()
      if (!code) return null

      const dictItem = hotelAmenities[code as keyof typeof hotelAmenities]
      const fallbackTitle =
        typeof a === 'string'
          ? code
          : a?.displayName || a?.name || code

      return {
        code,
        icon: dictItem?.icon || 'lucide:circle-help',
        title: dictItem?.title || fallbackTitle,
      }
    })
    .filter(Boolean) as Array<{ code: string; icon: string; title: string }>

  // Убираем дубли по коду
  return normalized.filter(
    (item, idx, arr) => arr.findIndex((x) => x.code === item.code) === idx,
  )
})

const basis = computed(() => {
  return viewport.isLessThan('md') ? 'basis-1/1 h-full' : 'basis-1/3 h-full'
})
</script>

<template>
  <div class="container pt-4">
    <div class="grid gap-4">
      <div class="flex items-center">
        <button class="flex items-center space-x-2 rounded-xl bg-white px-3 py-2" @click="goBack">
          <span class="flex-center text-black/80">
            <UIcon name="material-symbols-light:arrow-back-ios-new-rounded" size="12" />
          </span>

          <span class="text-xs font-medium text-black/80">
            Вернутся к поиску
          </span>
        </button>
      </div>

      <div class="rounded-2xl bg-white p-4">
        <div class="flex gap-1 mb-2">
          <UIcon
            v-for="i in hotel.property?.stars || 0"
            :key="i"
            class="w-3 h-3 text-yellow-500"
            name="i-heroicons-star-solid"
          />
        </div>

        <div class="flex items-center justify-between mb-2">
          <div class="font-semibold text-md">
            {{ hotel.property.name }}
          </div>

          <div class="font-semibold">
            от {{ hotel.minPrice.toLocaleString('ru-RU') }} ₽
          </div>
        </div>

        <div class="text-gray-600 text-sm">
          {{ hotel.property.address }}
        </div>

        <div v-if="propertyAmenities.length" class="mt-4">
          <USeparator class="mb-3" />
          <div class="flex flex-wrap gap-2">
            <div
              v-for="amenity in propertyAmenities"
              :key="amenity.code"
              class="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-gray-700"
            >
              <UIcon :name="amenity.icon" class="w-4 h-4" />
              <span class="text-xs">
                {{ amenity.title }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="h-80 w-full overflow-hidden lg:overflow-visible flex items-stretch">
        <div
          class="w-full h-full rounded-2xl bg-cover bg-center"
          :style="{ backgroundImage: `url(${allImages[0] || hotel.property.thumbnail || ''})` }"
        />
      </div>

      <div class="grid gap-4">
        <div class="rounded-2xl bg-white p-4 flex flex-col justify-between gap-1 lg:max-w-[300px]">
          <div class="flex flex-col gap-1">
            <div class="text-sm text-gray-500">
              Заезд
            </div>

            <div class="font-semibold text-primary">
              {{ route.query.dates?.split('-')[0] }}
            </div>
          </div>
          
          <USeparator />

          <div class="flex flex-col gap-1">
            <div class="text-sm text-gray-500 ">
              Выезд
            </div>

            <div class="font-semibold text-primary">
              {{ route.query.dates?.split('-')[1] }}
            </div>
          </div>
        </div>
      </div>

      <!--      <div class="grid grid-cols-3 gap-2 grid-flow-row-dense auto-rows-[200px]">-->
      <!--        <div-->
      <!--          v-for="(i, idx) in [...allImages, ...allImages]"-->
      <!--          :key="i"-->
      <!--          class="relative rounded-xl overflow-hidden h-full"-->
      <!--          :class="(idx % 7 === 0) ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'"-->
      <!--        >-->
      <!--          <img-->
      <!--            :alt="i"-->
      <!--            class="absolute inset-0 w-full h-full object-cover"-->
      <!--            :src="i"-->
      <!--          >-->
      <!--        </div>-->
      <!--      </div>-->

      <div class="rounded-2xl bg-white p-4 flex flex-col justify-between overflow-hidden">
        <div class="font-semibold text-lg mb-4">
          Доступные варианты
        </div>
        
        <USeparator class="mb-6" />
        
        <div class="flex flex-col gap-4 min-w-0 overflow-hidden">
          <Offer
            v-for="(i, idx) in offers"
            :key="idx"
            :offer="i"
            @book="openBooking"
          />
        </div>
      </div>
    </div>
  </div>
</template>
