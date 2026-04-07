<script setup lang="ts">
import { useAuthStore } from '~/src/shared/store'
import { useScrollLock } from '@vueuse/core'

const viewport = useViewport()
const auth = useAuthStore()
const isOpenMenu = ref(false)

const route = useRoute()

const isLocked = import.meta.client
  ? useScrollLock(document.querySelector('body'))
  : ref(false)

watch(isOpenMenu, (value) => {
  if (import.meta.client) {
    //@ts-ignore
    isLocked.value = value
  }
})

function openMenu() {
  isOpenMenu.value = !isOpenMenu.value
}

function closeMenu() {
  isOpenMenu.value = false
  console.log(123)
}
</script>

<template>
  <div class="lg:pt-5 bg-primary lg:px-5 flex items-center justify-between relative min-h-[65px] border-b lg:pb-5 border-white/20">
    <template v-if="!viewport.isLessThan('lg')">
      <!-- Левая часть: лого + ссылки -->
      <div class="flex items-center gap-8 text-xs">
        <NuxtLink to="/">
          <Icon class="w-30 h-10" filled name="c:logo" />
        </NuxtLink>
        <div class="flex gap-8 items-center text-white font-semibold">
          <NuxtLink to="/faq">
            Вопрос-ответ
          </NuxtLink>
          <NuxtLink to="/support">
            Поддержка
          </NuxtLink>
        </div>
      </div>

      <!-- Центр: табы (абсолютно по центру) -->
      <div class="absolute left-1/2 -translate-x-1/2 flex items-center overflow-hidden rounded-xl">
        <NuxtLink class="flex gap-2 px-6 py-3 bg-[#4E97FF] items-center hover:bg-[#4E97FF]/80 transition-colors duration-300" to="/avia">
          <span class="flex-center">
            <Icon class="w-4 h-4 text-white" name="c:plane" />
          </span>
          <span class="text-white font-semibold text-xs">
            Авиабилеты
          </span>
        </NuxtLink>

        <NuxtLink class="flex gap-2 px-6 py-3 bg-[#4E97FF] items-center hover:bg-[#4E97FF]/80" to="/hotels">
          <span class="flex-center">
            <Icon class="w-4 h-4 text-white" name="c:hotel" />
          </span>
          <span class="text-white font-semibold text-xs">
            Отели
          </span>
        </NuxtLink>

        <NuxtLink class="flex gap-2 px-6 py-3 bg-[#4E97FF] items-center hover:bg-[#4E97FF]/80" to="/rent">
          <span class="flex-center">
            <Icon class="w-4 h-4 text-white" name="c:car" />
          </span>
          <span class="text-white font-semibold text-xs">
            Аренда автомобилей
          </span>
        </NuxtLink>
      </div>

      <!-- Правая часть: телефон + войти -->
      <div class="flex gap-8 items-center">
        <NuxtLink class="text-white font-semibold text-xs" to="tel:88007003333">
          8 800 700 33 33
        </NuxtLink>

        <NuxtLink v-if="auth.isAuthenticated" class="flex gap-4 text-xs items-center bg-[#4E97FF] px-6 py-3 rounded-xl hover:bg-[#4E97FF]/80 " to="/acc">
          <div class="flex-center">
            <Icon class="w-4 h-4" filled name="c:acc" />
          </div>

          <div class="text-white font-semibold">
            Личный кабинет
          </div>
        </NuxtLink>

        <NuxtLink v-else class="flex gap-4 items-center bg-[#4E97FF] text-xs px-6 py-3 rounded-xl hover:bg-[#4E97FF]/80 " to="/login">
          <div class="flex-center">
            <Icon class="w-4 h-4" filled name="c:acc" />
          </div>

          <div class="text-white font-semibold">
            Войти
          </div>
        </NuxtLink>
      </div>
    </template>

    <template v-else>
      <NuxtLink to="/">
        <Icon class="w-24 h-8" filled name="c:logo" />
      </NuxtLink>
      <div v-if="!isOpenMenu" class="ml-auto text-white flex items-center" @click="openMenu">
        <UIcon name="pajamas:hamburger" size="32" />
      </div>

      <div v-else class="ml-auto text-white flex items-center" @click="openMenu">
        <UIcon name="pajamas:close" size="32" />
      </div>
    </template>

    <Teleport to="body">
      <div v-if="isOpenMenu" class="left-0 z-100 top-[65px] w-full h-[calc(100%-65px)] fixed bg-white">
        <div class="flex flex-col p-8 relative h-full gap-4 text-2xl">
          <NuxtLink to="/" @click="closeMenu">
            На главную
          </NuxtLink>

          <NuxtLink to="/avia" @click="closeMenu">
            Авиабилеты
          </NuxtLink>

          <NuxtLink to="/hotels" @click="closeMenu">
            Проживание
          </NuxtLink>

          <NuxtLink to="/rent" @click="closeMenu">
            Прокат автомобилей
          </NuxtLink>

          <NuxtLink to="/about" @click="closeMenu">
            О компании
          </NuxtLink>

          <NuxtLink to="/faq" @click="closeMenu">
            Вопрос-ответ
          </NuxtLink>

          <NuxtLink to="/support" @click="closeMenu">
            Поддержка
          </NuxtLink>

          <NuxtLink to="/contact" @click="closeMenu">
            Контакты
          </NuxtLink>

          <div class="sticky bottom-0 mt-auto w-full">
            <UButton block to="/acc" @click="closeMenu">
              Личный кабинет
            </UButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>