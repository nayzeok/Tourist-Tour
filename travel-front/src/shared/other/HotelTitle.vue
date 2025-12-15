<script lang="ts" setup="">
const viewport = useViewport()
</script>


<template>
  <div class="flex text-center max-w-4xl mx-auto text-white  relative">
    <div class="text-xl lg:text-5xl font-semibold lg:leading-[52px]">
      Поиск дешевых отелей, хостелов, апартаментов, домов и квартир
    </div>

    <div v-if="!viewport.isLessThan('lg')" class="absolute bottom-0 font-semibold right-0 translate-x-24 rotate-10 bg-gradient-to-r from-[#FB51CE] to-[#FB2461] text-xs px-4 py-2 rounded-2xl">
      Уже со скидкой
    </div>
  </div>
</template>

<style scoped>

</style>