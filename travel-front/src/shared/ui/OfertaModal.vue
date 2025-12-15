<script setup lang="ts">
import { ofertaText } from '../data/oferta'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})

const closeModal = () => {
  isOpen.value = false
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :transition="false"
    :ui="{
      content: 'rounded-2xl'
    }"
  >
    <template #content>
      <div class="grid gap-0 overflow-y-auto">
        <header class="flex items-start justify-between gap-2 border-b border-gray-200 px-6 py-4">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">
              Пользовательское соглашение (Публичная оферта)
            </h2>
          </div>

          <UButton
            icon="i-lucide-x"
            size="xs"
            variant="ghost"
            @click="closeModal"
          />
        </header>

        <section class="px-6 py-4 max-h-[70vh] overflow-y-auto">
          <div class="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700 leading-relaxed">
            {{ ofertaText }}
          </div>
        </section>

        <footer class="flex justify-end gap-2 border-t border-gray-200 px-6 py-4">
          <UButton color="primary" @click="closeModal">
            Закрыть
          </UButton>
        </footer>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.prose {
  color: #374151;
  line-height: 1.75;
}
</style>
