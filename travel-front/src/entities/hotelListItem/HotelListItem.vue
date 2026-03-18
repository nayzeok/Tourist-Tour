<script setup lang="ts">
import type { Hotel } from '~/src/entities/hotelListItem'
import { hotelAmenities } from '~/src/shared/constants'
import { useImageUrl } from '~/src/shared/utils/imageUrl'

const props = defineProps<{ hotel: Hotel }>()
const router = useRouter()
const route = useRoute()
const viewport = useViewport()

// Преобразуем URL изображений для работы с API proxy
const { getImageUrls } = useImageUrl()
const thumbnailUrls = computed(() => getImageUrls(props.hotel.thumbnail))

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

const formatPrice = (n?: number) =>
  typeof n === 'number' ? n.toLocaleString('ru-RU') : ''

const formatTimeWithTimezone = (time?: string, timeZone?: string) => {
  if (!time) return ''
  
  if (!timeZone) {
    return time
  }
  
  try {
    // Создаем дату с указанным временем
    const [hours, minutes] = time.split(':')
    const now = new Date()
    const date = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      Number(hours) || 0,
      Number(minutes) || 0,
      0
    ))
    
    // Получаем короткое название часового пояса (например, MSK, GMT+3)
    const formatter = new Intl.DateTimeFormat('ru-RU', {
      timeZone,
      timeZoneName: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
    
    const parts = formatter.formatToParts(date)
    const tzName = parts.find(part => part.type === 'timeZoneName')?.value || ''
    
    // Если получили название часового пояса, добавляем его
    if (tzName) {
      return `${time} ${tzName}`
    }
    
    return time
  } catch {
    // Если не удалось определить часовой пояс, просто возвращаем время
    return time
  }
}

const mealBadge = computed(() => {
  // если пришёл явный ярлык питания (например, "Завтрак")
  if (props.hotel.mealLabel) {
    return {
      text: `${props.hotel.mealLabel} вкл.`,
      positive: true,
      icon: 'fluent-emoji-high-contrast:fork-and-knife-with-plate',
    }
  }
  // ничего не включено
  return {
    text: 'Питание не вкл.',
    positive: false,
    icon: 'fluent-emoji-high-contrast:fork-and-knife-with-plate',
  }
})

/**
 * Форматирует дедлайн отмены с датой, временем и часовым поясом
 */
const formatCancellationDeadline = (deadlineLocal?: string | null, timeZone?: string) => {
  if (!deadlineLocal) return ''
  
  try {
    const date = new Date(deadlineLocal)
    if (isNaN(date.getTime())) return deadlineLocal
    
    // Форматируем дату и время
    const dateStr = date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    
    const timeStr = date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    })
    
    // Получаем название часового пояса
    let tzStr = ''
    if (timeZone) {
      try {
        const formatter = new Intl.DateTimeFormat('ru-RU', {
          timeZone,
          timeZoneName: 'short',
        })
        const parts = formatter.formatToParts(date)
        tzStr = parts.find(part => part.type === 'timeZoneName')?.value || ''
      } catch {
        // Игнорируем ошибки форматирования
      }
    }
    
    return tzStr ? `${dateStr} ${timeStr} ${tzStr}` : `${dateStr} ${timeStr}`
  } catch {
    return deadlineLocal
  }
}

/**
 * Получает символ валюты
 */
const getCurrencySymbol = (currency?: string) => {
  const symbols: Record<string, string> = {
    RUB: '₽',
    USD: '$',
    EUR: '€',
    GBP: '£',
  }
  return symbols[currency || 'RUB'] || currency || '₽'
}

/**
 * Бейдж политики отмены с полной информацией
 * 
 * Сценарии:
 * 1) 100% бесплатная отмена - freeCancellationPossible=true, deadline=null, penalty=null
 * 2) Бесплатно до даты, потом штраф - freeCancellationPossible=true, deadline заполнен, penalty заполнен
 * 3) Отмена всегда платная - freeCancellationPossible=false, penalty заполнен
 */
