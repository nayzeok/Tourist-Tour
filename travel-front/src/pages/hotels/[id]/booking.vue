<script setup lang="ts">
import type { FetchError } from 'ofetch'
import type { RoomOffer } from '~/src/entities/offer/Offer.vue'
import { useAuthStore, useCitiesStore } from '~/src/shared/store'
import { useImageUrl } from '~/src/shared/utils/imageUrl'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const router = useRouter()
const runtimeConfig = useRuntimeConfig()
const toast = useToast()
const authStore = useAuthStore()
const citiesStore = useCitiesStore()

await authStore.ensureStatus()
await citiesStore.getCities()

// Получаем параметры из query
const propertyId = computed(() => route.params.id as string)
const ratePlanId = computed(() => route.query.ratePlanId as string | undefined)
const roomTypeId = computed(() => route.query.roomTypeId as string | undefined)
const dates = computed(() => route.query.dates as string | undefined)
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

// DEV helper: позволяет подменять checksum через query (?forceChecksum=...)
const forcedChecksum = computed(() => {
  if (!import.meta.dev) return null
  const raw = route.query.forceChecksum
  return typeof raw === 'string' && raw.trim() ? raw.trim() : null
})

const guestsCount = computed(() => ({
  adultCount: adultCount.value,
  ...(childAges.value.length ? { childAges: childAges.value } : {}),
}))

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
  if (!dates.value) {
    return null
  }
  const [arrivalRaw, departureRaw] = dates.value.split('-')
  const arrival = parseDateSegment(arrivalRaw)
  const departure = parseDateSegment(departureRaw)
  if (!arrival || !departure) {
    return null
  }
  return { arrival, departure }
})

// Уникальный ключ для кэширования, включающий все параметры запроса
const bookingCacheKey = computed(() => {
  const cityId = route.query.cityId as string || ''
  return `booking-${propertyId.value}-${cityId}-${dates.value}-${adultCount.value}-${childAges.value.join(',')}`
})

// Загружаем данные отеля и предложения
const {
  data: hotel,
  status,
  error: hotelError,
} = await useAsyncData<any>(
  bookingCacheKey.value,
  async () => {
    if (!dates.value) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Отсутствуют даты для бронирования',
      })
    }

    const params = new URLSearchParams({
      cityId: route.query.cityId as string || '',
      dates: dates.value,
      ...(adultCount.value && { adultCount: String(adultCount.value) }),
      ...(childAges.value.length && { childAges: childAges.value.join(',') }),
    })

    return $fetch(
      `${runtimeConfig.public.apiUrl}/offer/${propertyId.value}?${params.toString()}`
    )
  },
  {
    // Предотвращаем дублирование запросов при одновременных вызовах
    dedupe: 'defer',
  }
)

// Находим нужное предложение
const offer = computed<RoomOffer | null>(() => {
  if (!hotel.value?.offers || !ratePlanId.value) {
    return null
  }

  return hotel.value.offers.find(
    (o: RoomOffer) => o.ratePlanId === ratePlanId.value
  ) || null
})

// Преобразуем URL изображений для работы с API proxy
const { getImageUrl, getImageUrls } = useImageUrl()
const offerImages = computed(() => getImageUrls(offer.value?.images))
const offerPrimaryImage = computed(() => getImageUrl(offer.value?.images?.[0]))

// Проверяем наличие предложения после загрузки
watch([hotel, ratePlanId], () => {
  if (status.value === 'success' && hotel.value && ratePlanId.value && !offer.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Предложение не найдено',
    })
  }
})

const cityName = computed(() => {
  const cityId = route.query.cityId as string
  return citiesStore.currentCity(cityId)?.name || ''
})

const form = reactive({
  guestLastName: '',
  guestFirstName: '',
  payerLastName: '',
  payerFirstName: '',
  payerEmail: '',
  payerPhone: '',
  shareWithHotel: true,
  arrivalTime: 'Неизвестно',
  specialRequests: '',
})

const bookingResult = ref<any | null>(null)
const bookingError = ref<string | null>(null)
const submitting = ref(false)
const paymentMethod = ref<'card' | 'sbp'>('card')
const promoCode = ref('')
const promoCodeExpanded = ref(false)
const specialRequestsExpanded = ref(false)
const consentPersonalData = ref(false)
const consentMarketing = ref(false)

/** Показывать ошибки валидации под полями (после попытки отправки) */
const validationShown = ref(false)

// Состояние для модального окна изменения цены/доступности
const priceChangedModal = ref(false)
const priceChangeInfo = ref<{
  originalPrice: number | null
  alternativePrice: number | null
  priceDifference: number | null
  currencyCode: string
  alternativeToken: string
  warnings?: Array<{ code?: string | null; message?: string | null }>
} | null>(null)

// Нет доступности: номера закончились, альтернативы нет
const noAvailabilityModal = ref(false)
const noAvailabilityMessage = ref('')

