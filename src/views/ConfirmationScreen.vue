<template>
  <div class="page">
    <img :src="'/images/UnlockBG.png'" class="background" />

    <p class="mt-64 mb-1 font-medium text-2 text-center">{{ title }}</p>
    <span
      v-if="subtitle"
      class="text-center"
      :class="{ 'text-negative-text': errorSubtitle, 'secondary-text': !errorSubtitle }"
      >{{ subtitle }}</span
    >

    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Confirmation',
  components: {},
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, required: false, default: undefined },
    errorSubtitle: { type: Boolean, required: false, default: false },
  },
});
</script>
<style scoped>
.wordmark {
  margin-left: auto;
  margin-right: auto;
  display: block;
}
</style>
