<script setup lang="ts">
import type { FetchError } from 'ofetch'
import type { RoomOffer } from './Offer.vue'

const props = defineProps<{
  open: boolean
  offer: RoomOffer | null
  propertyId: string
  stay: { arrival: string; departure: string } | null
  guestsCount: { adultCount: number; childAges?: number[] }
  hotelName?: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'success', payload: unknown): void
}>()

const runtimeConfig = useRuntimeConfig()
const toast = useToast()

const form = reactive({
  lastName: '',
  firstName: '',
  middleName: '',
  phone: '',
  email: '',
  citizenship: 'RUS',
  comment: '',
})

const bookingResult = ref<any | null>(null)
const bookingError = ref<string | null>(null)
const submitting = ref(false)

const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})

const requiredFieldsMissing = computed(() => {
  return (
    !form.lastName.trim() ||
    !form.firstName.trim() ||
    !form.phone.trim() ||
    !form.email.trim()
  )
})

const stayLabel = computed(() => {
  if (!props.stay) {
    return ''
  }

  return `${formatDisplayDate(props.stay.arrival)} — ${formatDisplayDate(props.stay.departure)}`
})

const nightsCount = computed(() => {
  if (!props.stay) {
    return null
  }

  const arrival = new Date(props.stay.arrival)
  const departure = new Date(props.stay.departure)
  const diff = Math.round(
    (departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24)
  )
  return diff > 0 ? diff : null
})

const guestsLabel = computed(() => {
  const adults = props.guestsCount.adultCount
  const children = props.guestsCount.childAges?.length ?? 0

  const adultLabel = adults === 1 ? '1 взрослый' : `${adults} взрослых`
  const childLabel = children
    ? `, ${children} ребёнк${children === 1 ? 'а' : 'ов'}`
    : ''

  return adultLabel + childLabel
})

function resetForm() {
  form.lastName = ''
  form.firstName = ''
  form.middleName = ''
  form.phone = ''
  form.email = ''
  form.citizenship = ''
  form.comment = ''
  bookingError.value = null
  bookingResult.value = null
}

watch(isOpen, (value) => {
  if (!value) {
    resetForm()
  }
})

watch(
  () => props.offer,
  () => {
    bookingError.value = null
    bookingResult.value = null
  }
)

function closeModal() {
  isOpen.value = false
}

function formatDisplayDate(date: string) {
  const [year, month, day] = date.split('-')
  if (!year || !month || !day) {
    return date
  }

  return `${day}.${month}.${year}`
}

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