const cancelBadge = computed(() => {
  const policy = props.hotel.cancellationPolicy
  const timeZone = props.hotel.timeZone
  
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
  
  // Сценарий 1: 100% бесплатная отмена (без дедлайна и штрафа)
  if (freeCancellationPossible && !hasDeadline && !hasPenalty) {
    return {
      text: 'Бесплатная отмена в любое время',
      positive: true,
      icon: 'i-lucide-rotate-ccw',
    }
  }
  
  // Сценарий 2: Бесплатно до даты, потом штраф
  if (freeCancellationPossible && hasDeadline) {
    const formattedDeadline = formatCancellationDeadline(freeCancellationDeadlineLocal, timeZone)
    
    let text = `Бесплатная отмена до ${formattedDeadline}`
    
    if (hasPenalty) {
      text += `, далее штраф ${formatPrice(penaltyAmount)} ${currencySymbol}`
    }
    
    return {
      text,
      positive: true,
      icon: 'i-lucide-rotate-ccw',
    }
  }
  
  // Сценарий 3: Отмена всегда платная
  if (!freeCancellationPossible && hasPenalty) {
    return {
      text: `Отмена платная: штраф ${formatPrice(penaltyAmount)} ${currencySymbol}`,
      positive: false,
      icon: 'i-lucide-rotate-ccw',
    }
  }
  
  // Фоллбэк
  return {
    text: 'Без бесплатной отмены',
    positive: false,
    icon: 'i-lucide-rotate-ccw',
  }
})

const paymentBadge = computed(() => {
  // если с бэка прокинешь paymentType — лучше пользоваться им
  // const type = (props.hotel as any).paymentType as
  //   | 'OnSite'
  //   | 'Prepay'
  //   | 'Guarantee'
  //   | undefined

  const onSite = props.hotel.payOnSite

  if (onSite) {
    return {
      text: 'Оплата на cайте',
      positive: false, // нейтральный
      icon: 'i-lucide-wallet',
    }
  } else {
    return {
      text: 'Оплата на месте',
      positive: false, // нейтральный
      icon: 'i-lucide-wallet',
    }
  }

  // if (type === 'Prepay') {
  //   return {
  //     text: 'Оплата на сайте',
  //     positive: false,
  //     icon: 'i-lucide-wallet',
  //   }
  // }
  // if (type === 'Guarantee') {
  //   return {
  //     text: 'Гарантия картой',
  //     positive: false,
  //     icon: 'i-lucide-credit-card',
  //   }
  // }
  // // дефолт, если информации нет
  // return {
  //   text: 'Условия оплаты',
  //   positive: false,
  //   icon: 'i-lucide-wallet',
  // }
})

function goToHotel() {
  router.push({
    query: apiParams.value,
    path: `/hotels/${props.hotel.id}`,
  })
}
</script>

