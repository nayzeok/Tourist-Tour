<script setup lang="ts">
import type { AccordionItem } from '@nuxt/ui'

const items: AccordionItem[] = [
  {
    label: 'Что делать, если маршрутная квитанция не пришла на почту?',
    content:
      'Мы отправляем маршрутную квитанцию сразу после оформления на указанный адрес электронной почты. Если письмо отсутствует в папке «Входящие», рекомендуем проверить «Спам». Если его там тоже нет, квитанцию можно загрузить в личном кабинете через раздел с документами ваших заказов.',
  },
  {
    label: 'Как вернуть билет или оформить возврат?',
    content:
      'Для подачи запроса на возврат зайдите в личный кабинет, выберите нужный заказ из списка и следуйте инструкциям для оформления.',
  },
  {
    label: 'Как изменить данные в билете?',
    content:
      'Чтобы уточнить, можно ли скорректировать информацию, зайдите в личный кабинет, выберите нужный заказ и нажмите кнопку «Редактировать».',
  },
  {
    label: 'Ребёнок достиг возраста 14 лет. Как правильно оформить билет?',
    content:
      'Если ко времени перелёта ребёнку исполнится 14 лет, билет оформляется по данным его паспорта. Использование свидетельства о рождении в этом случае будет невозможно.',
  },
]
</script>

<template>
  <div class="container pt-10">
    <div class=" text-xl lg:text-3xl font-semibold mb-4">
      У нас есть ответы на вопросы!
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
      <template #trailing>
        <div class="ml-auto p-2 rounded-lg bg-[#EDEEF3] flex-center">
          <Icon class="text-[#181E25] w-3 h-3 group-data-[state=open]:rotate-180 transition-transform duration-200" name="c:carret" />
        </div>
      </template>
    </UAccordion>

    <div class="flex flex-col gap-4 opacity-80 mb-8 text-sm mt-8">
      <div class="font-bold">
        Как получить помощь, если возникли вопросы?
      </div>

      <div class="text-sm">
        Все вопросы по авиабилетам и отелям решаются через поддержку сервисов:
      </div>

      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <div class="font-bold">
            Авиабилеты:
          </div>

          <a class="font-light" href="tel:+74957974797">
            +7 (495) 797-47-97
          </a>
        </div>


        <a class="font-light" href="mailto:support@agent.ru">
          support@agent.ru
        </a>
      </div>

      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <div class="font-bold">
            Отели:
          </div>

          <a class="font-light" href="tel:+88002342554">
            8 (800) 234-25-54
          </a>
        </div>

        <a class="font-light" href="mailto:bro@bronevik.com">
          bro@bronevik.com
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
