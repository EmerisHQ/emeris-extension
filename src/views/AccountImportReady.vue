<template>
  <div class="page">
    <img class="mx-auto mt-12 w-full" src="/images/SurferPortal.png" />
    <h1 class="mb-5" name>Account imported</h1>
    <div class="secondary-text mb-6 text-center">Welcome to the world of cross-chain DeFi with Emeris!</div>
    <router-link to="/" class="mt-auto">
      <Button name="Continue" />
    </router-link>
  </div>
</template>

<script lang="ts" setup>
import Button from '@/components/ui/Button.vue';
</script>

<style scoped>
h1 {
  @apply relative block flex-none self-stretch grow-0 w-[327px] h-[72px] top-8 font-bold text-3xl text-center m-0;
}

.buttons > *:not(:last-child) {
  @apply mb-4 block;
}

:deep(.button-link) {
  @apply h-12;
}
</style>
