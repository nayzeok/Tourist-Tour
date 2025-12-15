<script setup lang="ts">
const viewport = useViewport()

const iconSize = computed(() => {
  return !viewport.isLessThan('lg') ? 70 : '35'
})
</script>

<template>
  <section class="py-20 flex flex-col gap-10">
    <div
      class="text-2xl lg:text-3xl container font-semibold text-center max-w-4xl mx-auto"
    >
      Самые дешевые билеты от 2500+ авиакомпаний
    </div>

    <UCarousel
      v-slot="{ index }"
      auto-scroll
      :items="Array.from(Array(41))"
      loop
      :ui="{ item: viewport.isLessThan('lg') ? 'basis-1/2' : 'basis-1/8' }"
    >
      <div class="px-4 py-6 flex-1 bg-white rounded-xl">
        <div class="h-10 w-full flex-center relative">
          <img
            class="!object-contain"
            :src="`/logos/Logo-${index+1}.png`"
          >
        </div>
      </div>
    </UCarousel>
  </section>

  <div class="bg-white lg:py-10 rounded-2xl lg:rounded-none px-4 lg:px-0 py-4">
    <div class="container">
      <div
        class="bg-[#F1F3F6] gap-4 rounded-xl flex flex-col lg:flex-row justify-between items-stretch overflow-hidden"
      >
        <div
          class="flex-1 lg:px-12 pt-20 lg:pt-12 px-4 pb-4 lg:pb-8 flex flex-col justify-between gap-8 lg:gap-8"
        >
          <div class="text-base lg:text-2xl font-semibold relative">
            <span>
              Забронируйте автомобиль для <br>
              вашего путешествия
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
              Перейти к автопрокату!
            </UButton>
          </div>
        </div>

        <div class="relative w-full lg:w-1/2 h-60 lg:h-auto">
          <NuxtImg src="/images/tourist.png" />
        </div>
      </div>
    </div>
  </div>

  <div class="container py-10 flex flex-col gap-4 items-center">
    <div class="text-2xl lg:text-3xl font-semibold">
      Любые изменения - в 1 клик
    </div>

    <div class="text-center text-[#4A5663] mb-8 lg:mb-20">
      Уведомления о лучших ценах, данные пассажиров и информация по заказам у
      вас под рукой
    </div>

    <div class="grid w-full lg:grid-cols-[300px_1fr_300px] gap-4 lg:gap-10">
      <div class="flex flex-col gap-8 lg:gap-12 justify-center">
        <div class="flex flex-col gap-2 items-center">
          <div class="mb-2">
            <Icon name="c:pass" :size="iconSize" />
          </div>

          <div class="font-semibold">
            Пассажиры
          </div>

          <div class="text-[#4A5663] text-center text-sm">
            Сохраняйте информацию о себе и близких, чтобы оформлять поездки
            быстрее и без лишних ошибок
          </div>
        </div>

        <div class="flex flex-col gap-2 items-center">
          <div class="mb-2">
            <Icon name="c:route" :size="iconSize" />
          </div>

          <div class="font-semibold">
            Сложные маршруты
          </div>

          <div class="text-[#4A5663] text-center text-sm">
            Составляйте сложные маршруты с билетами от разных компаний, выбирая
            наиболее выгодные варианты
          </div>
        </div>
      </div>

      <div class="h-100 relative">
        <NuxtImg class="!object-contain" src="/images/click.png" />
      </div>

      <div class="flex flex-col gap-8 lg:gap-12 justify-center">
        <div class="flex flex-col gap-2 items-center">
          <div class="mb-2">
            <Icon name="c:tick" :size="iconSize" />
          </div>

          <div class="font-semibold">
            Подписка на цены
          </div>

          <div class="text-[#4A5663] text-center text-sm">
            Следите за изменением цен на любимые направления и получайте
            уведомления, чтобы путешествовать по сниженной стоимости
          </div>
        </div>

        <div class="flex flex-col gap-2 items-center">
          <div class="mb-2">
            <Icon name="c:ticket" :size="iconSize" />
          </div>

          <div class="font-semibold">
            Личный кабинет
          </div>

          <div class="text-[#4A5663] text-center text-sm">
            Храните все свои бронирования в одном месте и получайте помощь в
            решении любых вопросов
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="bg-white lg:py-10 rounded-2xl lg:rounded-none px-4 lg:px-0 py-4">
    <div class="container">
      <div
        class="bg-[#F1F3F6] gap-4 rounded-xl flex flex-col lg:flex-row justify-between items-stretch overflow-hidden"
      >
        <div
          class="flex-1 lg:px-12 pt-20 lg:pt-12 px-4 pb-4 lg:pb-8 flex flex-col justify-between gap-8 lg:gap-8"
        >
          <div class="text-base lg:text-2xl font-semibold relative">
            <span>
              Самые дешевые билеты <br>
              напрямую от авиакомпаний
            </span>

            <div
              class="absolute text-white -top-12 lg:-top-4 font-semibold -right-0 lg:-right-12 rotate-10 bg-gradient-to-r from-[#FB51CE] to-[#FB2461] text-[10px] lg:text-sm px-4 py-2 rounded-2xl"
            >
              Свыше 2500 авиакомпаний
            </div>
          </div>

          <div class="mt-auto">
            <UButton
              to="/"
              :ui="{
                base: 'py-3 px-4 lg:px-10 lg:py-4 rounded-xl font-semibold',
              }"
            >
              Перейти к авиабилетам
            </UButton>
          </div>
        </div>

        <div class="relative w-full lg:w-1/2 h-60 lg:h-auto">
          <NuxtImg src="/images/domodedovo.png" />
        </div>
      </div>
    </div>
  </div>
</template>