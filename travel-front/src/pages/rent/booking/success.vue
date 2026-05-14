<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()

const bookingNumber = computed(() => route.query.number as string | undefined)
</script>

<template>
  <div class="container py-16 lg:py-24 flex justify-center">
    <div class="max-w-md w-full text-center">
      <div class="text-7xl mb-6">✅</div>

      <h1 class="text-2xl lg:text-3xl font-bold mb-3">Бронирование оформлено!</h1>

      <p v-if="bookingNumber" class="text-gray-500 mb-2 text-sm">
        Номер бронирования: <span class="font-semibold text-gray-700">{{ bookingNumber }}</span>
      </p>

      <p class="text-gray-600 mb-8">
        Чтобы ускорить обработку бронирования, заполните данные о себе в личном кабинете:
        паспорт, водительское удостоверение и прописку.
      </p>

      <div class="bg-blue-50 rounded-2xl p-5 mb-8 text-left space-y-2">
        <p class="font-semibold text-sm text-gray-700 mb-2">Что дальше?</p>
        <div v-for="(step, i) in [
          'Менеджер свяжется с вами для подтверждения',
          'Заполните данные в личном кабинете — это ускорит обработку',
          'Статус бронирования обновится в кабинете',
        ]" :key="i" class="flex items-start gap-2 text-sm text-gray-600">
          <span class="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
            {{ i + 1 }}
          </span>
          <span>{{ step }}</span>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <NuxtLink
          to="/acc/rent"
          class="w-full h-12 flex items-center justify-center bg-primary text-white font-bold rounded-xl hover:opacity-90 transition"
        >
          Перейти в кабинет
        </NuxtLink>
        <NuxtLink
          to="/rent"
          class="w-full h-12 flex items-center justify-center border border-gray-200 text-gray-700 font-medium rounded-xl hover:border-gray-300 transition text-sm"
        >
          Вернуться к аренде авто
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
