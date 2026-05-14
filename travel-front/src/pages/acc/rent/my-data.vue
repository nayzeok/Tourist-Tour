<script setup lang="ts">
definePageMeta({ layout: 'acc', middleware: ['auth'] })

const { public: { apiUrl } } = useRuntimeConfig()

interface UserProfile {
  passportSeries?: string
  passportNumber?: string
  passportIssuedBy?: string
  passportIssuedDate?: string
  passportCode?: string
  registrationAddress?: string
  licenseNumber?: string
  licenseIssuedDate?: string
  licenseExpiryDate?: string
  isLocked?: boolean
}

const { data: profile, refresh } = await useAsyncData<UserProfile | null>(
  'user-rent-profile',
  () => $fetch(`${apiUrl}/rent-user/profile`, { credentials: 'include' }).catch(() => null) as Promise<UserProfile | null>,
)

const isLocked = computed(() => !!profile.value?.isLocked)
const form = ref<UserProfile>(profile.value ? { ...profile.value } : {})
const saving = ref(false)
const saveError = ref<string | null>(null)
const savedOk = ref(false)

watch(profile, (val) => {
  if (val) form.value = { ...val }
}, { immediate: true })

// Попап запроса на изменение
const changeRequestOpen = ref(false)
const sendingRequest = ref(false)
const requestSent = ref(false)

async function save() {
  saving.value = true
  saveError.value = null
  savedOk.value = false
  try {
    await $fetch(`${apiUrl}/rent-user/profile`, {
      method: 'POST',
      credentials: 'include',
      body: form.value,
    })
    await refresh()
    savedOk.value = true
  } catch (e: any) {
    saveError.value = e?.data?.message || 'Ошибка сохранения'
  } finally {
    saving.value = false
  }
}

async function sendChangeRequest() {
  sendingRequest.value = true
  try {
    await $fetch(`${apiUrl}/rent-user/profile/change-request`, {
      method: 'POST',
      credentials: 'include',
    })
    requestSent.value = true
  } catch {
    alert('Не удалось отправить заявку. Попробуйте позже.')
  } finally {
    sendingRequest.value = false
  }
}
</script>

<template>
  <div>
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/acc/rent" class="text-sm text-gray-400 hover:text-primary transition">
        ← Аренда авто
      </NuxtLink>
    </div>

    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Мои данные</h1>
        <p class="text-sm text-gray-500 mt-1">
          Заполните один раз — следующие бронирования оформятся быстрее
        </p>
      </div>

      <!-- Кнопка "Изменить данные" — только если заблокировано -->
      <button
        v-if="isLocked"
        class="text-sm text-primary hover:underline"
        @click="changeRequestOpen = true"
      >
        Изменить данные
      </button>
    </div>

    <!-- Уведомление о блокировке -->
    <div v-if="isLocked" class="mb-5 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
      <span class="font-medium">Данные сохранены.</span>
      Для изменения обратитесь к администратору.
    </div>

    <form class="space-y-6" @submit.prevent="save">
      <!-- Паспорт -->
      <div class="rounded-2xl border border-gray-100 p-5">
        <h2 class="font-semibold text-base mb-4">Паспортные данные</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-xs text-gray-500">Серия</label>
            <input
              v-model="form.passportSeries"
              :disabled="isLocked"
              class="h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:border-primary transition disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="1234"
              maxlength="4"
            >
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-gray-500">Номер</label>
            <input
              v-model="form.passportNumber"
              :disabled="isLocked"
              class="h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:border-primary transition disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="567890"
              maxlength="6"
            >
          </div>
          <div class="flex flex-col gap-1 sm:col-span-2">
            <label class="text-xs text-gray-500">Кем выдан</label>
            <input
              v-model="form.passportIssuedBy"
              :disabled="isLocked"
              class="h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:border-primary transition disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Отдел МВД по г. ..."
            >
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-gray-500">Дата выдачи</label>
            <input
              v-model="form.passportIssuedDate"
              :disabled="isLocked"
              class="h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:border-primary transition disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="ДД.ММ.ГГГГ"
            >
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-gray-500">Код подразделения</label>
            <input
              v-model="form.passportCode"
              :disabled="isLocked"
              class="h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:border-primary transition disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="540-001"
            >
          </div>
        </div>
      </div>

      <!-- Прописка -->
      <div class="rounded-2xl border border-gray-100 p-5">
        <h2 class="font-semibold text-base mb-4">Прописка</h2>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-gray-500">Адрес регистрации</label>
          <input
            v-model="form.registrationAddress"
            :disabled="isLocked"
            class="h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:border-primary transition disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="г. Томск, ул. Ленина, д. 1, кв. 1"
          >
        </div>
      </div>

      <!-- Водительское удостоверение -->
      <div class="rounded-2xl border border-gray-100 p-5">
        <h2 class="font-semibold text-base mb-4">Водительское удостоверение</h2>
        <div class="grid sm:grid-cols-3 gap-4">
          <div class="flex flex-col gap-1 sm:col-span-3">
            <label class="text-xs text-gray-500">Серия и номер</label>
            <input
              v-model="form.licenseNumber"
              :disabled="isLocked"
              class="h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:border-primary transition disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="54 AB 123456"
            >
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-gray-500">Дата выдачи</label>
            <input
              v-model="form.licenseIssuedDate"
              :disabled="isLocked"
              class="h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:border-primary transition disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="ДД.ММ.ГГГГ"
            >
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-gray-500">Действует до</label>
            <input
              v-model="form.licenseExpiryDate"
              :disabled="isLocked"
              class="h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:border-primary transition disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="ДД.ММ.ГГГГ"
            >
          </div>
        </div>
      </div>

      <!-- Кнопка сохранения -->
      <div v-if="!isLocked" class="flex items-center gap-4">
        <button
          type="submit"
          :disabled="saving"
          class="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {{ saving ? 'Сохранение...' : 'Сохранить данные' }}
        </button>
        <p v-if="saveError" class="text-sm text-red-500">{{ saveError }}</p>
        <p v-if="savedOk" class="text-sm text-green-600">✓ Данные сохранены</p>
      </div>

      <p v-if="!isLocked" class="text-xs text-gray-400">
        После сохранения данные будут заблокированы для самостоятельного редактирования.
        Для изменений обратитесь к администратору.
      </p>
    </form>

    <!-- Попап запроса на изменение -->
    <div
      v-if="changeRequestOpen"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      @click.self="changeRequestOpen = false"
    >
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <h3 class="font-bold text-lg mb-2">Изменение данных</h3>
        <p class="text-sm text-gray-600 mb-5">
          Изменить данные может только администратор после связи с вами.
          Отправить заявку на изменение данных?
        </p>

        <div v-if="!requestSent" class="flex gap-3">
          <button
            :disabled="sendingRequest"
            class="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            @click="sendChangeRequest"
          >
            {{ sendingRequest ? 'Отправка...' : 'Отправить заявку' }}
          </button>
          <button
            class="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
            @click="changeRequestOpen = false"
          >
            Отмена
          </button>
        </div>

        <div v-else class="text-center">
          <div class="text-3xl mb-2">✅</div>
          <p class="text-sm font-medium text-gray-700 mb-1">Заявка отправлена</p>
          <p class="text-xs text-gray-400 mb-4">Администратор свяжется с вами</p>
          <button
            class="px-5 py-2 bg-gray-100 rounded-xl text-sm font-medium"
            @click="changeRequestOpen = false; requestSent = false"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
