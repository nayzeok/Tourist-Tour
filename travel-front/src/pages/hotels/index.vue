<script setup lang="ts">
import type { Hotel } from '~/src/entities/hotelListItem'
import { useCitiesStore, useReplaceUrl } from '~/src/shared/store'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const citiesStore = useCitiesStore()
const useReplaceUrlStore = useReplaceUrl()

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
  data: hotels,
  status,
  refresh,
} = await useAsyncData<Hotel[]>('hotels', () => {
  const { cityId, dates, adultCount, childAges } = apiParams.value

  if (!cityId || !dates) {
    return Promise.resolve([])
  }

  const params = new URLSearchParams({
    cityId,
    dates,
    ...(adultCount && { adultCount }),
    ...(childAges && { childAges }),
  })

  return $fetch(
    `${useRuntimeConfig().public.apiUrl}/hotels?${params.toString()}`
  )
})

watch(status, (val) => {
  useReplaceUrlStore.setLoading(val === 'pending')
})

watch(
  () => useReplaceUrlStore.key,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      refresh()
    }
  }
)

const cityName = computed(() => {
  return citiesStore.currentCity(route.query.cityId as string)?.name
})
</script>

<template>
  <div class="container grid grid-cols-10 gap-4 pt-8">
    <!--    <div class="col-span-2 overflow-hidden flex flex-col flex-start">-->
    <!--      <div class="bg-white rounded-2xl p-4 ">-->
    <!--        &lt;!&ndash; фильтры &ndash;&gt;-->
    <!--      </div>-->
    <!--    </div>-->

    <template v-if="status === 'success'">
      <div class="flex-1 flex flex-col gap-4 col-span-10">
        <!--        <div class="flex-1 flex flex-col gap-4 col-span-8">-->
        <div class="font-semibold">
          Доступные объекты в {{ cityName }}
        </div>

        <div v-if="hotels?.length" class="flex flex-col gap-4 min-h-0">
          <HotelListItem v-for="(hotel, i) in hotels" :key="i" :hotel="hotel" />
        </div>

        <div v-else>
          По вашему запросу нет доступных вариантов
        </div>
      </div>
    </template>

    <template v-else>
      <div class="flex-1 flex flex-col gap-4 col-span-10">
        <div class="font-semibold">
          Загрузка отелей...
        </div>
      </div>
    </template>
  </div>
</template>