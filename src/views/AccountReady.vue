<template>
  <div class="page">
    <img class="mx-auto mt-12 px-6 w-full" src="/images/SurferPortal.png" />
    <h1 class="mt-8 mb-2">You’re all set</h1>
    <div class="secondary-text mb-6 text-center">
      You have successfully created and backed up your new account. Welcome to the world of cross-chain DeFi with
      Emeris!
    </div>
    <router-link to="/" class="mt-auto">
      <Button name="Continue" />
    </router-link>
  </div>
</template>

<script lang="ts" setup>
import Button from '@/components/ui/Button.vue';
</script>
