<script setup lang="ts">
import type { AccordionItem } from '@nuxt/ui'

const items: AccordionItem[] = [
  {
    label: 'Как действовать, если мне не пришла маршрутная квитанция?',
  },
  {
    label: 'Как мне вернуть или обменять билет?',
  },
  {
    label: 'Как мне поменять информацию в билете?',
  },
  {
    label: 'Как провозить за границу домашних животных??',
  },
  {
    label:
      'Ребёнку исполнилось 14 лет. Можно ли оформить билет на свидетельство о рождении?',
  },
  {
    label: 'Почему Купибилет?',
  },
]
</script>

<template>
  <div class="container py-10">
    <div class="text-sm font-semibold mb-4 text-[#4A5663]">
      Появился вопрос?
    </div>

    <div class=" text-xl lg:text-3xl font-semibold mb-4">
      У нас есть готовые ответы
    </div>

    <div class="text-[#4A5663] mb-4 text-sm lg:text-base">
      Ответы на самые популярные вопросы мы оставили ниже. Остальные ответы
      хранятся в нашей 
      базе знаний
      . Если вы не нашли то, что вам нужно, напишите
      нам в чат. Мы с радостью ответим на любой, даже самый сложный вопрос
    </div>

    <UAccordion
      :items="items"
      :ui="{
        item: 'border-b border-[#D4D6DD]',
        label: 'text-base lg:text-lg'
      }"
    >
      <template #body="{ item }">
        {{ item.label }}
      </template>

      <template #trailing>
        <div class="ml-auto p-2 rounded-lg bg-[#EDEEF3] flex-center">
          <Icon class="text-[#181E25] w-3 h-3 group-data-[state=open]:rotate-180 transition-transform duration-200" name="c:carret" />
        </div>
      </template>
    </UAccordion>
  </div>
</template>