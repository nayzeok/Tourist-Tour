<script setup lang="ts">
const popular = ref([
  {
    name: 'Москва',
    image: '/images/popular/moscow.jpg',
  },
  {
    name: 'Санкт-Петербург',
    image: '/images/popular/peterburg.jpg',
  },
  {
    name: 'Пхукет, Тайланд',
    image: '/images/popular/phuket.jpg',
  },
  {
    name: 'Нячанг, Вьетнам',
    image: '/images/popular/nichang.jpg',
  },
  {
    name: 'Дубай, ОАЭ',
    image: '/images/popular/dubai.jpg',
  },
  {
    name: 'Анталия, Турция',
    image: '/images/popular/antaliya.jpg',
  },
])
</script>

<template>
  <div class="bg-white py-10 px-4 rounded-2xl lg:rounded-none">
    <div class="flex flex-col gap-6 lg:gap-10 container">
      <div class="text-2xl lg:text-3xl font-semibold text-center">
        Популярные направления
      </div>
  
      <div class="grid lg:grid-cols-3 gap-4 ">
        <div v-for="item in popular" :key="item.name" class="bg-[#F1F3F6] rounded-2xl p-3 flex flex-col gap-3">
          <div class="w-full h-40 relative rounded-xl overflow-hidden">
            <NuxtImg :alt="item.name" :src="item.image" />
          </div>

          <div class="flex justify-between flex-col gap-2">
            <div class="font-semibold text-lg">
              {{ item.name }}
            </div>

            <NuxtLink class="text-[#1DA857] text-xs" to="/">
              Посмотреть цены
            </NuxtLink>
          </div>
        </div>
      </div>
  
      <div class="flex justify-center">
        <UButton
          to="/avia"
          :ui="{
            base: 'px-10 py-4 rounded-xl font-semibold'
          }"
        >
          Найти авиабилеты
        </UButton>
      </div>

      <div
        class="bg-[#F1F3F6] gap-4 rounded-xl flex flex-col lg:flex-row justify-between items-stretch overflow-hidden"
      >
        <div
          class="flex-1 lg:px-12 pt-20 lg:pt-12 px-4 pb-4 lg:pb-8 flex flex-col justify-between gap-8 lg:gap-8"
        >
          <div class="text-base lg:text-2xl font-semibold relative">
            <span>          
              Забронируйте для поездки отель, апартаменты, гостиницу или хостел
            </span>

            <div
              class="absolute text-white -top-12 lg:-top-4 font-semibold -right-0 lg:-right-12 rotate-10 bg-gradient-to-r from-[#FB51CE] to-[#FB2461] text-[10px] lg:text-sm px-4 py-2 rounded-2xl"
            >
              Доступно в РФ
            </div>
          </div>

          <div class="mt-auto">
            <UButton
              to="/"
              :ui="{
                base: 'py-3 px-4 lg:px-10 lg:py-4 rounded-xl font-semibold',
              }"
            >
              Перейти к отелям!
            </UButton>
          </div>
        </div>

        <div class="relative w-full lg:w-1/2 h-60 lg:h-auto">
          <NuxtImg src="/images/exterior.png" />
        </div>
      </div>
    </div>
  </div>
</template>