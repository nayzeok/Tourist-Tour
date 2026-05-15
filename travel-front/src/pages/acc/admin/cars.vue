<script setup lang="ts">
import { useAuthStore } from '~/src/shared/store'

definePageMeta({ layout: 'acc', middleware: ['auth'] })

const { public: { apiUrl } } = useRuntimeConfig()
const auth = useAuthStore()
await auth.ensureStatus()
if (auth.user?.role !== 'SUPERADMIN') await navigateTo('/acc')

// ─── Список авто из RentProg ─────────────────────────────────────────────────
const loading = ref(false)
const cars = ref<any[]>([])

async function loadCars() {
  loading.value = true
  try {
    const res = await $fetch<any>(`${apiUrl}/rent/cars/all`, { credentials: 'include' }).catch(() => null)
    cars.value = Array.isArray(res) ? res : (res?.cars ?? res?.data ?? [])
  } finally {
    loading.value = false
  }
}

onMounted(loadCars)

function carName(c: any) {
  return c.car_name || c.name || `Авто #${c.id}`
}

// ─── Попап фотографий ────────────────────────────────────────────────────────
const photoOpen = ref(false)
const photoCar = ref<any>(null)
const photos = ref<any[]>([])
const photoLoading = ref(false)
const uploading = ref(false)
const uploadError = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)

async function openPhotos(car: any) {
  photoCar.value = car
  photoOpen.value = true
  uploadError.value = null
  await loadPhotos(String(car.id))
}

async function loadPhotos(carId: string) {
  photoLoading.value = true
  try {
    const res = await $fetch<any[]>(`${apiUrl}/car-photos/${carId}`, { credentials: 'include' }).catch(() => [])
    photos.value = Array.isArray(res) ? res : []
  } finally {
    photoLoading.value = false
  }
}

async function uploadFiles(files: FileList | File[]) {
  if (!photoCar.value || !files.length) return
  uploading.value = true
  uploadError.value = null
  try {
    const formData = new FormData()
    for (const file of Array.from(files)) {
      formData.append('files', file)
    }
    const res = await $fetch<any[]>(`${apiUrl}/car-photos/${photoCar.value.id}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })
    photos.value = [...photos.value, ...(Array.isArray(res) ? res : [res])]
  } catch (e: any) {
    uploadError.value = e?.data?.message || 'Ошибка загрузки'
  } finally {
    uploading.value = false
  }
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) uploadFiles(input.files)
  input.value = ''
}

function onDrop(e: DragEvent) {
  dragOver.value = false
  if (e.dataTransfer?.files?.length) uploadFiles(e.dataTransfer.files)
}

async function deletePhoto(photo: any) {
  if (!confirm('Удалить фото?')) return
  await $fetch(`${apiUrl}/car-photos/${photo.id}`, { method: 'DELETE', credentials: 'include' }).catch(() => null)
  photos.value = photos.value.filter(p => p.id !== photo.id)
}

function photoUrl(url: string) {
  if (url.startsWith('http')) return url
  const base = apiUrl.replace(/\/$/, '')
  return base + url
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <div>
        <h1 class="text-2xl font-bold">Фото автомобилей</h1>
        <p class="text-sm text-gray-400 mt-0.5">Дополнительные фотографии (хранятся локально)</p>
      </div>
      <button
        class="h-9 px-4 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition"
        :disabled="loading"
        @click="loadCars"
      >
        {{ loading ? '...' : '↻ Обновить' }}
      </button>
    </div>

    <!-- Скелетон -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <div v-for="i in 8" :key="i" class="h-40 bg-gray-100 rounded-2xl animate-pulse" />
    </div>

    <!-- Пусто -->
    <div v-else-if="!cars.length" class="text-center py-16 text-gray-400">
      <p class="text-4xl mb-3">🚗</p>
      <p class="text-lg font-medium">Автомобили не найдены</p>
    </div>

    <!-- Сетка авто -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <div
        v-for="car in cars"
        :key="car.id"
        class="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition cursor-pointer"
        @click="openPhotos(car)"
      >
        <!-- Превью первого фото или заглушка -->
        <div class="h-32 bg-gray-100 relative">
          <img
            v-if="car.photo_url || car.image"
            :src="car.photo_url || car.image"
            :alt="carName(car)"
            class="w-full h-full object-cover"
          >
          <div v-else class="w-full h-full flex items-center justify-center text-gray-300 text-3xl">🚗</div>
          <div class="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-lg">
            #{{ car.id }}
          </div>
        </div>
        <div class="p-3">
          <p class="font-medium text-sm truncate">{{ carName(car) }}</p>
          <p class="text-xs text-gray-400 mt-0.5">Нажмите для управления фото</p>
        </div>
      </div>
    </div>

    <!-- ====== Попап фотографий ====== -->
    <Teleport to="body">
      <div
        v-if="photoOpen && photoCar"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
        @click.self="photoOpen = false"
      >
        <div class="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
          <div class="flex items-start justify-between mb-5">
            <div>
              <h3 class="font-bold text-lg">{{ carName(photoCar) }}</h3>
              <p class="text-sm text-gray-400 mt-0.5">Управление фотографиями · #{{ photoCar.id }}</p>
            </div>
            <button class="text-gray-400 hover:text-gray-600 text-xl leading-none" @click="photoOpen = false">✕</button>
          </div>

          <!-- Зона загрузки -->
          <div
            :class="['border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer mb-5', dragOver ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary hover:bg-gray-50']"
            @click="fileInput?.click()"
            @dragover.prevent="dragOver = true"
            @dragleave="dragOver = false"
            @drop.prevent="onDrop"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              class="hidden"
              @change="onFileChange"
            >
            <div v-if="uploading" class="flex items-center justify-center gap-2 text-primary">
              <span class="animate-spin text-xl">⏳</span>
              <span class="text-sm font-medium">Загрузка...</span>
            </div>
            <div v-else>
              <p class="text-2xl mb-2">📁</p>
              <p class="text-sm font-medium text-gray-600">Перетащите фото сюда или нажмите для выбора</p>
              <p class="text-xs text-gray-400 mt-1">JPG, PNG, WebP · до 10 МБ · несколько файлов</p>
            </div>
          </div>

          <p v-if="uploadError" class="text-red-500 text-sm mb-4">{{ uploadError }}</p>

          <!-- Список фото -->
          <div v-if="photoLoading" class="grid grid-cols-3 gap-3">
            <div v-for="i in 6" :key="i" class="aspect-square bg-gray-100 rounded-xl animate-pulse" />
          </div>

          <div v-else-if="!photos.length" class="text-center py-8 text-gray-400">
            <p class="text-3xl mb-2">🖼️</p>
            <p class="text-sm">Фотографии не добавлены</p>
          </div>

          <div v-else class="grid grid-cols-3 gap-3">
            <div
              v-for="photo in photos"
              :key="photo.id"
              class="relative group aspect-square rounded-xl overflow-hidden bg-gray-100"
            >
              <img
                :src="photoUrl(photo.url)"
                :alt="photo.filename"
                class="w-full h-full object-cover"
              >
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                <button
                  class="opacity-0 group-hover:opacity-100 transition bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium"
                  @click.stop="deletePhoto(photo)"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>

          <button
            class="w-full mt-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
            @click="photoOpen = false"
          >
            Закрыть
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
