<template>
  <div class="page">
    <Header title="Forgot password" />
    <p class="font-medium text-1">Important</p>
    <p class="secondary-text mt-6 mb-1.5">
      Important There is no way to recover your lost or forgotten Emeris wallet password, and resetting the Emeris
      wallet will remove all accounts you created or imported. If you haven’t backed up the accounts you created with
      Emeris, you will lose access to those accounts—and all of their assets. <br /><br />
      If you have backed up the secret recovery phrases for your accounts, you can import them again after resetting
      Emeris.
    </p>
    <div class="mt-auto">
      <router-link to="/extensionReset/confirm">
        <Button name="Reset Emeris Wallet" />
      </router-link>
      <router-link to="/">
        <Button name="Cancel" variant="link" />
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Button from '@/components/ui/Button.vue';
import Header from '@@/components/Header.vue';

export default defineComponent({
  name: 'Extension Reset',
  components: {
    Button,
    Header,
  },
});
</script>
