<script setup lang="ts">
import type { ImageProps } from '.'
import { AspectRatio } from '~/src/shared/constants'

const {
  lazy = true,
  sizes = '(max-width: 640px) 400px, (max-width: 768px) 250px, 250px',
  modifiers = {},
  quality = 100,
  aspectRatio = AspectRatio.SQUARE,
  src,
  className,
  hAuto = false,
  objectFit = 'object-contain',
} = defineProps<ImageProps>()

const imageRef = ref<HTMLElement | null>(null)
const isInView = ref(false)
const isFullImageLoaded = ref(false)
const hasError = ref(false)

const fullImageParams = computed(() => ({
  ...modifiers,
  quality,
}))

function onFullImageLoad() {
  isFullImageLoaded.value = true
}

function onError() {
  hasError.value = true
}

watch(isInView, (visible) => {
  if (visible && src) {
    const img = new Image()
    img.src = src

    if (img.complete) {
      isFullImageLoaded.value = true
    } else {
      img.onload = () => {
        isFullImageLoaded.value = true
      }
    }
  }
})

onMounted(() => {
  if (!lazy) {
    isInView.value = true
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        isInView.value = true
        observer.disconnect()
      }
    },
    {
      rootMargin: '200px',
      threshold: 0.01,
    },
  )

  if (imageRef.value) {
    observer.observe(imageRef.value)
  }
})
</script>

<template>
  <div
    ref="imageRef"
    class="relative w-full h-full"
    :class="className"
    :style="{ paddingTop: `${aspectRatio}%` }"
  >
    <div
      class="absolute inset-0 w-full h-full bg-transparent"
    />

    <NuxtImg
      v-if="isInView && !hasError"
      class="absolute inset-0 w-full transition-opacity duration-400 h-full"
      :class="[objectFit, hAuto ? '!h-auto' : '', '']"
      :modifiers="fullImageParams"
      :sizes="sizes"
      :src="src"
      :style="{
        visibility: isFullImageLoaded ? 'visible' : 'hidden',
        opacity: isFullImageLoaded ? 1 : 0,
      }"
      @error="onError"
      @load="onFullImageLoad"
    />

    <NuxtImg
      v-if="hasError"
      class="absolute inset-0 w-full h-full object-contain opacity-20"
      src="images/empty.png"
    />
  </div>
</template>
