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
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';
import { GlobalEmerisGetterTypes } from '@@/store/extension/getter-types';

const router = useRouter();
const route = useRoute();
const store = useStore();

const account = computed(() => {
  return store.getters[GlobalEmerisGetterTypes.getAccount];
});

const currentFlow = computed(() => {
  return store.getters[GlobalEmerisGetterTypes.getCurrentFlow];
});

const backTo = computed(() => {
  if (currentFlow.value === 'CREATE_ACCOUNT') return '/accountCreate?previous=/backup';
  if (currentFlow.value === 'BACKUP_PORTFOLIO') return '/portfolio';
  if (currentFlow.value === 'BACK_UP') return '/account';
  if (currentFlow.value?.includes('BACKUP_ACCOUNT_')) return `/account-settings/${currentFlow.value.split('_')[2]}`;
  return undefined;
});

const goToShowMnemonic = async () => {
  if (route.query.previous !== '/accountCreate') {
    router.push('/backup/password');
  } else {
    if (account.value) {
      await store.dispatch(GlobalEmerisActionTypes.GET_MNEMONIC, {
        accountName: account.value.accountName,
        password: undefined,
        sessionActive: true,
      });
    }
    router.push('/backup/show');
  }
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
