<script setup lang="ts">
const COOKIE_KEY = 'cookie_consent'

const visible = ref(false)

onMounted(() => {
  if (!localStorage.getItem(COOKIE_KEY)) {
    visible.value = true
  }
})

function accept() {
  localStorage.setItem(COOKIE_KEY, 'accepted')
  visible.value = false
}

function decline() {
  localStorage.setItem(COOKIE_KEY, 'declined')
  visible.value = false
}
</script>

<template>
  <Transition name="banner">
    <div
      v-if="visible"
      class="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
    >
      <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div class="flex-1 text-sm text-gray-600 leading-relaxed">
          Мы используем cookie-файлы для улучшения работы сайта. Продолжая пользоваться сайтом, вы соглашаетесь с
          <NuxtLink to="/cookies" class="text-primary hover:underline font-medium">политикой использования cookie</NuxtLink>.
        </div>
        <div class="flex gap-2 shrink-0">
          <button
            class="px-5 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition"
            @click="accept"
          >
            Принять
          </button>
          <button
            class="px-5 py-2 border border-gray-200 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
            @click="decline"
          >
            Отклонить
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.banner-enter-active,
.banner-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.banner-enter-from,
.banner-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