const requiredFieldsMissing = computed(() => {
  return (
    !form.guestLastName.trim() ||
    !form.guestFirstName.trim() ||
    !form.payerLastName.trim() ||
    !form.payerFirstName.trim() ||
    !form.payerEmail.trim() ||
    !form.payerPhone.trim() ||
    !consentPersonalData.value
  )
})

/** Ошибки по полям для отображения под инпутами */
const fieldErrors = computed(() => ({
  guestLastName: !form.guestLastName.trim() ? 'Укажите фамилию гостя' : '',
  guestFirstName: !form.guestFirstName.trim() ? 'Укажите имя гостя' : '',
  payerLastName: !form.payerLastName.trim() ? 'Укажите фамилию покупателя' : '',
  payerFirstName: !form.payerFirstName.trim() ? 'Укажите имя покупателя' : '',
  payerEmail: !form.payerEmail.trim()
    ? 'Укажите email'
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.payerEmail.trim())
      ? 'Некорректный email'
      : '',
  payerPhone: !form.payerPhone.trim()
    ? 'Укажите телефон'
    : form.payerPhone.replace(/\D/g, '').length < 10
      ? 'Введите номер не короче 10 цифр'
      : '',
  consentPersonalData: !consentPersonalData.value ? 'Необходимо согласие на обработку персональных данных' : '',
}))

/** Список текстов ошибок для тоста */
const validationErrorList = computed(() => {
  const err = fieldErrors.value
  const list: string[] = []
  if (err.guestLastName) list.push('Фамилия гостя')
  if (err.guestFirstName) list.push('Имя гостя')
  if (err.payerLastName) list.push('Фамилия покупателя')
  if (err.payerFirstName) list.push('Имя покупателя')
  if (err.payerEmail) list.push('Email')
  if (err.payerPhone) list.push('Телефон')
  if (err.consentPersonalData) list.push('Согласие на обработку данных')
  return list
})

/** Есть ли ошибки валидации (любое поле неверно) */
const hasValidationErrors = computed(() => validationErrorList.value.length > 0)

function formatDisplayDate(date: string) {
  const [year, month, day] = date.split('-')
  if (!year || !month || !day) {
    return date
  }
  return `${day}.${month}.${year}`
}

function formatDateForHeader(date: string) {
  const [year, month, day] = date.split('-')
  if (!year || !month || !day) {
    return date
  }
  const monthNames = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  const monthIndex = parseInt(month) - 1
  return `${day} ${monthNames[monthIndex]}`
}

const headerDates = computed(() => {
  if (!stayDates.value) {
    return ''
  }
  return `${formatDateForHeader(stayDates.value.arrival)}-${formatDateForHeader(stayDates.value.departure)}`
})

const guestsLabel = computed(() => {
  const adults = guestsCount.value.adultCount
  const children = guestsCount.value.childAges?.length ?? 0
  if (adults === 1 && children === 0) {
    return '1 гость'
  }
  return `${adults} ${children > 0 ? `+ ${children}` : ''} гост${adults === 1 ? 'ь' : 'ей'}`
})

const nightsCount = computed(() => {
  if (!stayDates.value) {
    return null
  }
  const arrival = new Date(stayDates.value.arrival)
  const departure = new Date(stayDates.value.departure)
  const diff = Math.round(
    (departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24)
  )
  return diff > 0 ? diff : null
})

const checkInTime = computed(() => {
  if (!stayDates.value) {
    return ''
  }
  const date = new Date(stayDates.value.arrival)
  const days = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']
  const dayName = days[date.getDay()]
  return `${formatDisplayDate(stayDates.value.arrival)}, ${dayName} c 15:00`
})

const checkOutTime = computed(() => {
  if (!stayDates.value) {
    return ''
  }
  const date = new Date(stayDates.value.departure)
  const days = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']
  const dayName = days[date.getDay()]
  return `${formatDisplayDate(stayDates.value.departure)}, ${dayName} до 12:00`
})

const roomDescription = computed(() => {
  if (!offer.value) {
    return ''
  }
  // Можно добавить более детальное описание из API
  return 'Стандартный номер с двумя раздельными кроватями, низкий этаж'
})

/**
 * Форматирует дедлайн с датой, временем и часовым поясом
 */
const formatCancellationDeadline = (deadlineLocal?: string | null) => {
  if (!deadlineLocal) return ''
  
  try {
    const date = new Date(deadlineLocal)
    if (isNaN(date.getTime())) return deadlineLocal
    
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return deadlineLocal
  }
}

const getCurrencySymbol = (currency?: string) => {
  const symbols: Record<string, string> = { RUB: '₽', USD: '$', EUR: '€', GBP: '£' }
  return symbols[currency || 'RUB'] || currency || '₽'
}

/**
 * Информация о политике отмены для страницы бронирования
 */
