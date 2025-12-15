<script lang="ts" setup>
import { hotelAmenities } from '~/src/shared/constants'
import BookingModal from '~/src/entities/offer/BookingModal.vue'
import type { RoomOffer } from '~/src/entities/offer/Offer.vue'

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

const {
  data: hotel,
  status,
  refresh,
} = await useAsyncData<any>(`${route.params.id}`, async () => {
  // const { cityId, dates, adultCount, childAges } = apiParams.value
  //
  // if (!cityId || !dates) {
  //   return Promise.resolve([])
  // }
  //
  // const params = new URLSearchParams({
  //   cityId,
  //   dates,
  //   ...(adultCount && { adultCount }),
  //   ...(childAges && { childAges }),
  // })

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
})

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

const bookingOffer = ref<RoomOffer | null>(null)
const isBookingModalOpen = ref(false)

function openBooking(option: RoomOffer) {
  bookingOffer.value = option
  isBookingModalOpen.value = true
}

watch(isBookingModalOpen, (value) => {
  if (!value) {
    bookingOffer.value = null
  }
})

const allImages = computed(() => {
  const res = hotel.value.offers.reduce((acc, current) => {
    for (const img of current.images) {
      acc.add(img)
    }

    return acc
  }, new Set())

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

        <div class="flex items-center justify-between">
          <div class="text-gray-600 text-sm">
            {{ hotel.property.address }}
          </div>

          <div class="flex-center">
            <UButton
              color="neutral"
              icon="lucide:heart"
              size="sm"
              variant="soft"
            >
              Добавить в избранное
            </UButton>
          </div>
        </div>
      </div>
      
      <div class="h-80 w-full overflow-hidden lg:overflow-visible flex items-stretch">
        <UCarousel
          v-slot="{ item }"
          arrows
          :items="[...allImages, ...allImages]"
          loop
          :ui="{
            viewport: 'h-full', // <-- тот самый overflow-hidden
            container: 'h-full items-stretch flex-1',// <-- переопределяем items-start -> items-stretch
            item: basis, // <-- слайд = 100% высоты контейнера
            root: 'w-full  rounded-2xl ',
            arrows: 'opacity-50'
          }"
        >
          <div class="w-full h-full rounded-2xl bg-cover bg-center" :style="{ backgroundImage: `url(${item})` }" />
        </UCarousel>
      </div>

      <div class="grid lg:grid-cols-[300px_1fr] gap-4">
        <div class="rounded-2xl bg-white p-4 flex flex-col justify-between gap-1">
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
      
        <div class="rounded-2xl bg-white p-4">
          <div class="font-medium text-md mb-2">
            Популярные удобства
          </div>

          <USeparator class="mb-4" />
        
          <div class="flex flex-col justify-between gap-1">
            <div class="flex text-gray-600 items-center gap-2">
              <UIcon :name="hotelAmenities['parking'].icon" />
              
              <span>
                {{ hotelAmenities['parking'].title }}
              </span>
            </div>

            <div class="flex text-gray-600 items-center gap-2">
              <UIcon :name="hotelAmenities['wifi_internet'].icon" />

              <span>
                {{ hotelAmenities['wifi_internet'].title }}
              </span>
            </div>

            <div class="flex text-gray-600 items-center gap-2">
              <UIcon :name="hotelAmenities['swimming_pool'].icon" />

              <span>
                {{ hotelAmenities['swimming_pool'].title }}
              </span>
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

    <BookingModal
      v-model:open="isBookingModalOpen"
      :guests-count="guestsCount"
      :hotel-name="hotel.property?.name"
      :offer="bookingOffer"
      :property-id="propertyId"
      :stay="stayDates"
      @success="refresh"
    />
  </div>
</template>
