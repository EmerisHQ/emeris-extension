<template>
  <div class="page">
    <Header title="Import account" :back-to="$route.query.backto" />
    <div class="flex flex-col items-center mt-[150px] mb-14">
      <img :src="'/images/LedgerBox.svg'" class="mt-8 w-[151px]" />
      <div class="text-center mt-8">
        <span>{{ $route.query.error }}</span>
        <br />
        <span class="secondary-text">Please try again or contact our Emeris support</span>
        <br />
        <a
          href=""
          @click="$router.push({ path: '/support', query: { url: 'https://emeris.com/support', caption: 'Support' } })"
        >
          Visit Emeris Support ↗️
        </a>
      </div>
    </div>
    <div class="mt-auto">
      <Button name="Try again" @click="$router.push($route.query.retry)" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Button from '@/components/ui/Button.vue';
import Header from '@@/components/Header.vue';
</script>

<style lang="scss" scoped>
.loader {
  animation-name: spin;
  animation-duration: 1500ms;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}
</style>
