<template>
  <div class="page">
    <Header title="Import account" back-to="/">
      <a @click="toHdPath">Advanced</a>
    </Header>
    <img :src="'/images/ImportLedgerBG.png'" class="background" />
    <div class="block mx-auto mb-14 mt-[72px]">
      <img class="w-[151px]" :src="'/images/LedgerBox.svg'" />
    </div>
    <ListCard :img="'/images/Step1.svg'" caption="Unlock & connect your Ledger device with your computer" />
    <ListCard :img="'/images/Step2.svg'" caption="Open the ‘Cosmos’ app on your Ledger device" />

    <div v-if="error" class="mt-4 text-center text-negative-text">{{ error }}</div>

    <a class="secondary-text mt-6">Having trouble connecting your Ledger?</a>
    <div class="mt-auto">
      <Button name="Connect Ledger" @click="next()" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Button from '@/components/ui/Button.vue';
import Header from '@@/components/Header.vue';
import ListCard from '@@/components/ListCard.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';

export default defineComponent({
  name: 'Connect Ledger',
  components: { ListCard, Header, Button },
  async mounted() {
    const hasPassword = await this.$store.dispatch(GlobalEmerisActionTypes.HAS_WALLET); // the wallet is encrypted with the password so the existence is equal
    if (!hasPassword) {
      this.$router.push({ path: '/passwordCreate', query: { returnTo: this.$route.fullPath } });
    }

    this.$store.dispatch(GlobalEmerisActionTypes.SET_NEW_ACCOUNT, {
      ...this.$store.state.extension.newAccount,
      route: '/ledger',
    });
  },
  methods: {
    toHdPath() {
      this.$router.push('/accountImportHdPath?previous=' + encodeURI(this.$route.fullPath));
    },
    next() {
      // we use the same component for account gathering and signing
      this.$router.push(this.$route.query.next);
    },
  },
});
</script>
