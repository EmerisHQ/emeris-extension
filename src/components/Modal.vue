<template>
  <div v-if="open" class="flex content-center items-center fixed top-0 left-0 overflow-y-auto h-full w-full z-[1000]">
    <!--Overlay Effect-->
    <div
      id="my-modal"
      class="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full opacity-60"
      @click="close"
    ></div>

    <!--modal content-->
    <div class="shadow-lg rounded-md mx-6 z-[1] bg-[#262626]">
      <div class="text-center pt-5">
        <h3 class="font-bold text-base text-center tracking-normal">
          {{ title }}
        </h3>
        <p class="text-sm text-center mt-2 mx-4 mb-4 text-white opacity-70">
          {{ description }}
        </p>
        <div
          class="font-semibold items-center px-4 py-3 cursor-pointer border-t-[0.5px] border-[#ffffff17]"
          @click="close"
        >
          <a>{{ buttonText }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    title: { type: String, required: true },
    description: { type: String, required: true },
    buttonText: { type: String, default: 'OK' },
    open: { type: Boolean, required: true },
  },
  emits: ['close'],
  methods: {
    close() {
      this.$emit('close');
    },
  },
};
</script>
