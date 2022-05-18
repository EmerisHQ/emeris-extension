<template>
  <div class="page">
    <img class="mx-auto mt-12 px-6 w-full" src="/images/SurferPortal.png" />
    <h1 class="mt-8 mb-2">You’re ready to start</h1>
    <div class="secondary-text mb-6 text-center">Don’t forget to back up your account later!</div>
    <router-link to="/" class="mt-auto">
      <Button name="Continue" />
    </router-link>
  </div>
</template>

<script lang="ts" setup>
import Button from '@/components/ui/Button.vue';
</script>
