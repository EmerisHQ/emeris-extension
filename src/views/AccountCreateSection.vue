<template>
  <div class="buttons">
    <router-link :to="{ name: 'Create Wallet' }">
      <Button name="Create account" />
    </router-link>
    <router-link :to="{ name: 'Account Import Info' }">
      <Button name="Import Account" variant="secondary" />
    </router-link>
    <Button name="Import Ledger" variant="link" @click="toLedger" />
  </div>
</template>

<script lang="ts" setup>
import Button from '@/components/ui/Button.vue';

const toLedger = () => {
  window.open('popup.html#/ledger?next=/ledger/connect');
};
</script>

<style lang="scss" scoped>
.buttons > *:not(:last-child) {
  @apply mb-4 block;
}
</style>
