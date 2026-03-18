<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const route = useRoute()
const runtimeConfig = useRuntimeConfig()

const bookingNumber = ref<string | null>(null)
const loading = ref(true)
const notFound = ref(false)

onMounted(async () => {
  // 1. Прямой номер брони (quick-book без эквайринга)
  const directNumber = route.query.bookingNumber as string | undefined
  if (directNumber) {
    bookingNumber.value = directNumber
    loading.value = false
    return
  }

  // 2. Через paymentId (после эквайринга / PayKeeper webhook)
  const id =
    (route.query.paymentId as string) ||
    (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('lastBookingPaymentId') : null)

  if (!id) {
    loading.value = false
    notFound.value = true
    return
  }

  try {
    const res = await $fetch<{ bookingNumber: string | null }>(
      `${runtimeConfig.public.apiUrl}/reservation/payment-success`,
      { params: { paymentId: id } }
    )
    bookingNumber.value = res?.bookingNumber ?? null
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('lastBookingPaymentId')
    }
  } catch {
    bookingNumber.value = null
  } finally {
    loading.value = false
    notFound.value = !bookingNumber.value
  }
})
</script>

<template>
  <div class="container py-12">
    <div class="mx-auto max-w-lg rounded-2xl bg-white p-8 shadow-lg">
      <div v-if="loading" class="flex flex-col items-center gap-4 py-8">
        <UIcon name="i-lucide-loader-2" class="h-10 w-10 animate-spin text-primary" />
        <p class="text-gray-600">Проверка бронирования...</p>
      </div>

      <template v-else>
        <div v-if="bookingNumber" class="flex flex-col items-center gap-4 text-center">
          <div class="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <UIcon name="i-lucide-check" class="h-8 w-8 text-green-600" />
          </div>
          <h1 class="text-xl font-semibold text-gray-900">
            Бронирование подтверждено
          </h1>
          <p class="text-gray-600">
            Номер брони:
          </p>
          <p class="text-2xl font-bold text-primary">
            {{ bookingNumber }}
          </p>
          <p class="text-sm text-gray-500">
            Подтверждение отправлено на вашу почту. Данные также доступны в личном кабинете.
          </p>
          <NuxtLink
            to="/acc"
            class="mt-4 rounded-xl bg-primary px-6 py-3 font-medium text-white transition hover:opacity-90"
          >
            Перейти в личный кабинет
          </NuxtLink>
        </div>

        <div v-else-if="notFound" class="text-center">
          <div class="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 mx-auto">
            <UIcon name="i-lucide-clock" class="h-8 w-8 text-amber-600" />
          </div>
          <h1 class="mt-4 text-xl font-semibold text-gray-900">
            Обработка бронирования
          </h1>
          <p class="mt-2 text-gray-600">
            Если вы только что оформили бронь, она может создаваться в течение минуты.
            Проверьте почту или личный кабинет через некоторое время.
          </p>
          <NuxtLink
            to="/acc"
            class="mt-6 inline-block rounded-xl bg-primary px-6 py-3 font-medium text-white transition hover:opacity-90"
          >
            Личный кабинет
          </NuxtLink>
        </div>

        <div v-else class="text-center text-gray-600">
          <p>Не найдено данных о бронировании. Вернитесь к оформлению.</p>
          <NuxtLink to="/hotels" class="mt-4 inline-block text-primary hover:underline">
            К поиску отелей
          </NuxtLink>
        </div>
      </template>
    </div>
  </div>
</template>
