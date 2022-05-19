<template>
  <div class="page">
    <Header title="Import account" :back-to="$route.query.backto" />

    <span class="secondary-text mb-4">Find the recovery phrase for the account you’d like to import.</span>
    <a class="text-sm mb-4" @click="infoOpen = true">What’s a secret recovery phrase?</a>

    <ListCard
      :img="'/images/NeverShare.png'"
      caption="Emeris Support will never ask you to share your secret recovery phrase."
    />
    <ListCard
      :img="'/images/Secure.png'"
      caption="When you import an account, be sure you trust the security of the wallet. Emeris has been fully audited."
    />
    <ListCard
      :img="'/images/Backup.png'"
      caption="Any secret recovery phrase you enter to import an account will be stored on your device, and fully encrypted."
    />

    <Button class="mt-auto" name="Continue" @click="() => $router.push('/accountImport')" />

    <Slideout :open="infoOpen" @update:open="infoOpen = $event">
      <h1 class="mb-4">What’s a secret recovery phrase?</h1>
      <div class="secondary-text mb-6">
        A secret recovery phrase is series of words (usually 12 or 24) used to generate the encryption keys that give
        you access to your crypto account. If your device is stolen or lost, you can regain access to your account by
        importing the secret recovery phrase into another crypto wallet. So always store it securely (for example,
        written down and hidden somewhere safe), and never share it with anyone, since whoever has it can access your
        account, sign transactions, and steal your assets.
      </div>
      <Button name="Ok" @click="() => (infoOpen = false)" />
    </Slideout>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import Button from '@/components/ui/Button.vue';
import Header from '@@/components/Header.vue';
import ListCard from '@@/components/ListCard.vue';
import Slideout from '@@/components/Slideout.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';

const store = useStore();
const router = useRouter();

const infoOpen = ref(false);

onMounted(async () => {
  const hasPassword = await store.dispatch(GlobalEmerisActionTypes.HAS_WALLET);

  if (!hasPassword) {
    router.push({ path: '/passwordCreate', query: { returnTo: '/accountImportInfo' } });
  }
});
</script>
