<template>
  <div class="container py-10">
    <div class="rentprog-widget-wrapper">
      <!-- Виджет RentProg — custom element, загружается через внешний скрипт -->
      <rentprog-widget
        v-if="token && widgetReady"
        :token="token"
        locale="ru"
        show_all_cars="false"
        hidden_car_year="false"
        show_email="true"
        show_phone="true"
        show_middlename="false"
        show_birthday="false"
        show_passport="false"
        show_address="false"
        show_driver_license="true"
        rental_object="Выберите автомобиль"
        middlename_required="false"
        :agreement="agreementJson"
        button_classes="h-14 lg:h-10 bg-primary flex justify-center items-center w-full text-white px-4 py-3 mt-2 rounded-xl font-bold hover:opacity-90 transition"
        icon_classes="h-14 w-14 bg-primary/20 rounded-full flex flex-shrink-0 justify-center items-center text-primary"
        form_container="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg lg:text-base"
        container_classes="relative px-4 py-6 lg:px-10 lg:py-10 bg-white rounded-2xl shadow-lg"
        title_container_classes="block pl-2 font-semibold text-xl self-start text-gray-700"
        title_classes="lg:leading-relaxed sm:text-4xl text-xl"
      />
      <div v-else-if="token && !widgetReady" class="bg-white rounded-2xl p-10 text-center text-gray-500">
        Загрузка формы бронирования...
      </div>
      <div v-else class="bg-white rounded-2xl p-10 text-center text-gray-500">
        <p>Для отображения формы аренды авто настройте <code>NUXT_PUBLIC_RENTPROG_TOKEN</code> в переменных окружения.</p>
        <p class="mt-2 text-sm">Токен можно получить в <a href="https://web.rentprog.ru/signin" target="_blank" rel="noopener" class="text-primary underline">RentProg</a> → Профиль компании → API токен.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const config = useRuntimeConfig()
const token = computed(() => config.public.rentprogToken || '')
const widgetReady = ref(false)

const agreementJson = JSON.stringify({
  text: ', а также принимаете',
  link_text: 'условия аренды',
  link: 'https://rentprog.ru/ru/agreement',
})

// Типизация для Vue (custom element)
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'rentprog-widget': Record<string, string>
    }
  }
}

const loadRentProgAssets = () => {
  if (!token.value) return

  const stylesId = 'rentprog-widget-styles'
  if (!document.getElementById(stylesId)) {
    const link = document.createElement('link')
    link.id = stylesId
    link.rel = 'stylesheet'
    link.href = 'https://rentprog-b5205.web.app/css/app.css'
    document.head.appendChild(link)
  }

  const scriptId = 'rentprog-widget-script'
  if (!document.getElementById(scriptId)) {
    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://rentprog-b5205.web.app/js/app.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load RentProg widget'))
      document.body.appendChild(script)
    })
  }

  return Promise.resolve()
}

onMounted(async () => {
  if (!token.value) return
  await loadRentProgAssets()
  widgetReady.value = true
})
</script>

<style scoped>
.rentprog-widget-wrapper {
  width: 100%;
  min-height: 400px;
}
</style>
