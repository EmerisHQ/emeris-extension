<template>
  <div class="relative h-full bg-bg flex flex-col items-center justify-center">
    <div class="flex items-center justify-center mb-5">
      <EphemerisSpinner class="mx-auto h-20 w-20" />
      <img class="absolute w-5 h-5 mx-auto" src="/images/GradientCircle.svg" />
    </div>
    <p class="text-center w-full secondary-text">Please wait</p>
  </div>
</template>

<script lang="ts" setup>
import EphemerisSpinner from '@/components/ui/EphemerisSpinner.vue';
</script>
