<script setup lang="ts">
import HotelTitle from '~/src/shared/other/HotelTitle.vue'
import AviaComponent from '~/src/shared/other/AviaTitle.vue'
import Faq from '~/src/shared/other/Faq.vue'
import Contact from '~/src/shared/other/Contact.vue'
import Support from '~/src/shared/other/Support.vue'
import About from '~/src/shared/other/About.vue'
const route = useRoute()

interface TabItem {
  name: string
  value: 'avia' | 'hotels' | 'rent'
  icon: string
  to?: string
}

const tabs: TabItem[] = [
  {
    name: 'Авиабилеты',
    value: 'avia',
    icon: 'c:plane',
    to: '/avia',
  },
  {
    name: 'Отели',
    value: 'hotels',
    icon: 'c:hotel',
    to: '/',
  },
  {
    name: 'Аренда авто',
    value: 'rent',
    icon: 'c:car',
  },
]

const isActiveTab = (tab: TabItem) => {
  if (tab.value === 'hotels') {
    return route.path === '/' || route.path.startsWith('/hotels')
  }

  if (tab.to) {
    return route.path === tab.to || route.path.startsWith(`${tab.to}/`)
  }

  return false
}

const viewport = useViewport()

const text = computed(() => {
  switch (route.name) {
    case 'avia':
      return AviaComponent
    case 'faq':
      return Faq
    case 'support':
      return Support
    case 'contact':
      return Contact
    case 'about':
      return About
    default:
      return HotelTitle
  }
})
</script>

<template>
  <div class="bg-primary  rounded-b-2xl lg:rounded-b-[64px] px-4 lg:px-0" :class="route.path.includes('/hotels') ? 'pb-10 lg:sticky lg:-top-24 z-10' : 'pb-4 lg:pb-16'">
    <HeaderWidget />

    <div v-if="!route.path.includes('/hotels') " class="  flex flex-col gap-10 container items-center" :class="route.name!=='faq' && route.name !=='support' ? 'py-10 lg:py-20': 'py-10 lg:pt-20'">
      <component :is="text" />

      <div v-if="route.name!=='faq' && route.name !=='support' && route.name !== 'contact' && route.name !== 'about'" class="flex gap-4 justify-center w-full lg:w-auto items-center bg-[#4E97FF] rounded-xl py-3 px-3">
        <template v-for="tab in tabs" :key="tab.value">
          <NuxtLink
            v-if="tab.to"
            class="flex-center flex-1 lg:flex-0 px-8 lg:px-12 py-4 relative rounded-xl transition-colors duration-200"
            :class="[
              isActiveTab(tab) ? 'bg-white' : 'bg-white/40',
              'hover:bg-white/70 cursor-pointer',
            ]"
            :to="tab.to"
          >
            <Icon
              class="w-6 h-6 lg:w-11 lg:h-11"
              :class="isActiveTab(tab) ? 'text-[#2A75FF]' : 'text-white'"
              :name="tab.icon"
            />

            <span
              class="absolute -bottom-10 text-center left-0 w-full whitespace-nowrap font-semibold"
              :class="isActiveTab(tab) ? 'text-white' : 'text-[#2A75FF]'"
            >
              {{ tab.name }}
            </span>
          </NuxtLink>

          <span
            v-else
            class="flex-center flex-1 lg:flex-0 px-8 lg:px-12 py-4 relative rounded-xl bg-white/40 cursor-not-allowed opacity-60"
          >
            <Icon class="w-6 h-6 lg:w-11 lg:h-11 text-white" :name="tab.icon" />

            <span class="absolute -bottom-10 text-center left-0 w-full whitespace-nowrap font-semibold text-[#2A75FF]">
              {{ tab.name }}
            </span>
          </span>
        </template>
      </div>
    </div>

    <SearchMain v-if="$route.path === '/'" :class="route.path.includes('/hotels') ? '!mt-10 ' : ''" />
    
    <AviaWidget v-else-if="$route.name === 'avia'" />
  </div>
</template>
