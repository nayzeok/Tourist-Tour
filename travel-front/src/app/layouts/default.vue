<script lang="ts" setup>
import { ru } from '@nuxt/ui/locale'
</script>

<template>
  <UApp :locale="ru">
    <NuxtLoadingIndicator />
    <MainWidget />
  
    <div class="px-4 pb-8 min-h-[calc(100vh-480px)]">
      <slot />
    </div>
    
    <FooterWidget />
  </UApp>
</template>