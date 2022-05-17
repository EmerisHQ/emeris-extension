<template>
  <div
    class="list-card-container flex items-center justify-center self-stretch flex-none grow-0 order-none text-[13px] py-5 px-6 mb-3 rounded-[10px]"
  >
    <img :src="img" class="mr-4 w-8" />
    <span>{{ caption }}</span>
  </div>
</template>

<script>
export default {
  name: 'List Card',
  props: {
    img: { type: String, required: true },
    caption: { type: String, required: true },
  },
};
</script>
<style lang="scss" scoped>
.list-card-container {
  background: linear-gradient(0deg, #262626 0%, #1b1b1b 105%);
  mix-blend-mode: normal;
  /* elevation/button */
  box-shadow: 3px 9px 32px -4px rgba(0, 0, 0, 0.07);
}
</style>