const cancellationInfo = computed(() => {
  const policy = offer.value?.cancellationPolicy
  
  if (!policy) {
    return {
      text: 'Условия отмены уточняйте при бронировании',
      isPositive: false,
    }
  }
  
  const { freeCancellationPossible, freeCancellationDeadlineLocal, penaltyAmount, penaltyCurrency } = policy
  const hasPenalty = penaltyAmount != null && penaltyAmount > 0
  const hasDeadline = !!freeCancellationDeadlineLocal
  const currencySymbol = getCurrencySymbol(penaltyCurrency)
  const formattedAmount = hasPenalty 
    ? penaltyAmount!.toLocaleString('ru-RU', { maximumFractionDigits: 0 })
    : ''
  
  // Сценарий 1: 100% бесплатная отмена
  if (freeCancellationPossible && !hasDeadline && !hasPenalty) {
    return {
      text: 'Бесплатная отмена в любое время',
      isPositive: true,
    }
  }
  
  // Сценарий 2: Бесплатно до даты, потом штраф
  if (freeCancellationPossible && hasDeadline) {
    const formattedDeadline = formatCancellationDeadline(freeCancellationDeadlineLocal)
    
    let text = `Бесплатная отмена до ${formattedDeadline}`
    if (hasPenalty) {
      text += `. После этого времени штраф ${formattedAmount} ${currencySymbol}`
    }
    
    return {
      text,
      isPositive: true,
    }
  }
  
  // Сценарий 3: Отмена всегда платная
  if (!freeCancellationPossible && hasPenalty) {
    return {
      text: `Отмена платная. Штраф при отмене: ${formattedAmount} ${currencySymbol}`,
      isPositive: false,
    }
  }
  
  return {
    text: 'Без бесплатной отмены',
    isPositive: false,
  }
})

