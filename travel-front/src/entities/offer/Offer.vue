<script setup lang="ts">
import { hotelAmenities } from '~/src/shared/constants/index.js'

export type Amenity = {
  code: string
  name?: string
}

export type RoomOffer = {
  roomTypeId: string
  roomTypeName: string
  mealLabel?: string
  freeCancel?: boolean
  price: { total: number; perNight: number; currency: string }
  images: string[]
  addressLine?: string
  ratePlanId: string
  amenities?: Amenity[]
  availability?: number
  [key: string]: unknown
}

const props = defineProps<{ offer: RoomOffer[] }>()

const emit = defineEmits<{
  (e: 'book', option: RoomOffer): void
}>()

const galleryOpen = ref(false)

const primaryOffer = computed(() => props.offer?.[0])

const mealBadge = computed(() => {
  const label = primaryOffer.value?.mealLabel

  if (label) {
    return {
      text: `${label} включён`,
      positive: true,
      icon: 'fluent-emoji-high-contrast:fork-and-knife-with-plate',
    }
  }

  return {
    text: 'Питание не включено',
    positive: false,
    icon: 'fluent-emoji-high-contrast:fork-and-knife-with-plate',
  }
})

const cancelBadge = computed(() => {
  if (primaryOffer.value?.freeCancel) {
    return {
      text: 'Бесплатная отмена',
      positive: true,
      icon: 'i-lucide-rotate-ccw',
    }
  }

  return {
    text: 'Без бесплатной отмены',
    positive: false,
    icon: 'i-lucide-rotate-ccw',
  }
})

const paymentBadge = computed(() => {
  // TODO: заменить флагом из API, когда появится информация об условиях оплаты
  return {
    text: 'Оплата на месте',
    positive: false,
    icon: 'i-lucide-wallet',
  }
})

function openModalPhoto() {
  galleryOpen.value = true
}

function handleBook(option: RoomOffer) {
  emit('book', option)
}
</script>

<template>
  <UModal
    v-model:open="galleryOpen"
    :ui="{
      content: 'rounded-2xl min-w-200 p-4',
      base: 'rounded-xl overflow-hidden',
    }"
  >
    <template #content>
      <div class="grid max-h-[75vh] gap-2 overflow-y-auto">
        <div
          v-for="image in primaryOffer?.images ?? []"
          :key="image"
          class="relative h-126 overflow-hidden rounded-xl"
        >
          <img
            :alt="primaryOffer?.roomTypeName"
            class="absolute inset-0 h-full w-full object-cover"
            :src="image"
          >
        </div>
      </div>
    </template>
  </UModal>

  <div class="flex items-start gap-4 border-b flex-col lg:flex-row border-black/5 pb-6 last:border-none last:pb-0">
    <div class="flex w-full lg:w-[250px] shrink-0 flex-col gap-4">
      <div class="group relative h-60 lg:h-40 w-full cursor-pointer overflow-hidden rounded-2xl">
        <img
          :alt="primaryOffer?.roomTypeName"
          class="h-full w-full object-cover"
          :src="primaryOffer?.images?.[0]"
        >

        <div
          v-if="primaryOffer?.images?.length && primaryOffer.images.length > 1"
          class="absolute inset-0 flex items-end justify-end p-4 transition group-hover:bg-black/5"
          @click="openModalPhoto"
        >
          <div class="flex items-center gap-1 rounded-xl bg-[#464a4f] px-2 py-1 text-white">
            <div class="flex-center">
              <UIcon name="lucide:image" size="12" />
            </div>

            <div class="text-xs">
              {{ primaryOffer.images.length }} фото
            </div>
          </div>
        </div>
      </div>

      <div class="text-md font-semibold">
        {{ primaryOffer?.roomTypeName }}
      </div>

      <div class="flex flex-wrap gap-1">
        <div
          v-for="amenity in primaryOffer?.amenities ?? []"
          :key="amenity.code"
          class="flex items-center gap-2 rounded-full bg-gray-800/10 px-2 py-1 text-gray-800"
        >
          <UIcon :name="hotelAmenities[amenity.code]?.icon" />

          <span class="text-sm">
            {{ hotelAmenities[amenity.code]?.title ?? amenity.name ?? amenity.code }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex w-full items-start gap-4 overflow-x-auto rounded-2xl bg-gray-100 p-4">
      <div
        v-for="option in offer"
        :key="option.ratePlanId"
        class="flex h-full min-w-[280px] flex-col gap-4 rounded-2xl bg-white p-4"
      >
        <div class="flex flex-1 items-start gap-4">
          <div class="flex flex-1 flex-col gap-1">
            <div
              class="flex items-center gap-1.5"
              :class="mealBadge.positive ? 'text-green-700' : 'text-gray-700'"
            >
              <UIcon
                class="h-5 w-5"
                :class="mealBadge.positive ? 'text-green-600' : 'text-gray-600'"
                :name="mealBadge.icon"
              />

              <span class="truncate text-sm font-medium">
                {{ mealBadge.text }}
              </span>
            </div>

            <USeparator />

            <div
              class="flex items-center gap-1.5"
              :class="cancelBadge.positive ? 'text-green-700' : 'text-gray-700'"
            >
              <UIcon
                class="h-5 w-5"
                :class="cancelBadge.positive ? 'text-green-600' : 'text-gray-600'"
                :name="cancelBadge.icon"
              />

              <span class="truncate text-sm font-medium">
                {{ cancelBadge.text }}
              </span>
            </div>

            <USeparator />

            <div class="flex items-center gap-1.5 text-gray-700">
              <UIcon class="h-5 w-5 text-gray-600" :name="paymentBadge.icon" />
              <span class="truncate text-sm font-medium">{{ paymentBadge.text }}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col">
          <span class="text-2xl font-semibold">
            {{ option.price.perNight.toLocaleString('ru-RU') }} ₽
          </span>
          <span class="text-xs font-medium text-gray-600">
            За ночь
          </span>
        </div>

        <UButton block :disabled="!option.availability" @click="handleBook(option)">
          Забронировать
        </UButton>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
