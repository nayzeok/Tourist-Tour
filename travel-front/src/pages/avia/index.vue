<script setup lang="ts">
definePageMeta({
  layout: 'default',
})
</script>

<template>
  <div class="">
    <section class="py-4 container flex flex-col gap-4 lg:gap-10 lg:py-20">
      <div class="flex justify-between gap-4 lg:gap-10 flex-col lg:flex-row">
        <div class="flex flex-col overflow-hidden items-center h-78 flex-1 gap-6 lg:gap-2 px-4 relative isolate plane-image bg-white rounded-2xl py-6">
          <div class="font-semibold text-xl text-center max-w-75">
            Найдём билеты <br> по выгодной цене
          </div>

          <div class="z-10 text-center max-w-75 text-xs lg:text-center">
            Выбирайте прямые рейсы или составляйте сложные маршруты
          </div>

          <NuxtLink class="bg-[#F4F5F6] rounded-xl z-10 mt-auto py-2 px-8 text-xs font-bold flex-center h-10 lg:h-14 text-black hover:bg-primary hover:text-white transition" to="/avia">
            Найти авиабилеты
          </NuxtLink>

          <div class="absolute bottom-0 left-0 ticket-image" />
        </div>

        <div class="flex flex-col overflow-hidden items-center h-78 flex-1 gap-6 lg:gap-2 px-4 relative isolate hotel-image bg-white rounded-2xl py-6">
          <div class="font-semibold text-xl text-center max-w-75">
            Выгодное бронирование <br> отелей
          </div>

          <div class="z-10 text-center max-w-75 text-xs lg:text-center">
            Отель, гостиница, апартаменты или хостел - забронируйте в 1 клик
          </div>

          <NuxtLink class="bg-[#F4F5F6] rounded-xl z-10 mt-auto px-4 lg:py-2 lg:px-8 text-xs font-bold flex-center h-10 lg:h-14 text-black hover:bg-primary hover:text-white transition" to="/hotels">
            Забронировать проживание
          </NuxtLink>

          <div class="absolute bottom-0 left-0 bag-image" />
        </div>
      </div>

      <div class="flex justify-between items-stretch gap-4 lg:gap-10 lg:flex-row flex-col">
        <NuxtLink to="/acc" class="p-5 w-full bg-white rounded-2xl flex-1 flex flex-col justify-between gap-4 hover:shadow-md transition">
          <div class="flex gap-4 justify-between items-center">
            <div class="text-xl font-semibold">
              Личный кабинет
            </div>

            <div class="w-12 h-12 rounded-xl bg-primary flex-center">
              <Icon class="w-5 h-5" name="c:acc" />
            </div>
          </div>

          <div class="text-xs">
            Билеты и брони всегда под рукой
          </div>
        </NuxtLink>

        <div class="p-5  w-full bg-white rounded-2xl flex-1 flex flex-col justify-between gap-4">
          <div class="flex gap-4 justify-between items-center">
            <div class="text-xl font-semibold">
              Акции и скидки
            </div>

            <div class="w-12 h-12 rounded-xl bg-primary flex-center">
              <Icon class="w-5 h-5" name="c:acc" />
            </div>
          </div>

          <div class="text-xs">
            Всегда - на бронирование билетов и отелей
          </div>
        </div>

        <div class="p-5  w-full bg-white rounded-2xl flex-1 flex flex-col justify-between gap-4">
          <div class="flex gap-4 justify-between items-center">
            <div class="text-xl font-semibold">
              Выгодные цены
            </div>

            <div class="w-12 h-12 rounded-xl bg-primary flex-center">
              <Icon class="w-5 h-5" name="c:acc" />
            </div>
          </div>

          <div class="text-xs">
            Сравниваем предложения от авиакомпаний
          </div>
        </div>
      </div>
    </section>
<!--    <ClientOnly>
      <AviaWidget />
    </ClientOnly>-->
  </div>
</template>

<style scoped>
.plane-image {
  background-image: url('/images/plane.png');
  background-position: right bottom;
  background-repeat: no-repeat;
  background-size: 55%;
}

.ticket-image {
  background-image: url('/images/tickets.png');
  background-size: contain;
  background-position: left bottom;
  background-repeat: no-repeat;
  width: 210px;
  height: 210px;
  z-index: 0;
}

.hotel-image {
  background-image: url('/images/hotel.png');
  background-position: right bottom;
  background-repeat: no-repeat;
  background-size: 55%;
}

.bag-image {
  background-image: url('/images/bag.png');
  background-size: contain;
  background-position: left bottom;
  background-repeat: no-repeat;
  width: 180px;
  height: 180px;
  z-index: 0;
}

@media screen and (max-width: 768px) {
  .plane-image {
    background-image: url('/images/plane.png');
    background-position: right bottom;
    background-repeat: no-repeat;
    background-size: 35%;
  }

  .ticket-image {
    background-image: url('/images/tickets.png');
    background-size: contain;
    background-position: left bottom;
    background-repeat: no-repeat;
    width: 110px;
    height: 110px;
    z-index: 0;
  }

  .hotel-image {
    background-image: url('/images/hotel.png');
    background-position: right bottom;
    background-repeat: no-repeat;
    background-size: 35%;
  }

  .bag-image {
    background-image: url('/images/bag.png');
    background-size: contain;
    background-position: left bottom;
    background-repeat: no-repeat;
    width: 90px;
    height: 90px;
    z-index: 0;
  }
}
</style>