<template>
  <div class="bg-white rounded-2xl w-full overflow-hidden" @click="goToHotel">
    <div class="flex items-stretch flex-col lg:flex-row h-full">
      <div class="rounded-2xl lg:w-80 w-full h-60 lg:h-auto overflow-hidden">
        <UCarousel
          v-if="thumbnailUrls && thumbnailUrls.length > 0"
          v-slot="{ item }"
          class="h-full"
          :items="thumbnailUrls"
          loop
          :ui="{
            viewport: 'h-full', // <-- тот самый overflow-hidden
            container: 'h-full items-stretch',// <-- переопределяем items-start -> items-stretch
            item: 'h-full ps-0' // <-- слайд = 100% высоты контейнера
          }"
        >
          <div
            class="bg-cover bg-center w-full h-full"
            :style="{ backgroundImage: `url(${item})` }"
          />
        </UCarousel>
  
        <div v-else class="flex-center bg-cover bg-center rounded-lg w-80 h-full">
          <UIcon class="w-10 h-10 text-gray-300" name="i-heroicons-photo" />
        </div>
      </div>

      <!-- Контент -->
      <div v-if="!viewport.isLessThan('lg')" class="flex flex-col flex-1 p-4">
        <!-- Заголовок -->
        <div class="flex justify-between mb-4">
          <div class="flex-1">
            <h3 class="font-semibold text-lg truncate">
              {{ hotel.name }}
            </h3>

            <div class="flex gap-1">
              <UIcon
                v-for="i in hotel.stars || 0"
                :key="i"
                class="w-3 h-3 text-yellow-500"
                name="i-heroicons-star-solid"
              />
            </div>

            <p class="mt-2 text-gray-500 text-xs">
              {{ hotel.address }}
            </p>

            <!-- Преимущества под отелем -->
            <div v-if="hotel.amenities?.length" class="flex justify-start gap-2 mt-3 mb-2 flex-wrap">
              <div
                v-for="code in hotel.amenities.slice(0, 6)"
                :key="code"
                class="flex-center rounded-lg ring-1 ring-gray-200 w-8 h-8 text-[#2d3137] text-xs"
              >
                <UIcon
                  class="w-4 h-4"
                  :name="hotelAmenities[code as keyof typeof hotelAmenities]?.icon || 'lucide:circle-help'"
                />
              </div>
            </div>
          </div>

          <div v-if="hotel.rating || hotel.reviewsCount" class="flex items-center gap-2">
            <div class="flex flex-col items-end">
              <span class="font-semibold text-gray-700 text-sm">Отлично</span>
              <span class="text-[11px] text-gray-500">
                {{ hotel.reviewsCount || 0 }} отзывов
              </span>
            </div>

            <div class="place-items-center grid bg-green-500 rounded-xl w-8 h-8 font-semibold text-white text-xs">
              {{ hotel.rating ?? '—' }}
            </div>
          </div>
        </div>

        <!--        <pre>-->
        <!--          {{ hotel }}-->
        <!--        </pre>-->

        <!-- Бейджи -->
        <!-- Полоса условий как у Островка -->
        <div class="flex justify-between flex-col lg:flex-row items-start gap-4 bg-gray-50 mb-4 px-3 py-3 rounded-xl">
          <!-- слева: тип/название номера + три маркера -->
          <div class="flex flex-1 w-full items-start gap-4 flex-col lg:flex-row">
            <div class="flex">
              <div class="w-34 font-medium text-gray-900 text-sm line-clamp-3">
                {{ hotel.roomName || 'Номер' }}
              </div>
            </div>

            <!-- питание -->
            <div class="flex flex-col flex-1 gap-1">
              <div
                class="flex items-center gap-1.5 text-xs"
                :class="mealBadge.positive ? 'text-green-700' : 'text-gray-700'"
              >
                <UIcon
                  class="w-4 h-4"
                  :class="mealBadge.positive ? 'text-green-600' : 'text-gray-600'"
                  :name="mealBadge.icon"
                />

                <span class="truncate">
                  {{ mealBadge.text }}
                </span>
              </div>
   
              <!-- отмена -->
              <div
                class="flex items-center gap-1.5 text-xs"
                :class="cancelBadge.positive ? 'text-green-700' : 'text-gray-700'"
              >
                <UIcon
                  class="w-4 h-4"
                  :class="cancelBadge.positive ? 'text-green-600' : 'text-gray-600'"
                  :name="cancelBadge.icon"
                />
                <span class="truncate">{{ cancelBadge.text }}</span>
              </div>
   
              <!-- оплата -->
              <div class="flex items-center gap-1.5 text-gray-700 text-xs">
                <UIcon class="w-4 h-4 text-gray-600" :name="paymentBadge.icon" />
                <span class="truncate">{{ paymentBadge.text }}</span>
              </div>

              <!-- время заезда/выезда -->
              <div v-if="hotel.checkInTime || hotel.checkOutTime" class="flex items-center gap-1.5 text-gray-700 text-xs">
                <UIcon class="w-4 h-4 text-gray-600" name="i-lucide-clock" />
                <span class="truncate">
                  <template v-if="hotel.checkInTime && hotel.checkOutTime">
                    Заезд {{ formatTimeWithTimezone(hotel.checkInTime, hotel.timeZone) }}, выезд {{ formatTimeWithTimezone(hotel.checkOutTime, hotel.timeZone) }}
                  </template>
                  <template v-else-if="hotel.checkInTime">
                    Заезд {{ formatTimeWithTimezone(hotel.checkInTime, hotel.timeZone) }}
                  </template>
                  <template v-else-if="hotel.checkOutTime">
                    Выезд {{ formatTimeWithTimezone(hotel.checkOutTime, hotel.timeZone) }}
                  </template>
                </span>
              </div>
            </div>
          </div>

          <!-- справа: цена и подпись -->
          <div class="flex flex-col items-end">
            <div class="font-bold text-gray-900 text-xl">
              {{ formatPrice(hotel.price?.value) }} ₽
            </div>

            <div class="text-gray-500 text-xs">
              {{ hotel.guestsNote || '' }}
            </div>
          </div>
        </div>

        <!-- Цена -->
        <div class="flex justify-between items-end mt-auto">
          <p v-if="hotel.left" class="font-medium text-orange-600 text-sm">
            Осталось {{ hotel.left }} номер{{ hotel.left === 1 ? '' : 'ов' }}
          </p>

          <UButton class="ml-auto px-6 py-2 rounded-xl font-medium" size="lg" @click="goToHotel">
            Показать все номера
          </UButton>
        </div>
      </div>

      <div v-else class="px-4 pb-4 pt-2">
        <div class="flex justify-between mb-2">
          <div class="flex-1">
            <h3 class="font-semibold text-lg truncate">
              {{ hotel.name }}
            </h3>

            <div class="flex gap-1">
              <UIcon
                v-for="i in hotel.stars || 0"
                :key="i"
                class="w-3 h-3 text-yellow-500"
                name="i-heroicons-star-solid"
              />
            </div>

            <p class="mt-2 text-gray-500 text-xs">
              {{ hotel.address }}
            </p>

            <!-- Преимущества под отелем (mobile) -->
            <div v-if="hotel.amenities?.length" class="flex justify-start gap-2 mt-3 mb-2 flex-wrap">
              <div
                v-for="code in hotel.amenities.slice(0, 6)"
                :key="code"
                class="flex-center rounded-lg ring-1 ring-gray-200 w-7 h-7 text-[#2d3137] text-xs"
              >
                <UIcon
                  class="w-3.5 h-3.5"
                  :name="hotelAmenities[code as keyof typeof hotelAmenities]?.icon || 'lucide:circle-help'"
                />
              </div>
            </div>

            <div v-if="hotel.checkInTime || hotel.checkOutTime" class="mt-1 text-gray-600 text-xs flex items-center gap-1">
              <UIcon class="w-3 h-3" name="i-lucide-clock" />
              <span>
                <template v-if="hotel.checkInTime && hotel.checkOutTime">
                  Заезд {{ formatTimeWithTimezone(hotel.checkInTime, hotel.timeZone) }}, выезд {{ formatTimeWithTimezone(hotel.checkOutTime, hotel.timeZone) }}
                </template>
                <template v-else-if="hotel.checkInTime">
                  Заезд {{ formatTimeWithTimezone(hotel.checkInTime, hotel.timeZone) }}
                </template>
                <template v-else-if="hotel.checkOutTime">
                  Выезд {{ formatTimeWithTimezone(hotel.checkOutTime, hotel.timeZone) }}
                </template>
              </span>
            </div>
          </div>

          <div v-if="hotel.rating || hotel.reviewsCount" class="flex items-center gap-2">
            <div class="flex flex-col items-end">
              <span class="font-semibold text-gray-700 text-sm">Отлично</span>
              <span class="text-[11px] text-gray-500">
                {{ hotel.reviewsCount || 0 }} отзывов
              </span>
            </div>

            <div class="place-items-center grid bg-green-500 rounded-xl w-8 h-8 font-semibold text-white text-xs">
              {{ hotel.rating ?? '—' }}
            </div>
          </div>
        </div>

        <div class="flex flex-col">
          <div class="font-bold text-gray-900 text-xl">
            {{ formatPrice(hotel.price?.value) }} ₽
          </div>

          <div class="text-gray-500 text-xs">
            {{ hotel.guestsNote || '' }}
          </div>
        </div>

        <p v-if="hotel.left" class="font-medium text-orange-600 text-xs">
          Осталось {{ hotel.left }} номер{{ hotel.left === 1 ? '' : 'ов' }}
        </p>
      </div>
    </div>
  </div>
</template>
