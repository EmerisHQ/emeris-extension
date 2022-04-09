<template>
  <div class="page">
    <img :src="'/images/UnlockBG.png'" class="background" />

    <h1 style="margin-top: 187px; margin-bottom: 16px">{{ title }}</h1>
    <span v-if="subtitle" style="color: #ffffffaa">{{ subtitle }}</span>

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
