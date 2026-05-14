<script setup lang="ts">
const visible = ref(true)

onMounted(() => {
  setTimeout(() => {
    visible.value = false
  }, 1700)
})
</script>

<template>
  <Transition name="preloader">
    <div
      v-if="visible"
      class="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center gap-5"
    >
      <Icon name="c:logo-footer" size="80" />

      <div class="flex gap-1.5">
        <span class="w-2 h-2 rounded-full bg-primary dot" style="animation-delay: 0s" />
        <span class="w-2 h-2 rounded-full bg-primary dot" style="animation-delay: 0.2s" />
        <span class="w-2 h-2 rounded-full bg-primary dot" style="animation-delay: 0.4s" />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.preloader-leave-active {
  transition: opacity 0.4s ease;
}
.preloader-leave-to {
  opacity: 0;
}

.dot {
  animation: bounce 0.8s ease-in-out infinite;
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}
</style>
