<template>
  <div
    class="list-card-container flex items-center justify-center self-stretch flex-none grow-0 order-none text-[13px] leading-5 py-5 px-6 mb-3 rounded-[10px]"
  >
    <img :src="img" class="mr-4 w-8" />
    <span>{{ caption }}</span>
  </div>
</template>

<script lang="ts" setup>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  img: string;
  caption: string;
}>();
</script>

<style lang="scss" scoped>
.list-card-container {
  @apply mix-blend-normal shadow-button bg-list-card-gradient;
}
</style>
