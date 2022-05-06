<template>
  <div class="page">
    <img :src="'/images/UnlockBG.png'" class="background" />

    <h1 class="mt-48 mb-1">{{ title }}</h1>
    <span v-if="subtitle" class="text-center" style="color: #ffffffaa">{{ subtitle }}</span>

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