async function submitBooking() {
  if (!props.offer || !props.propertyId || !props.stay) {
    bookingError.value =
      'Отсутствуют обязательные данные для бронирования. Обновите страницу и попробуйте снова.'
    return
  }

  if (requiredFieldsMissing.value) {
    bookingError.value = 'Заполните фамилию, имя, телефон и email.'
    return
  }

  submitting.value = true
  bookingError.value = null

  const payload = {
    propertyId: props.propertyId,
    roomStay: props.offer,
    arrival: props.stay.arrival,
    departure: props.stay.departure,
    guestsCount: {
      adultCount: props.guestsCount.adultCount,
      ...(props.guestsCount.childAges?.length
        ? { childAges: props.guestsCount.childAges }
        : {}),
    },
    customer: {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      ...(form.citizenship.trim()
        ? { citizenship: form.citizenship.trim() }
        : {}),
      ...(form.comment.trim() ? { comment: form.comment.trim() } : {}),
    },
    guests: [
      {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        ...(form.middleName.trim()
          ? { middleName: form.middleName.trim() }
          : {}),
        ...(form.citizenship.trim()
          ? { citizenship: form.citizenship.trim() }
          : {}),
      },
    ],
  }

  try {
    const result = await $fetch(
      `${runtimeConfig.public.apiUrl}/reservation/quick-book`,
      {
        method: 'POST',
        body: payload,
      }
    )

    bookingResult.value = result
    toast.add({
      id: 'booking-success',
      title: 'Бронирование создано',
      description: result?.created?.booking?.number
        ? `Номер брони ${result.created.booking.number}`
        : 'Запрос успешно отправлен в отель',
      color: 'success',
    })

    emit('success', result)
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
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :transition="false"
    :ui="{
      content: 'rounded-2xl'
    }"
  >
    <template #content>
      <div class="grid gap-0 overflow-y-auto">
        <header class="flex items-start justify-between gap-2 border-b border-gray-200 px-6 py-4">
          <div>
            <p class="text-xs font-medium uppercase text-gray-500">
              {{ hotelName || 'Бронирование' }}
            </p>
            <h2 class="text-lg font-semibold text-gray-900">
              {{ props.offer?.roomTypeName || 'Выберите предложение' }}
            </h2>
            
            <p v-if="stayLabel" class="text-sm text-gray-500">
              {{ stayLabel }}
              <span v-if="nightsCount" class="text-gray-400">
                • {{ nightsCount }} ноч{{ nightsCount === 1 ? 'ь' : nightsCount < 5 ? 'и' : 'ей' }}
              </span>
            </p>
          </div>

          <UButton
            icon="i-lucide-x"
            size="xs"
            variant="ghost"
            @click="closeModal"
          />
        </header>

        <section class="grid gap-6 px-6 py-4">
          <div class="grid gap-1 text-sm text-gray-600">
            <span class="font-medium text-gray-800">
              {{ guestsLabel }}
            </span>

            <USeparator class="my-2" />

            <span v-if="props.offer?.price?.total" class="font-semibold text-gray-800">
              К оплате: {{ props.offer.price.total.toLocaleString('ru-RU') }} ₽
            </span>
            
            <span v-else>
              К оплате: {{ '-'.toLocaleString('ru-RU') }} ₽ 
            </span>
          </div>

          <div v-if="bookingResult" class="grid gap-4 rounded-xl bg-green-50 p-4 text-sm text-green-800">
            <div class="text-base font-semibold">
              Бронирование подтверждено
            </div>
            
            <div class="grid gap-1">
              <span v-if="bookingResult?.created?.booking?.number" class="font-medium">
                Номер брони: {{ bookingResult.created.booking.number }}
              </span>

              <span>
                Мы отправили данные в отель. И продублировали номер брони вам на почту, а так же если вы не были ранее зарегистрированны выслали вам пароль от личного кабинета.
              </span>
            </div>

            <div class="flex gap-2">
              <UButton color="success" @click="closeModal">
                Закрыть
              </UButton>
            </div>
          </div>

          <template v-else>
            <div class="grid gap-3">
              <div class="grid gap-1">
                <label class="text-sm font-medium text-gray-700" for="booking-last-name">Фамилия *</label>
                <UInput id="booking-last-name" v-model="form.lastName" placeholder="Иванов" />
              </div>
              <div class="grid gap-1">
                <label class="text-sm font-medium text-gray-700" for="booking-first-name">Имя *</label>
                <UInput id="booking-first-name" v-model="form.firstName" placeholder="Иван" />
              </div>
              <div class="grid gap-1">
                <label class="text-sm font-medium text-gray-700" for="booking-middle-name">Отчество</label>
                <UInput id="booking-middle-name" v-model="form.middleName" placeholder="Петрович" />
              </div>
              <div class="grid gap-1">
                <label class="text-sm font-medium text-gray-700" for="booking-phone">Телефон *</label>
                <UInput
                  id="booking-phone"
                  v-model="form.phone"
                  inputmode="tel"
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
              <div class="grid gap-1">
                <label class="text-sm font-medium text-gray-700" for="booking-email">Email *</label>
                <UInput
                  id="booking-email"
                  v-model="form.email"
                  inputmode="email"
                  placeholder="user@example.com"
                />
              </div>

<!--              <div class="grid gap-1">-->
<!--                <label class="text-sm font-medium text-gray-700" for="booking-citizenship">Гражданство</label>-->
<!--                <UInput id="booking-citizenship" v-model="form.citizenship" placeholder="RUS" />-->
<!--              </div>-->

              <div class="grid gap-1">
                <label class="text-sm font-medium text-gray-700" for="booking-comment">Комментарий</label>
                <UTextarea
                  id="booking-comment"
                  v-model="form.comment"
                  placeholder="Пожелания по заселению..."
                  :rows="3"
                />
              </div>
            </div>

            <div v-if="bookingError" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {{ bookingError }}
            </div>

            <UButton
              block
              class="mt-2 disabled:!cursor-not-allowed"
              :disabled="requiredFieldsMissing"
              :loading="submitting"
              @click="submitBooking"
            >
              Подтвердить бронирование
            </UButton>
          </template>
        </section>
      </div>
    </template>
  </UModal>
</template>
