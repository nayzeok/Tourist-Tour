<script setup lang="ts">
const isOfertaOpen = ref(false)

const openOferta = () => {
  isOfertaOpen.value = true
}
</script>

<template>
  <div class="bg-white py-10">
    <div class="container px-4 lg:px-0">
      <div class="flex justify-between flex-col gap-8 lg:flex-row lg:items-start">
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
            <NuxtLink class="cursor-pointer text-sm" to="/rent">
              Прокат автомобилей
            </NuxtLink>

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

        <div class="flex flex-col gap-2 text-sm min-w-[200px] lg:min-w-[240px]">
          <div class="text-sm mb-1">
            Юридическая информация
          </div>
          <div class="text-gray-600 text-xs">
            Партнер: Компания "Турист-Тур"
          </div>
          <div class="text-gray-600 text-xs">
            ООО "АТМ-ГРУПП"
          </div>
          <div class="text-gray-600 text-xs">
            ИНН: 5405059146
          </div>
          <div class="text-gray-600 text-xs">
            КПП: 540501001
          </div>
          <div class="text-gray-600 text-xs">
            ОГРН: 1205400052912
          </div>
          <div class="text-gray-600 text-xs leading-relaxed">
            630008, Новосибирская область,<br>
            г. о. город Новосибирск,<br>
            г. Новосибирск, ул. Кирова, д. 11, кв. 50
          </div>
        </div>
        
        <div class="flex flex-col items-start gap-3 shrink-0">
          <div class="w-24 h-24 relative">
            <img alt="qr" class="footer-qr" src="/qr.png.webp">
          </div>

          <div class="w-24">
            <img
              alt="Эквайринг"
              class="acquiring-logo"
              src="/logos/VerticalLogos.png"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно с офертой -->
    <OfertaModal :open="isOfertaOpen" @update:open="isOfertaOpen = $event" />
  </div>
</template>

<style scoped>
.footer-qr {
  position: static !important;
  top: auto !important;
  left: auto !important;
  width: 100% !important;
  height: 100% !important;
  object-fit: contain;
}

.acquiring-logo {
  position: static !important;
  top: auto !important;
  left: auto !important;
  display: block;
  width: 100% !important;
  max-width: 100% !important;
  height: auto !important;
  object-fit: contain;
}
</style>