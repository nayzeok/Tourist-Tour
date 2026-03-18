<script setup lang="ts">
import { useImageUrl } from '~/src/shared/utils/imageUrl'
import { hotelAmenities } from '~/src/shared/constants'

export type Amenity = {
  code: string
  name?: string
}

export type CancellationPolicy = {
  freeCancellationPossible: boolean
  freeCancellationDeadlineLocal?: string | null
  freeCancellationDeadlineUtc?: string | null
  penaltyAmount?: number | null
  penaltyCurrency?: string
}

export type RoomOffer = {
  roomTypeId: string
  roomTypeName: string
  /** Основные и дополнительные места (может отличаться по тарифу) */
  fullPlacementsName?: string | null
  mealLabel?: string
  price: { total: number; perNight: number; currency: string }
  images: string[]
  addressLine?: string
  ratePlanId: string
  amenities?: Amenity[]
  availability?: number
  cancellationPolicy?: CancellationPolicy
  [key: string]: unknown
}

const props = defineProps<{ offer: RoomOffer[] }>()

const emit = defineEmits<{
  (e: 'book', option: RoomOffer): void
}>()

const galleryOpen = ref(false)

const primaryOffer = computed(() => props.offer?.[0])

// Преобразуем URL изображений для работы с API proxy
const { getImageUrl, getImageUrls } = useImageUrl()
const offerImages = computed(() => getImageUrls(primaryOffer.value?.images))
const primaryImage = computed(() => getImageUrl(primaryOffer.value?.images?.[0]))

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

const formatPrice = (n?: number | null) =>
  typeof n === 'number' ? n.toLocaleString('ru-RU') : ''

const getCurrencySymbol = (currency?: string) => {
  const symbols: Record<string, string> = { RUB: '₽', USD: '$', EUR: '€', GBP: '£' }
  return symbols[currency || 'RUB'] || currency || '₽'
}

const cancelBadge = computed(() => {
  const policy = primaryOffer.value?.cancellationPolicy
  
  if (!policy) {
    return {
      text: 'Условия отмены уточняйте',
      positive: false,
      icon: 'i-lucide-rotate-ccw',
    }
  }
  
  const { freeCancellationPossible, freeCancellationDeadlineLocal, penaltyAmount, penaltyCurrency } = policy
  const hasPenalty = penaltyAmount != null && penaltyAmount > 0
  const hasDeadline = !!freeCancellationDeadlineLocal
  const currencySymbol = getCurrencySymbol(penaltyCurrency)
  
  // 100% бесплатная отмена
  if (freeCancellationPossible && !hasDeadline && !hasPenalty) {
    return {
      text: 'Бесплатная отмена',
      positive: true,
      icon: 'i-lucide-rotate-ccw',
    }
  }
  
  // Бесплатно до даты
  if (freeCancellationPossible && hasDeadline) {
    return {
      text: hasPenalty 
        ? `Бесплатная отмена, далее ${formatPrice(penaltyAmount)} ${currencySymbol}`
        : 'Бесплатная отмена до дедлайна',
      positive: true,
      icon: 'i-lucide-rotate-ccw',
    }
  }
  
  // Всегда платная
  if (!freeCancellationPossible && hasPenalty) {
    return {
      text: `Штраф ${formatPrice(penaltyAmount)} ${currencySymbol}`,
      positive: false,
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

const isAmenitiesExpanded = ref(false)

const roomAmenities = computed(() => {
  const source = (props.offer ?? []).flatMap((option) => option.amenities ?? [])

  const normalized = source
    .map((amenity) => {
      const code =
        typeof amenity === 'string'
          ? amenity
          : String((amenity as Amenity)?.code ?? '').trim()
      if (!code) return null

      const dictItem = hotelAmenities[code as keyof typeof hotelAmenities]
      const fallbackTitle =
        typeof amenity === 'string' ? amenity : (amenity as Amenity)?.name || code

      return {
        code,
        title: dictItem?.title || fallbackTitle,
        icon: dictItem?.icon || 'lucide:circle-help',
      }
    })
    .filter(Boolean) as Array<{ code: string; title: string; icon: string }>

  return normalized.filter(
    (item, idx, arr) => arr.findIndex((x) => x.code === item.code) === idx,
  )
})

const hasAmenitiesToggle = computed(() => roomAmenities.value.length > 10)

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
          v-for="image in offerImages"
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
          :src="primaryImage"
        >

        <div
          v-if="offerImages.length > 1"
          class="absolute inset-0 flex items-end justify-end p-4 transition group-hover:bg-black/5"
          @click="openModalPhoto"
        >
          <div class="flex items-center gap-1 rounded-xl bg-[#464a4f] px-2 py-1 text-white">
            <div class="flex-center">
              <UIcon name="lucide:image" size="12" />
            </div>

            <div class="text-xs">
              {{ offerImages.length }} фото
            </div>
          </div>
        </div>
      </div>

      <div class="text-md font-semibold">
        {{ primaryOffer?.roomTypeName }}
      </div>

    </div>

    <div class="flex w-full flex-col gap-3">
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

              <template v-if="option.fullPlacementsName">
                <USeparator />
                <div class="flex items-center gap-1.5 text-gray-700">
                  <UIcon class="h-5 w-5 text-gray-600 shrink-0" name="i-lucide-bed-double" />
                  <span class="truncate text-sm font-medium">{{ option.fullPlacementsName }}</span>
                </div>
              </template>
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

      <div v-if="roomAmenities.length" class="w-full rounded-2xl p-3">
        <div
          class="amenities-wrap flex flex-wrap gap-2 transition-all duration-200"
          :class="{ collapsed: !isAmenitiesExpanded }"
        >
          <div
            v-for="amenity in roomAmenities"
            :key="amenity.code"
            class="flex items-center gap-2 rounded-full bg-gray-200 px-3 py-1 text-gray-700"
          >
            <UIcon :name="amenity.icon || 'lucide:circle-help'" class="h-4 w-4" />
            <span class="text-xs font-medium">{{ amenity.title }}</span>
          </div>
        </div>

        <div v-if="hasAmenitiesToggle" class="mt-2 flex justify-end">
          <button
            class="text-sm font-medium text-primary hover:opacity-80"
            type="button"
            @click="isAmenitiesExpanded = !isAmenitiesExpanded"
          >
            {{ isAmenitiesExpanded ? 'Свернуть' : 'Ещё' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.amenities-wrap.collapsed {
  max-height: 88px;
  overflow: hidden;
}
</style>
