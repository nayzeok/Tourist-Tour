<script setup lang="ts">
definePageMeta({ layout: 'default' })

const router = useRouter()

// --- Города из API (для кнопок городов) ---
const { data: rentCities } = await useAsyncData<string[]>(
  'rent-cities',
  () => $fetch(`${useRuntimeConfig().public.apiUrl}/rent/cities`).catch(() => []),
  { default: () => [] },
)

async function searchCity(city: string) {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  const start = d.toISOString().slice(0, 16)
  await router.push({ path: '/rent/cars', query: { city, startDate: start } })
}

// --- FAQ ---
const faqs = [
  { q: 'Какие документы нужны для аренды?', a: 'Паспорт РФ и водительское удостоверение. Некоторые автомобили требуют международные права.' },
  { q: 'Как рассчитывается стоимость аренды?', a: 'Стоимость считается по количеству дней аренды. Минимальный срок указан в карточке каждого автомобиля.' },
  { q: 'Можно ли выбрать место подачи автомобиля?', a: 'Да, место подачи выбирается на странице автомобиля — из офиса аренды или другой точки (если доступно).' },
  { q: 'Как отменить бронирование?', a: 'Отмену можно оформить в личном кабинете в разделе «Аренда авто». При полной оплате — через администратора.' },
  { q: 'Что такое страховой депозит?', a: 'Блокируемая сумма на карте на время аренды. Возвращается полностью при возврате авто без повреждений.' },
  { q: 'Как заполнить данные в кабинете?', a: 'После бронирования перейдите в личный кабинет → «Мои данные» и заполните паспорт, прописку и ВУ.' },
]

const openFaq = ref<number | null>(null)
function toggleFaq(i: number) {
  openFaq.value = openFaq.value === i ? null : i
}

// --- Отзывы ---
const reviews = [
  { name: 'Алексей М.', city: 'Москва', rating: 5, text: 'Всё чётко: выбрал авто онлайн, забрал без лишних вопросов. Условия прозрачные, никаких сюрпризов.' },
  { name: 'Марина К.', city: 'Сочи', rating: 5, text: 'Удобная форма бронирования, быстрый ответ менеджера. Авто было точно таким, как на фото.' },
  { name: 'Дмитрий П.', city: 'Казань', rating: 4, text: 'Хороший выбор авто в нужном городе. Личный кабинет удобный — видно всё: статус, оплату, даты.' },
  { name: 'Ольга С.', city: 'Екатеринбург', rating: 5, text: 'Оформила за 5 минут, данные сохранились в кабинете. В следующий раз бронировать ещё быстрее.' },
]

// --- Дефолтные даты для кнопок "Подробнее" (+1 и +3 дня, только клиент) ---
const defaultStartDate = ref('')
const defaultEndDate = ref('')
onMounted(() => {
  const s = new Date(); s.setDate(s.getDate() + 1)
  const e = new Date(); e.setDate(e.getDate() + 3)
  defaultStartDate.value = s.toISOString().slice(0, 16)
  defaultEndDate.value = e.toISOString().slice(0, 16)
})

// --- Реальные авто из API (только клиент, чтобы не было гидрационного мисматча) ---
const { data: previewCars } = useAsyncData(
  'rent-preview-cars',
  () => $fetch<any[]>(`${useRuntimeConfig().public.apiUrl}/rent/cars/all`).catch(() => []),
  { default: () => [], server: false },
)

function formatPrice(n: number) {
  return n.toLocaleString('ru-RU') + ' ₽'
}

// --- Финальный CTA ---
const selectedCity = ref('')
const startDate = ref('')
const searching = ref(false)

async function search() {
  if (!selectedCity.value || !startDate.value) return
  searching.value = true
  await router.push({ path: '/rent/cars', query: { city: selectedCity.value, startDate: startDate.value } })
  searching.value = false
}
</script>

