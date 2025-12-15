<script setup lang="ts">
import type { Hotel } from '~/src/entities/hotelListItem'
import { hotelAmenities } from '~/src/shared/constants'

const props = defineProps<{ hotel: Hotel }>()
const router = useRouter()
const route = useRoute()
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

const formatPrice = (n?: number) =>
  typeof n === 'number' ? n.toLocaleString('ru-RU') : ''

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

const cancelBadge = computed(() => {
  if (props.hotel.freeCancel) {
    // true | "до 12.10.2025"
    const tail =
      typeof props.hotel.freeCancel === 'string'
        ? ` ${props.hotel.freeCancel}`
        : ''
    return {
      text: `Беспл. отмена${tail}`,
      positive: true,
      icon: 'i-lucide-rotate-ccw',
    }
  }
  return {
    text: 'Без беспл. отмены',
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
          v-if="hotel.thumbnail && hotel.thumbnail.length > 0"
          v-slot="{ item }"
          class="h-full"
          :items="hotel.thumbnail"
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

        <!-- Удобства -->
        <div v-if="hotel.amenities?.length" class="flex justify-end gap-2 mb-4">
          <div
            v-for="code in hotel.amenities.slice(0, 6)"
            :key="code"
            class="flex-center rounded-lg ring-1 ring-gray-200 w-8 h-8 text-[#2d3137] text-xs"
          >
            <UIcon
              class="w-4 h-4"
              :name="hotelAmenities[code as keyof typeof hotelAmenities]?.icon"
            />

            <!-- 
            <span class="hidden sm:inline">
              {{ hotelAmenities[code as keyof typeof hotelAmenities]?.title }}
            </span> -->
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