function resolveErrorMessage(error: unknown) {
  const fallback = 'Не удалось создать бронирование. Попробуйте ещё раз.'

  if (error && typeof error === 'object') {
    const fetchError = error as FetchError<any>
    const data = fetchError?.data as any

    if (typeof data === 'string' && data) {
      return data
    }

    if (data?.message) {
      return data.message
    }

    if (Array.isArray(data?.errors) && data.errors[0]?.message) {
      return data.errors[0].message
    }

    if ('message' in error && fetchError.message) {
      return fetchError.message
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

function goBack() {
  router.push({
    path: `/hotels/${propertyId.value}`,
    query: { ...route.query },
  })
}

function buildBookingPayload(options?: { acceptAlternative?: boolean; alternativeToken?: string }) {
  const roomStayPayload = offer.value
    ? {
        ...offer.value,
        ...(forcedChecksum.value ? { checksum: forcedChecksum.value } : {}),
      }
    : offer.value

  return {
    propertyId: propertyId.value,
    roomStay: roomStayPayload,
    arrival: stayDates.value!.arrival,
    departure: stayDates.value!.departure,
    guestsCount: {
      adultCount: guestsCount.value.adultCount,
      ...(guestsCount.value.childAges?.length
        ? { childAges: guestsCount.value.childAges }
        : {}),
    },
    customer: {
      firstName: form.payerFirstName.trim(),
      lastName: form.payerLastName.trim(),
      phone: form.payerPhone.trim(),
      email: form.payerEmail.trim(),
      ...(form.specialRequests.trim() ? { comment: form.specialRequests.trim() } : {}),
    },
    guests: [
      {
        firstName: form.guestFirstName.trim(),
        lastName: form.guestLastName.trim(),
      },
    ],
    ...(hotel.value?.checkInTime ? { checkInTime: hotel.value.checkInTime } : {}),
    ...(hotel.value?.checkOutTime ? { checkOutTime: hotel.value.checkOutTime } : {}),
    ...(options?.acceptAlternative ? { acceptAlternative: true } : {}),
    ...(options?.alternativeToken ? { alternativeToken: options.alternativeToken } : {}),
  }
}

type PreparePaymentResult =
  | { paymentId: string; amount: number; currencyCode: string }
  | {
      priceChanged: true
      originalPrice: number | null
      alternativePrice: number | null
      priceDifference: number | null
      currencyCode: string
      alternativeToken: string
      warnings?: Array<{ code?: string | null; message?: string | null }>
    }
  | { noAvailability: true; message: string; warnings?: Array<{ code?: string | null; message?: string | null }> }

function buildPaykeeperCart(totalAmount: number) {
  const title = `${hotel.value?.property?.name ?? 'Бронирование'} — ${offer.value?.roomTypeName ?? 'Номер'}`
  return [
    {
      name: title.slice(0, 120),
      price: totalAmount,
      quantity: 1,
      sum: totalAmount,
      tax: 'none',
      item_type: 'service' as const,
    },
  ]
}

async function openPaykeeperPayment(
  paymentId: string,
  amount: number,
): Promise<boolean> {
  const invoice = await $fetch<{ paymentLink?: string; invoiceId?: string; error?: string }>(
    `${runtimeConfig.public.apiUrl}/paykeeper/invoice`,
    {
      method: 'POST',
      body: {
        orderId: paymentId,
        amount,
        clientEmail: form.payerEmail.trim(),
        clientPhone: form.payerPhone.trim(),
        cart: buildPaykeeperCart(amount),
      },
    },
  )

  if (!invoice?.paymentLink) {
    throw new Error(invoice?.error || 'Не удалось создать счёт на оплату')
  }

  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('lastBookingPaymentId', paymentId)
  }

  window.location.href = invoice.paymentLink
  return true
}

function handlePreparePaymentResult(result: PreparePaymentResult): { redirected: boolean } {
  if ('noAvailability' in result && result.noAvailability) {
    noAvailabilityMessage.value =
      result.message || 'Номера по выбранным условиям закончились. Вернитесь к поиску.'
    noAvailabilityModal.value = true
    return { redirected: false }
  }

  if ('priceChanged' in result && result.priceChanged) {
    priceChangeInfo.value = {
      originalPrice: result.originalPrice ?? null,
      alternativePrice: result.alternativePrice ?? null,
      priceDifference: result.priceDifference ?? null,
      currencyCode: result.currencyCode || 'RUB',
      alternativeToken: result.alternativeToken,
      warnings: result.warnings,
    }
    priceChangedModal.value = true
    return { redirected: false }
  }

  return { redirected: false }
}

async function submitBooking() {
  if (submitting.value) return
  // После изменения цены повторный "Оплатить" запрещён:
  // пользователь должен выбрать действие в модалке (принять новые условия или поиск заново).
  if (priceChangedModal.value || priceChangeInfo.value?.alternativeToken) {
    priceChangedModal.value = true
    toast.add({
      id: 'booking-price-changed-confirm-required',
      title: 'Требуется подтверждение',
      description: 'Выберите действие в окне изменения условий.',
      color: 'warning',
    })
    return
  }
  if (!offer.value || !propertyId.value || !stayDates.value) {
    bookingError.value =
      'Отсутствуют обязательные данные для бронирования. Обновите страницу и попробуйте снова.'
    return
  }

  if (hasValidationErrors.value) {
    validationShown.value = true
    bookingError.value = 'Заполните все обязательные поля.'
    const list = validationErrorList.value
    toast.add({
      id: 'booking-validation',
      title: 'Заполните обязательные поля',
      description: list.length ? list.join(', ') : 'Проверьте данные формы',
      color: 'error',
    })
    nextTick(() => {
      const first = document.querySelector('[data-booking-field="error"]')
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
    return
  }

  submitting.value = true
  bookingError.value = null
  validationShown.value = false

  const payload = buildBookingPayload()

  try {
    const result = await $fetch<PreparePaymentResult>(
      `${runtimeConfig.public.apiUrl}/reservation/prepare-payment`,
      {
        method: 'POST',
        body: payload,
      }
    )

    if ('paymentId' in result && result.paymentId) {
      await openPaykeeperPayment(result.paymentId, result.amount)
      return
    }

    handlePreparePaymentResult(result)
  } catch (error) {
    const message = resolveErrorMessage(error)
    bookingError.value = message
    toast.add({
      id: 'booking-error',
      title: 'Не удалось забронировать',
      description: message,
      color: 'error',
    })
  } finally {
    submitting.value = false
  }
}

/**
 * Подтверждение бронирования на новых условиях (после изменения цены).
 * Отправляется один запрос quick-book с acceptAlternative + alternativeToken (только create, без повторного verify).
 */
async function acceptAlternativeBooking() {
  if (!priceChangeInfo.value?.alternativeToken) return
  if (submitting.value) return

  submitting.value = true

  const payload = buildBookingPayload({
    acceptAlternative: true,
    alternativeToken: priceChangeInfo.value.alternativeToken,
  })

  try {
    const result = await $fetch<PreparePaymentResult>(
      `${runtimeConfig.public.apiUrl}/reservation/prepare-payment`,
      {
        method: 'POST',
        body: {
          ...payload,
          acceptAlternative: true,
          alternativeToken: priceChangeInfo.value.alternativeToken,
          amountForAlternative: priceChangeInfo.value.alternativePrice ?? undefined,
        },
      }
    )

    if ('paymentId' in result && result.paymentId) {
      priceChangedModal.value = false
      await openPaykeeperPayment(result.paymentId, result.amount)
      return
    }

    const prevInfo = priceChangeInfo.value
    handlePreparePaymentResult(result)

    if ('priceChanged' in result && result.priceChanged) {
      if (prevInfo) {
        priceChangeInfo.value = {
          ...priceChangeInfo.value!,
          originalPrice: result.originalPrice ?? prevInfo.originalPrice,
          currencyCode: result.currencyCode || prevInfo.currencyCode,
        }
      }
      toast.add({
        id: 'booking-price-changed-again',
        title: 'Условия снова изменились',
        description: 'Цена обновлена. Проверьте новую стоимость.',
        color: 'warning',
      })
      return
    }

    if ('noAvailability' in result && result.noAvailability) {
      priceChangedModal.value = false
      priceChangeInfo.value = null
      return
    }
  } catch (error) {
    const message = resolveErrorMessage(error)
    priceChangedModal.value = false
    bookingError.value = message
    toast.add({
      id: 'booking-error',
      title: 'Не удалось забронировать',
      description: message,
      color: 'error',
    })
  } finally {
    submitting.value = false
  }
}

/**
 * Отклонение новых условий / возврат к поиску (при изменении условий или отсутствии номеров)
 */
function rejectAlternativeAndSearch() {
  priceChangedModal.value = false
  priceChangeInfo.value = null
  noAvailabilityModal.value = false
  noAvailabilityMessage.value = ''

  router.push({
    path: '/hotels',
    query: { ...route.query },
  })
}

/**
 * Форматирование цены для отображения
 */
function formatPriceDisplay(price: number | null, currency: string) {
  if (price === null) return '—'
  const formatted = price.toLocaleString('ru-RU', { maximumFractionDigits: 0 })
  const symbol = currency === 'RUB' ? '₽' : currency
  return `${formatted} ${symbol}`
}

// Проверяем наличие обязательных данных
if (!ratePlanId.value || !dates.value) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Отсутствуют обязательные параметры для бронирования',
  })
}

// Проверяем ошибку загрузки отеля
if (hotelError.value) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Не удалось загрузить данные отеля',
  })
}
</script>

