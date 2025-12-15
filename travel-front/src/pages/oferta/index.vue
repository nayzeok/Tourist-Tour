<script setup lang="ts">
import { ofertaText } from '../../shared/data/oferta'

useHead({
  title: 'Публичная оферта - Турист-тур',
  meta: [
    { name: 'description', content: 'Пользовательское соглашение и публичная оферта сервиса Турист-тур' }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="container mx-auto px-4 lg:px-8 max-w-4xl">
      <div class="bg-white rounded-2xl shadow-sm p-8 lg:p-12">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">
          Пользовательское соглашение (Публичная оферта)
        </h1>

        <div class="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700 leading-relaxed">
          {{ ofertaText }}
        </div>

        <div class="mt-12 pt-8 border-t border-gray-200">
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Icon name="i-lucide-arrow-left" />
            Вернуться на главную
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prose {
  color: #374151;
  line-height: 1.75;
}
</style>
