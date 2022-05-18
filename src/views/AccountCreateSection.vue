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

<script>
import { defineComponent } from 'vue';

import Button from '@/components/ui/Button.vue';

export default defineComponent({
  name: 'Account Create Section',
  components: {
    Button,
  },
  methods: {
    toLedger() {
      window.open('popup.html#/ledger?next=/ledger/connect');
    },
  },
});
</script>

<style lang="scss" scoped>
.buttons > *:not(:last-child) {
  margin-bottom: 16px;
  display: block;
}
</style>