<template>
  <div class="container pt-4 pb-8">
    <div v-if="status === 'pending'" class="flex items-center justify-center min-h-[400px]">
      <div class="flex flex-col items-center gap-4">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
        <p class="text-gray-600">Загрузка данных...</p>
      </div>
    </div>

    <div v-else class="grid lg:grid-cols-[1fr_400px] gap-6">
      <!-- Левая колонка -->
      <div class="flex flex-col gap-6">
        <!-- Блок бронирования отеля -->
        <div class="bg-white rounded-2xl overflow-hidden">
          <!-- Хедер с городом, датами и гостями -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200">
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-bed" class="w-5 h-5 text-primary" />
              <div class="font-semibold">{{ cityName }}</div>
              <div class="text-gray-600">{{ headerDates }}</div>
              <div class="text-gray-600">{{ guestsLabel }}</div>
            </div>
            <UButton
              icon="i-lucide-arrow-up"
              size="xs"
              variant="ghost"
              color="primary"
              @click="goBack"
            />
          </div>

          <!-- Основной контент -->
          <div class="p-4">
            <div class="flex gap-6">
              <!-- Левая часть: информация об отеле и номере -->
              <div class="flex-1 min-w-0">
                <!-- Звезды рейтинга -->
                <div class="flex gap-1 mb-2">
                  <UIcon
                    v-for="i in hotel?.property?.stars || 0"
                    :key="i"
                    class="w-4 h-4 text-yellow-500"
                    name="i-heroicons-star-solid"
                  />
                </div>

                <!-- Название отеля -->
                <h1 class="text-xl font-semibold mb-2">
                  {{ hotel?.property?.name }}
                </h1>

                <!-- Адрес -->
                <p class="text-sm text-gray-600 mb-4">
                  {{ hotel?.property?.address }}
                </p>

                <!-- Время заезда/выезда -->
                <div class="space-y-1 text-sm text-gray-600 mb-4">
                  <div>
                    {{ checkInTime }}
                  </div>
                  <div>
                    {{ checkOutTime }}
                  </div>
                </div>

                <USeparator class="my-4" />

                <!-- Информация о номере -->
                <div class="flex gap-6">
                  <div class="flex-1">
                    <p class="text-sm text-gray-600 mb-2">
                      1 номер для {{ adultCount }} взросл{{ adultCount === 1 ? 'ого' : 'ых' }} на {{ nightsCount }} {{ nightsCount === 1 ? 'ночь' : nightsCount < 5 ? 'ночи' : 'ночей' }}
                    </p>
                    <p class="text-sm text-gray-700 mb-4">
                      {{ roomDescription }}
                    </p>
                    <button class="text-sm text-primary hover:underline">
                      Подробнее о номере
                    </button>
                  </div>

                  <!-- Политики бронирования справа от описания -->
                  <div class="flex-shrink-0 space-y-2 min-w-[200px]">
                    <div class="flex items-center gap-2 text-sm text-gray-700">
                      <UIcon name="i-lucide-utensils-crossed" class="w-4 h-4 flex-shrink-0" />
                      <span>Питание не включено</span>
                    </div>
                    <div 
                      v-if="cancellationInfo.text" 
                      class="flex items-start gap-2 text-sm"
                      :class="cancellationInfo.isPositive ? 'text-green-700' : 'text-orange-700'"
                    >
                      <UIcon name="i-lucide-info" class="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span class="text-xs leading-relaxed">{{ cancellationInfo.text }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-700">
                      <UIcon name="i-lucide-credit-card" class="w-4 h-4 flex-shrink-0" />
                      <span>Оплата онлайн</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Правая часть: фото номера -->
              <div v-if="offerPrimaryImage" class="flex-shrink-0">
                <div class="relative w-32 h-32">
                  <img
                    :src="offerPrimaryImage"
                    :alt="offer?.roomTypeName"
                    class="w-full h-full object-cover rounded-lg"
                  >
                  <span v-if="offerImages.length > 1" class="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {{ offerImages.length }} фото
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Информация о госте -->
        <div class="bg-white rounded-2xl p-4">
          <h2 class="font-semibold mb-1">Гость</h2>
          <p class="text-sm text-gray-600 mb-4">Взрослый, старше 18 лет</p>
          <div class="grid grid-cols-2 gap-4">
            <div :data-booking-field="validationShown && fieldErrors.guestLastName ? 'error' : undefined">
              <label class="text-sm font-medium text-gray-700 mb-1 block">Фамилия <span class="text-red-500">*</span></label>
              <UInput
                v-model="form.guestLastName"
                placeholder="Иванов"
                :ui="{ error: validationShown && fieldErrors.guestLastName ? 'border-red-500 focus:ring-red-500' : undefined }"
              />
              <p v-if="validationShown && fieldErrors.guestLastName" class="mt-1 text-sm text-red-600">
                {{ fieldErrors.guestLastName }}
              </p>
            </div>
            <div :data-booking-field="validationShown && fieldErrors.guestFirstName ? 'error' : undefined">
              <label class="text-sm font-medium text-gray-700 mb-1 block">Имя <span class="text-red-500">*</span></label>
              <UInput
                v-model="form.guestFirstName"
                placeholder="Иван"
                :ui="{ error: validationShown && fieldErrors.guestFirstName ? 'border-red-500 focus:ring-red-500' : undefined }"
              />
              <p v-if="validationShown && fieldErrors.guestFirstName" class="mt-1 text-sm text-red-600">
                {{ fieldErrors.guestFirstName }}
              </p>
            </div>
          </div>
          <UButton class="mt-4" variant="outline" color="primary">
            Выбрать
          </UButton>
        </div>

        <!-- Информация о покупателе -->
        <div class="bg-white rounded-2xl p-4">
          <h2 class="font-semibold mb-1">Покупатель</h2>
          <p class="text-sm text-gray-600 mb-4">
            Отправим подтверждение брони, свяжемся в случае проблем
          </p>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div :data-booking-field="validationShown && fieldErrors.payerLastName ? 'error' : undefined">
              <label class="text-sm font-medium text-gray-700 mb-1 block">Фамилия <span class="text-red-500">*</span></label>
              <UInput
                v-model="form.payerLastName"
                placeholder="Иванов"
                :ui="{ error: validationShown && fieldErrors.payerLastName ? 'border-red-500 focus:ring-red-500' : undefined }"
              />
              <p v-if="validationShown && fieldErrors.payerLastName" class="mt-1 text-sm text-red-600">
                {{ fieldErrors.payerLastName }}
              </p>
            </div>
            <div :data-booking-field="validationShown && fieldErrors.payerFirstName ? 'error' : undefined">
              <label class="text-sm font-medium text-gray-700 mb-1 block">Имя <span class="text-red-500">*</span></label>
              <UInput
                v-model="form.payerFirstName"
                placeholder="Иван"
                :ui="{ error: validationShown && fieldErrors.payerFirstName ? 'border-red-500 focus:ring-red-500' : undefined }"
              />
              <p v-if="validationShown && fieldErrors.payerFirstName" class="mt-1 text-sm text-red-600">
                {{ fieldErrors.payerFirstName }}
              </p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div :data-booking-field="validationShown && fieldErrors.payerEmail ? 'error' : undefined">
              <label class="text-sm font-medium text-gray-700 mb-1 block">Электронная почта <span class="text-red-500">*</span></label>
              <UInput
                v-model="form.payerEmail"
                type="email"
                placeholder="user@example.com"
                :ui="{ error: validationShown && fieldErrors.payerEmail ? 'border-red-500 focus:ring-red-500' : undefined }"
              />
              <p v-if="validationShown && fieldErrors.payerEmail" class="mt-1 text-sm text-red-600">
                {{ fieldErrors.payerEmail }}
              </p>
            </div>
            <div :data-booking-field="validationShown && fieldErrors.payerPhone ? 'error' : undefined">
              <label class="text-sm font-medium text-gray-700 mb-1 block">Телефон <span class="text-red-500">*</span></label>
              <UInput
                v-model="form.payerPhone"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                :ui="{ error: validationShown && fieldErrors.payerPhone ? 'border-red-500 focus:ring-red-500' : undefined }"
              />
              <p v-if="validationShown && fieldErrors.payerPhone" class="mt-1 text-sm text-red-600">
                {{ fieldErrors.payerPhone }}
              </p>
            </div>
          </div>
          <UCheckbox v-model="form.shareWithHotel" label="Передать в отель для связи" />
        </div>

        <!-- Информация о заезде -->
        <div class="bg-white rounded-2xl p-4">
          <h2 class="font-semibold mb-4">Информация о заезде</h2>
          <div class="mb-4">
            <label class="text-sm font-medium text-gray-700 mb-1 block">Время заезда</label>
            <USelectMenu
              v-model="form.arrivalTime"
              :items="[
                { label: 'Неизвестно', value: 'Неизвестно' },
                { label: '14:00', value: '14:00' },
                { label: '15:00', value: '15:00' },
                { label: '16:00', value: '16:00' },
                { label: '17:00', value: '17:00' },
                { label: '18:00', value: '18:00' }
              ]"
              option-attribute="label"
              value-attribute="value"
            />
          </div>
          <p class="text-sm text-gray-600 mb-4">
            Ваш номер будет готов к 15:00
          </p>
          <div>
            <button
              class="flex items-center justify-between w-full text-sm font-medium text-gray-700"
              @click="specialRequestsExpanded = !specialRequestsExpanded"
            >
              <span>Особые пожелания</span>
              <UIcon
                :name="specialRequestsExpanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                class="w-4 h-4"
              />
            </button>
            <div v-if="specialRequestsExpanded" class="mt-4">
              <UTextarea
                v-model="form.specialRequests"
                placeholder="На языке страны отеля или английском"
                :rows="4"
                :maxlength="500"
              />
              <p class="text-xs text-gray-500 mt-2">
                Выполнение пожеланий не гарантируется и остаётся на усмотрение отеля
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Правая колонка -->
      <div class="flex flex-col gap-6">
        <!-- Вход в аккаунт -->
        <div v-if="!authStore.isAuthenticated" class="bg-white rounded-2xl p-4">
          <NuxtLink
            to="/login"
            class="flex items-center justify-between text-sm font-medium text-gray-700 hover:text-primary"
          >
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-user" class="w-4 h-4" />
              <span>Войдите в аккаунт</span>
            </div>
            <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
          </NuxtLink>
        </div>

        <!-- Способ оплаты -->
        <div class="bg-white rounded-2xl p-4">
          <h2 class="font-semibold mb-4">Способ оплаты</h2>
          <div class="grid grid-cols-2 gap-4">
            <button
              class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors"
              :class="paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-gray-200'"
              @click="paymentMethod = 'card'"
            >
              <UIcon name="i-lucide-credit-card" class="w-6 h-6" />
              <span class="text-sm font-medium">Банковская карта</span>
              <UIcon
                v-if="paymentMethod === 'card'"
                name="i-lucide-check"
                class="w-5 h-5 text-primary"
              />
            </button>
            <button
              class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors"
              :class="paymentMethod === 'sbp' ? 'border-primary bg-primary/5' : 'border-gray-200'"
              @click="paymentMethod = 'sbp'"
            >
              <UIcon name="i-lucide-smartphone" class="w-6 h-6" />
              <span class="text-sm font-medium">СБП</span>
              <UIcon
                v-if="paymentMethod === 'sbp'"
                name="i-lucide-check"
                class="w-5 h-5 text-primary"
              />
            </button>
          </div>
        </div>

        <!-- Промокод -->
        <div class="bg-white rounded-2xl p-4">
          <button
            class="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-4"
            @click="promoCodeExpanded = !promoCodeExpanded"
          >
            <span>Промокод, сертификат</span>
            <UIcon
              :name="promoCodeExpanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
              class="w-4 h-4"
            />
          </button>
          <div v-if="promoCodeExpanded" class="flex gap-2">
            <UInput v-model="promoCode" placeholder="Введите промокод" />
            <UButton color="primary">Применить</UButton>
          </div>
        </div>

        <!-- Итоговая сумма -->
        <div class="bg-white rounded-2xl p-4 sticky top-4">
          <div class="flex items-center justify-between mb-2">
            <div>
              <div class="text-2xl font-bold">
                {{ offer?.price?.total?.toLocaleString('ru-RU') || '0' }} ₽
              </div>
              <div class="text-sm text-gray-600">
                {{ guestsLabel }}, {{ nightsCount }} {{ nightsCount === 1 ? 'ночь' : nightsCount < 5 ? 'ночи' : 'ночей' }}
              </div>
            </div>
            <UIcon name="i-lucide-chevron-up" class="w-4 h-4 text-gray-400" />
          </div>
          <USeparator class="my-4" />
          <div class="flex justify-between text-sm mb-4">
            <span>Проживание</span>
            <span class="font-medium">{{ offer?.price?.total?.toLocaleString('ru-RU') || '0' }} ₽</span>
          </div>

          <!-- Чекбоксы согласия -->
          <div
            class="space-y-3 mb-4"
            :data-booking-field="validationShown && fieldErrors.consentPersonalData ? 'error' : undefined"
          >
            <UCheckbox v-model="consentPersonalData">
              <template #label>
                <span class="text-sm">
                  Даю согласие на обработку
                  <NuxtLink to="/oferta" class="text-primary hover:underline">персональных данных</NuxtLink>
                  <span class="text-red-500">*</span>
                </span>
              </template>
            </UCheckbox>
            <p v-if="validationShown && fieldErrors.consentPersonalData" class="text-sm text-red-600">
              {{ fieldErrors.consentPersonalData }}
            </p>
            <UCheckbox v-model="consentMarketing">
              <template #label>
                <span class="text-sm">
                  Даю согласие на получение информации об интересных местах, рекламы и выгодных предложений
                </span>
              </template>
            </UCheckbox>
          </div>

          <!-- Кнопка оплаты -->
          <UButton
            block
            size="lg"
            :loading="submitting"
            :disabled="Boolean(priceChangedModal || priceChangeInfo?.alternativeToken)"
            @click="submitBooking"
          >
            Оплатить
          </UButton>

          <p class="text-xs text-gray-500 text-center mt-4">
            Нажимая «Оплатить», вы соглашаетесь с
            <NuxtLink to="/oferta" class="text-primary hover:underline">публичной офертой</NuxtLink>
          </p>

          <div v-if="bookingError" class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {{ bookingError }}
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно: номера закончились, альтернативы нет -->
    <UModal v-model:open="noAvailabilityModal">
      <template #content>
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <UIcon name="i-lucide-info" class="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Нет доступных номеров</h3>
              <p class="text-sm text-gray-500">Условия изменились или выбранный вариант больше недоступен</p>
            </div>
          </div>
          <p class="text-sm text-gray-600 mb-6">
            {{ noAvailabilityMessage }}
          </p>
          <UButton
            block
            size="lg"
            @click="rejectAlternativeAndSearch"
          >
            <UIcon name="i-lucide-search" class="w-4 h-4 mr-2" />
            Вернуться к поиску
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Модальное окно: цена/доступность изменились — есть вариант в alternativeBooking -->
    <UModal v-model:open="priceChangedModal">
      <template #content>
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <UIcon name="i-lucide-alert-triangle" class="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Условия изменились</h3>
              <p class="text-sm text-gray-500">Цена или доступность номера изменились</p>
            </div>
          </div>

          <div v-if="priceChangeInfo" class="space-y-4">
            <!-- Информация об изменении цены/доступности -->
            <div class="bg-gray-50 rounded-xl p-4 space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Первоначальная цена:</span>
                <span class="font-medium line-through text-gray-400">
                  {{ formatPriceDisplay(priceChangeInfo.originalPrice, priceChangeInfo.currencyCode) }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Актуальная цена:</span>
                <span
                  v-if="priceChangeInfo.alternativePrice != null"
                  class="font-semibold text-lg"
                  :class="priceChangeInfo.priceDifference && priceChangeInfo.priceDifference > 0 ? 'text-red-600' : 'text-green-600'"
                >
                  {{ formatPriceDisplay(priceChangeInfo.alternativePrice, priceChangeInfo.currencyCode) }}
                </span>
                <span v-else class="text-gray-600 text-sm">при оформлении</span>
              </div>
              <div v-if="priceChangeInfo.priceDifference != null" class="flex justify-between items-center pt-2 border-t border-gray-200">
                <span class="text-gray-600">Разница:</span>
                <span class="font-medium" :class="priceChangeInfo.priceDifference > 0 ? 'text-red-600' : 'text-green-600'">
                  {{ priceChangeInfo.priceDifference > 0 ? '+' : '' }}{{ formatPriceDisplay(priceChangeInfo.priceDifference, priceChangeInfo.currencyCode) }}
                </span>
              </div>
            </div>

            <!-- Предупреждения от API -->
            <div v-if="priceChangeInfo.warnings?.length" class="bg-yellow-50 rounded-xl p-4">
              <div class="flex items-start gap-2">
                <UIcon name="i-lucide-info" class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div class="text-sm text-yellow-800">
                  <p v-for="(warning, idx) in priceChangeInfo.warnings" :key="idx">
                    {{ warning.message }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Описание ситуации -->
            <p class="text-sm text-gray-600">
              Между моментом поиска и оформлением бронирования условия изменились. 
              Вы можете продолжить бронирование по новой цене или выполнить повторный поиск.
            </p>
          </div>

          <!-- Кнопки действий -->
          <div class="flex flex-col sm:flex-row gap-3 mt-6">
            <UButton
              block
              variant="outline"
              color="neutral"
              size="lg"
              @click="rejectAlternativeAndSearch"
            >
              <UIcon name="i-lucide-search" class="w-4 h-4 mr-2" />
              Повторить поиск
            </UButton>
            <UButton
              block
              size="lg"
              :loading="submitting"
              @click="acceptAlternativeBooking"
            >
              <UIcon name="i-lucide-check" class="w-4 h-4 mr-2" />
              Принять новые условия
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
