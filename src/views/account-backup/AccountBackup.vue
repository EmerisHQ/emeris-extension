<template>
  <div class="page">
    <Header title="Back up account" :back-to="backTo" />
    <span class="secondary-text mb-4">
      Back up your secret recovery phrase to recover your account if your device is lost.
    </span>
    <ListCard
      :img="'/images/Secure.png'"
      caption="A secret recovery phrase is the key to your account. Keep it secret."
    />
    <ListCard
      :img="'/images/NeverShare.png'"
      caption="Never share your secret recovery phrase with anyone—even Emeris Support (we won’t ask)."
    />
    <ListCard
      :img="'/images/ShieldKey.svg'"
      caption="Store it in a safe location (offline is usually best—somewhere waterproof and fireproof)."
    />

    <div class="mt-auto buttons">
      <Button name="Show secret recovery phrase" @click="goToShowMnemonic" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

import Button from '@/components/ui/Button.vue';
import Header from '@@/components/Header.vue';
import ListCard from '@@/components/ListCard.vue';
import { GlobalEmerisGetterTypes } from '@@/store/extension/getter-types';

const route = useRoute();
const router = useRouter();
const store = useStore();

const currentFlow = computed(() => {
  return store.getters[GlobalEmerisGetterTypes.getCurrentFlow];
});

const backTo = computed(() => {
  if (currentFlow.value?.includes('BACKUP_ACCOUNT_')) return `/account-settings/${currentFlow.value.split('_')[2]}`;

  const goBackByRoute = route.fullPath.split('/').slice(0, -1).join('/');
  return goBackByRoute.includes('/create') ? `${goBackByRoute}?previous=/backup` : goBackByRoute;
});

const goToShowMnemonic = async () => {
  router.push(`${route.fullPath}/password`);
};
</script>

<style lang="scss" scoped>
/* overrides checkbox component label class */
.leading-copy {
  @apply text-sm;
}
/* overrides disabled button component background and text color */
.text-inactive {
  background-color: #333333;
  color: #ffffff;
}
:deep(.checkbox__control) {
  @apply border-text;

  &:checked {
    background: center/contain no-repeat url('@@/assets/Checkbox.svg');
  }
}
</style>
