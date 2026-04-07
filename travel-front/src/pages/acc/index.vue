<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore } from '~/src/shared/store'
import { updateProfile, changeEmail } from '~/src/shared/api/user'

definePageMeta({
  layout: 'acc',
  middleware: ['auth'],
})

const auth = useAuthStore()
await auth.ensureStatus()

const user = computed(() => auth.user)

const editingEmail = ref(false)
const savingEmail = ref(false)
const emailError = ref<string | null>(null)
const emailForm = ref({ newEmail: '', currentPassword: '' })

const startEditEmail = () => {
  emailForm.value.newEmail = user.value?.email || ''
  emailForm.value.currentPassword = ''
  emailError.value = null
  editingEmail.value = true
}

const cancelEditEmail = () => {
  editingEmail.value = false
  emailError.value = null
}

const saveEmail = async () => {
  savingEmail.value = true
  emailError.value = null
  try {
    const result = await changeEmail({
      newEmail: emailForm.value.newEmail.trim().toLowerCase(),
      currentPassword: emailForm.value.currentPassword,
    })
    if (result.user) {
      auth.setUser(result.user)
    }
    editingEmail.value = false
  } catch (e: unknown) {
    emailError.value = e instanceof Error ? e.message : 'Ошибка смены email'
  } finally {
    savingEmail.value = false
  }
}

const editing = ref(false)
const saving = ref(false)
const saveError = ref<string | null>(null)

const form = ref({
  firstName: '',
  lastName: '',
  phone: '',
})

const startEdit = () => {
  form.value.firstName = user.value?.firstName || ''
  form.value.lastName = user.value?.lastName || ''
  form.value.phone = user.value?.phone || ''
  saveError.value = null
  editing.value = true
}

const cancelEdit = () => {
  editing.value = false
  saveError.value = null
}

const saveProfile = async () => {
  saving.value = true
  saveError.value = null
  try {
    const result = await updateProfile({
      firstName: form.value.firstName.trim() || undefined,
      lastName: form.value.lastName.trim() || undefined,
      phone: form.value.phone.replace(/\D+/g, '') || undefined,
    })
    if (result.user) {
      auth.setUser(result.user)
    }
    editing.value = false
  } catch (e: unknown) {
    saveError.value = e instanceof Error ? e.message : 'Ошибка сохранения'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold">
        Профиль
      </h1>
      <p class="mt-1 text-sm text-gray-500">
        Управляйте персональными данными и бронированиями.
      </p>
    </div>

    <div v-if="user" class="grid gap-4">
      <!-- Контакты -->
      <div class="rounded-xl border border-gray-200 p-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold">
            Контакты
          </h2>
          <button
            v-if="!editingEmail"
            class="text-sm text-primary hover:underline"
            @click="startEditEmail"
          >
            Изменить почту
          </button>
        </div>

        <dl v-if="!editingEmail" class="grid gap-2 text-sm">
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <dt class="text-gray-500">
              Email
            </dt>
            <dd class="font-medium">
              {{ user.email }}
            </dd>
          </div>
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <dt class="text-gray-500">
              Телефон
            </dt>
            <dd class="font-medium">
              {{ user.phone || '—' }}
            </dd>
          </div>
        </dl>

        <form v-else class="grid gap-3 text-sm" @submit.prevent="saveEmail">
          <div class="grid gap-1">
            <label class="text-gray-500">Новый Email</label>
            <input
              v-model="emailForm.newEmail"
              class="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              required
              type="email"
            >
          </div>
          <div class="grid gap-1">
            <label class="text-gray-500">Текущий пароль</label>
            <input
              v-model="emailForm.currentPassword"
              class="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Для подтверждения"
              required
              type="password"
            >
          </div>
          <p v-if="emailError" class="text-red-500 text-xs">
            {{ emailError }}
          </p>
          <div class="flex gap-2 mt-1">
            <button
              class="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-50"
              :disabled="savingEmail"
              type="submit"
            >
              {{ savingEmail ? 'Сохранение...' : 'Сохранить' }}
            </button>
            <button
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium"
              type="button"
              @click="cancelEditEmail"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>

      <!-- Общая информация -->
      <div class="rounded-xl border border-gray-200 p-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold">
            Общая информация
          </h2>
          <button
            v-if="!editing"
            class="text-sm text-primary hover:underline"
            @click="startEdit"
          >
            Редактировать
          </button>
        </div>

        <!-- Просмотр -->
        <dl v-if="!editing" class="grid gap-2 text-sm">
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <dt class="text-gray-500">
              Имя
            </dt>
            <dd class="font-medium">
              {{ user.firstName || '—' }}
            </dd>
          </div>
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <dt class="text-gray-500">
              Фамилия
            </dt>
            <dd class="font-medium">
              {{ user.lastName || '—' }}
            </dd>
          </div>
        </dl>

        <!-- Форма редактирования -->
        <form v-else class="grid gap-3 text-sm" @submit.prevent="saveProfile">
          <div class="grid gap-1">
            <label class="text-gray-500">Имя</label>
            <input
              v-model="form.firstName"
              class="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Иван"
              type="text"
            >
          </div>
          <div class="grid gap-1">
            <label class="text-gray-500">Фамилия</label>
            <input
              v-model="form.lastName"
              class="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Иванов"
              type="text"
            >
          </div>
          <div class="grid gap-1">
            <label class="text-gray-500">Телефон</label>
            <input
              v-model="form.phone"
              class="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="+7 (___) ___-__-__"
              type="tel"
            >
          </div>
          <p v-if="saveError" class="text-red-500 text-xs">
            {{ saveError }}
          </p>
          <div class="flex gap-2 mt-1">
            <button
              class="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-50"
              :disabled="saving"
              type="submit"
            >
              {{ saving ? 'Сохранение...' : 'Сохранить' }}
            </button>
            <button
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium"
              type="button"
              @click="cancelEdit"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>

      <!-- Поддержка -->
      <div class="rounded-xl border border-gray-200 p-4">
        <h2 class="text-lg font-semibold mb-2">
          Поддержка
        </h2>
        <p class="text-sm text-gray-500 mb-3">
          Есть вопросы по заказу или нужна помощь?
        </p>
        <NuxtLink
          class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition"
          to="/support"
        >
          Написать в поддержку
        </NuxtLink>
      </div>
    </div>

    <div v-else class="text-sm text-gray-500">
      Не удалось загрузить информацию о профиле.
    </div>
  </div>
</template>