<template>
  <div>
    <!-- ====== КАК ЭТО РАБОТАЕТ ====== -->
    <section class="container py-12 lg:py-16">
      <h2 class="text-2xl lg:text-3xl font-bold mb-8 text-center">
        Как это работает
      </h2>
      <div class="grid lg:grid-cols-3 gap-6">
        <div v-for="(step, i) in [
          { icon: '🔍', title: 'Выберите город и даты', text: 'Укажите город, дату и время начала и завершения аренды' },
          { icon: '🚗', title: 'Сравните автомобили', text: 'Посмотрите доступные варианты с фото, ценами и условиями' },
          { icon: '✅', title: 'Подтвердите бронирование', text: 'Введите ФИО и телефон — получите детали в личном кабинете' },
        ]" :key="i" class="flex gap-4 items-start bg-gray-50 rounded-2xl p-5">
          <div class="text-3xl flex-shrink-0">{{ step.icon }}</div>
          <div>
            <p class="font-semibold mb-1">{{ i + 1 }}. {{ step.title }}</p>
            <p class="text-sm text-gray-600">{{ step.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ====== ПРИМЕРЫ АВТО ====== -->
    <section class="bg-gray-50 py-12 lg:py-16">
      <div class="container">
        <div class="flex items-end justify-between mb-8">
          <h2 class="text-2xl lg:text-3xl font-bold">Доступные автомобили</h2>
          <NuxtLink
            to="/rent/cars"
            class="text-primary text-sm font-medium hover:underline"
          >
            Смотреть все →
          </NuxtLink>
        </div>

        <!-- Скелетон пока грузится -->
        <div v-if="!previewCars?.length" class="grid lg:grid-cols-3 gap-5">
          <div v-for="i in 3" :key="i" class="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
            <div class="h-44 bg-gray-100" />
            <div class="p-4 space-y-3">
              <div class="h-5 bg-gray-100 rounded w-2/3" />
              <div class="h-4 bg-gray-100 rounded w-1/2" />
              <div class="h-10 bg-gray-100 rounded-xl" />
            </div>
          </div>
        </div>

        <div v-else class="grid lg:grid-cols-3 gap-5">
          <div
            v-for="car in previewCars.slice(0, 3)"
            :key="car.id"
            class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col"
          >
            <!-- Фото -->
            <div class="h-44 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden relative">
              <img
                v-if="car.images?.[0]"
                :src="car.images[0]"
                :alt="car.name"
                class="absolute inset-0 w-full h-full object-contain"
                @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
              >
              <span class="text-6xl">🚗</span>
            </div>

            <div class="p-4 flex flex-col flex-1">
              <h3 class="font-bold text-lg mb-3">{{ car.name }}</h3>
              <div class="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4 flex-1">
                <div v-if="car.mileagePerDay">
                  <span class="text-gray-400 text-xs block">Пробег/день</span>
                  <span class="font-medium">{{ car.mileagePerDay }} км</span>
                </div>
                <div v-if="car.deposit">
                  <span class="text-gray-400 text-xs block">Депозит</span>
                  <span class="font-medium">{{ formatPrice(car.deposit) }}</span>
                </div>
                <div v-if="car.transmission">
                  <span class="text-gray-400 text-xs block">КПП</span>
                  <span class="font-medium">{{ car.transmission }}</span>
                </div>
                <div>
                  <span class="text-gray-400 text-xs block">Стоимость от</span>
                  <span class="font-medium text-primary">{{ formatPrice(car.pricePerDay) }}/день</span>
                </div>
              </div>
              <NuxtLink
                :to="{ path: `/rent/cars/${car.id}`, query: { startDate: defaultStartDate, endDate: defaultEndDate } }"
                class="block w-full h-10 bg-primary text-white font-medium rounded-xl hover:opacity-90 transition text-sm flex items-center justify-center mt-auto"
              >
                Подробнее
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ====== ГОРОДА ====== -->
    <section class="container py-12 lg:py-16">
      <h2 class="text-2xl lg:text-3xl font-bold mb-3">
        Выберите город, где нужен автомобиль
      </h2>
      <p class="text-gray-500 mb-8">Аренда авто доступна по всей России</p>
      <div class="flex flex-wrap gap-3">
        <button
          v-for="city in rentCities"
          :key="city"
          class="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:border-primary hover:text-primary transition"
          @click="searchCity(city)"
        >
          {{ city }}
        </button>
        <div v-if="!rentCities?.length" class="text-sm text-gray-400">
          Загрузка городов...
        </div>
      </div>
    </section>

    <!-- ====== ОТЕЛИ И АВИАБИЛЕТЫ ====== -->
    <section class="bg-blue-50 py-12 lg:py-16">
      <div class="container">
        <h2 class="text-2xl lg:text-3xl font-bold mb-3">Поможем спланировать поездку целиком</h2>
        <p class="text-gray-600 mb-8">Аренда авто, отель и авиабилеты — в одном месте</p>
        <div class="grid lg:grid-cols-3 gap-5">
          <div class="bg-white rounded-2xl p-6 border border-blue-100">
            <div class="text-4xl mb-3">🚗</div>
            <h3 class="font-bold text-lg mb-2">Аренда авто</h3>
            <p class="text-sm text-gray-500 mb-4">Выбирайте автомобиль по городу, датам и бюджету</p>
            <NuxtLink
              to="/rent/cars"
              class="inline-block px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition"
            >
              Найти автомобиль
            </NuxtLink>
          </div>
          <div class="bg-white rounded-2xl p-6 border border-blue-100">
            <div class="text-4xl mb-3">🏨</div>
            <h3 class="font-bold text-lg mb-2">Подбор отеля</h3>
            <p class="text-sm text-gray-500 mb-4">Сравните отели по цене, рейтингу и удобствам</p>
            <NuxtLink
              to="/"
              class="inline-block px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition"
            >
              Подобрать отель
            </NuxtLink>
          </div>
          <div class="bg-white rounded-2xl p-6 border border-blue-100">
            <div class="text-4xl mb-3">✈️</div>
            <h3 class="font-bold text-lg mb-2">Авиабилеты</h3>
            <p class="text-sm text-gray-500 mb-4">Найдите билеты по лучшей цене в нужную дату</p>
            <NuxtLink
              to="/avia"
              class="inline-block px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition"
            >
              Подобрать авиабилеты
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ====== ЛИЧНЫЙ КАБИНЕТ ====== -->
    <section class="container py-12 lg:py-16">
      <div class="grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h2 class="text-2xl lg:text-3xl font-bold mb-4">Личный кабинет</h2>
          <p class="text-gray-600 mb-6">
            После бронирования все данные сохраняются в личном кабинете. Вы видите статус,
            даты, стоимость и оплату. Один раз заполните паспорт и ВУ — следующие бронирования
            оформятся быстрее.
          </p>
          <ul class="space-y-3 text-sm text-gray-700">
            <li v-for="item in [
              'Список ваших бронирований с фильтрами',
              'Статусы: Активные, Отменённые, Завершённые',
              'Кнопки оплаты и отмены в нужных статусах',
              'Раздел «Мои данные»: паспорт, ВУ, прописка',
            ]" :key="item" class="flex items-start gap-2">
              <span class="text-primary mt-0.5">✓</span>
              <span>{{ item }}</span>
            </li>
          </ul>
          <NuxtLink
            to="/acc"
            class="inline-block mt-6 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition"
          >
            Перейти в кабинет
          </NuxtLink>
        </div>
        <div class="bg-gray-50 rounded-2xl p-6 border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <span class="font-semibold">Мои бронирования</span>
            <span class="text-xs text-gray-400">Аренда авто</span>
          </div>
          <div class="space-y-3">
            <div v-for="(item, i) in [
              { car: 'Toyota Camry', dates: '15–20 янв', status: 'Активная', color: 'text-green-600 bg-green-50' },
              { car: 'Kia Rio', dates: '3–8 дек', status: 'Завершена', color: 'text-gray-500 bg-gray-100' },
            ]" :key="i" class="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-100">
              <div>
                <p class="font-medium text-sm">{{ item.car }}</p>
                <p class="text-xs text-gray-400">{{ item.dates }}</p>
              </div>
              <span :class="['text-xs font-medium px-2 py-1 rounded-lg', item.color]">
                {{ item.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ====== УСЛОВИЯ АРЕНДЫ ====== -->
    <section class="bg-gray-50 py-12 lg:py-16">
      <div class="container">
        <h2 class="text-2xl lg:text-3xl font-bold mb-8">Условия аренды</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div v-for="cond in [
            { icon: '🪪', title: 'Возраст и стаж', text: 'От 21 года, водительский стаж от 2 лет. Уточняйте по конкретному авто.' },
            { icon: '📄', title: 'Документы', text: 'Паспорт РФ и водительское удостоверение. Для некоторых авто — международные права.' },
            { icon: '💳', title: 'Депозит', text: 'Блокируется на карте на срок аренды. Возвращается при возврате авто без повреждений.' },
            { icon: '🛡️', title: 'Страховка', text: 'Включена базовая страховка ОСАГО. КАСКО — уточняйте в карточке авто.' },
            { icon: '🛣️', title: 'Пробег', text: 'Включённый суточный пробег указан в карточке. За превышение — доплата по тарифу.' },
            { icon: '⛽', title: 'Топливо', text: 'Автомобиль выдаётся с полным баком. Возврат — с тем же уровнем топлива.' },
          ]" :key="cond.title" class="bg-white rounded-2xl p-5 border border-gray-100">
            <div class="text-2xl mb-2">{{ cond.icon }}</div>
            <h3 class="font-semibold mb-1">{{ cond.title }}</h3>
            <p class="text-sm text-gray-500">{{ cond.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ====== ОТЗЫВЫ ====== -->
    <section class="container py-12 lg:py-16">
      <h2 class="text-2xl lg:text-3xl font-bold mb-8">Отзывы</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          v-for="review in reviews"
          :key="review.name"
          class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
        >
          <div class="flex items-center gap-1 mb-3 text-yellow-400">
            <span v-for="s in review.rating" :key="s">★</span>
          </div>
          <p class="text-sm text-gray-700 mb-4">{{ review.text }}</p>
          <div>
            <p class="font-semibold text-sm">{{ review.name }}</p>
            <p class="text-xs text-gray-400">{{ review.city }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ====== FAQ ====== -->
    <section class="bg-gray-50 py-12 lg:py-16">
      <div class="container max-w-3xl">
        <h2 class="text-2xl lg:text-3xl font-bold mb-8">Частые вопросы</h2>
        <div class="space-y-3">
          <div
            v-for="(faq, i) in faqs"
            :key="i"
            class="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          >
            <button
              class="w-full flex items-center justify-between px-5 py-4 text-left font-medium hover:bg-gray-50 transition"
              @click="toggleFaq(i)"
            >
              <span>{{ faq.q }}</span>
              <span class="text-gray-400 text-xl transition-transform" :class="{ 'rotate-45': openFaq === i }">+</span>
            </button>
            <div v-if="openFaq === i" class="px-5 pb-4 text-sm text-gray-600">
              {{ faq.a }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ====== ФИНАЛЬНЫЙ CTA ====== -->
    <section class="bg-primary py-12 lg:py-16">
      <div class="container text-center text-white">
        <h2 class="text-2xl lg:text-4xl font-bold mb-4">Готовы найти автомобиль?</h2>
        <p class="text-blue-100 mb-8 text-lg">Выберите город, даты — и получите список доступных авто</p>

        <div class="bg-white rounded-2xl p-4 max-w-2xl mx-auto grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
          <USelectMenu
            v-model="selectedCity"
            :items="rentCities || []"
            placeholder="Выберите город"
            size="xl"
            :ui="{ base: 'h-12 rounded-xl' }"
          />
          <input
            v-model="startDate"
            class="h-12 rounded-xl border border-gray-200 px-3 text-gray-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            type="datetime-local"
          >
          <button
            class="h-12 px-6 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 whitespace-nowrap"
            :disabled="!selectedCity || !startDate || searching"
            @click="search"
          >
            Найти автомобиль
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
