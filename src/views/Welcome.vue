<template>
  <div class="page">
    <img :src="'/images/WelcomeBG.png'" class="background" />
    <img class="wordmark mt-12" :src="'/images/EmerisWordmark.svg'" />

    <div class="mt-auto">
      <AccountCreateSection />
      <div class="text-center mt-4 text-[13px]">
        Need help? Visit
        <a href="" @click="open('https://support.emeris.com/')">Emeris Support</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useStore } from 'vuex';

import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';
import AccountCreateSection from '@@/views/AccountCreateSection.vue';

const store = useStore();

store.dispatch(GlobalEmerisActionTypes.SET_CURRENT_FLOW, {
  currentFlow: 'FIRST_ACCOUNT',
});

const open = (url) => {
  window.open(url);
};
</script>

<style scoped>
.wordmark {
  @apply block mx-auto;
}

:deep(.button-link) {
  @apply h-12;
}
</style>
