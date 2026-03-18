<script setup lang="ts">
definePageMeta({
  layout: 'default',
})
</script>

<template>
  <div>
    <section class="py-4 container flex flex-col gap-6 lg:gap-10 lg:py-12">
      <div class="flex flex-col gap-2">
        <h1 class="text-2xl lg:text-3xl font-bold">
          Аренда автомобилей
        </h1>
        <p class="text-gray-600 text-sm lg:text-base">
          Выберите даты, автомобиль и оформите заявку на аренду. Доступно по всей России.
        </p>
      </div>

      <ClientOnly>
        <RentProgWidget />
        <template #fallback>
          <div class="container py-10">
            <div class="bg-white rounded-2xl p-10 flex justify-center items-center min-h-[400px]">
              <span class="text-gray-500">Загрузка формы бронирования...</span>
            </div>
          </div>
        </template>
      </ClientOnly>
    </section>
  </div>
</template>
