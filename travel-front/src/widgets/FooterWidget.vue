<script setup lang="ts">
const isOfertaOpen = ref(false)

const openOferta = () => {
  isOfertaOpen.value = true
}
</script>

<template>
  <div class="bg-white py-10">
    <div class="container px-4 lg:px-0">
      <div class="flex justify-between flex-col gap-8 lg:flex-row ">
        <div class="flex flex-col gap-2">
          <NuxtLink class="flex items-center gap-2" to="/">
            <Icon name="c:logo-footer" size="70" />

            <div class="flex flex-col gap-1">
              <div class="text-sm">
                Турист-тур
              </div>

              <div class="text-sm">
                © 2019–2025
              </div>
            </div>
          </NuxtLink>

          <div class="text-sm">
            Юридические документы
          </div>

          <button
            class="text-sm text-left cursor-pointer hover:opacity-70 transition-opacity"
            @click="openOferta"
          >
            Публичная оферта
          </button>
        </div>

        <div class="flex flex-col gap-2 lg:gap-4 text-sm">
          <NuxtLink to="/about">
            О компании
          </NuxtLink>
          
          <NuxtLink to="/faq">
            Вопрос-ответ
          </NuxtLink>
          
          <NuxtLink to="/support">
            Поддержка
          </NuxtLink>
          
          <NuxtLink to="/contact">
            Контакты
          </NuxtLink>
          
          <NuxtLink to="/acc">
            Личный кабинет
          </NuxtLink>
        </div>

        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <NuxtLink class="cursor-pointer text-sm" to="/avia">
              Авиабилеты
            </NuxtLink>

            <div class="text-gray-500 text-xs cursor-pointer" to="/avia">
              Самые дешевые - проверно
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <NuxtLink class="cursor-pointer text-sm" to="/">
              Отели
            </NuxtLink>

            <div class="text-gray-500 text-xs">
              Более 500 тысяч вариантов
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <div class="text-sm">
              Прокат автомобилей
            </div>

            <div class="text-gray-500 text-xs">
              Доступно в РФ
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <div class="text-sm">
            Откройте на мобильном
          </div>

          <div class="text-gray-500 text-xs">
            Это удобнее
          </div>
        </div>
        
        <div class="w-24 h-24 relative shrink-0">
          <img alt="qr" src="/qr.png.webp">
        </div>
      </div>
    </div>

    <!-- Модальное окно с офертой -->
    <OfertaModal :open="isOfertaOpen" @update:open="isOfertaOpen = $event" />
  </div>
</template>

<style scoped></style>