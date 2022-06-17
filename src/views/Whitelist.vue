<template>
  <Loader v-if="loading" />
  <div v-else class="page text-center">
    <Brandmark class="wordmark" />
    <p class="secondary-text">{{ url }} wants to connect to your wallet</p>
    <div class="box mt-24">
      <span class="mb-4">Allow {{ url }} to:</span>
      <p class="secondary-text text-[13px]">
        View your account balances and activity<br />
        Request approval for transactions
      </p>
    </div>
    <div class="flex mt-auto">
      <Button name="Reject" variant="secondary" class="mr-4 flex-1" @click="close" />
      <Button name="Accept" class="flex-1" @click="accept" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import Brandmark from '@/components/common/Brandmark.vue';
import Button from '@/components/ui/Button.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';
import { GlobalEmerisGetterTypes } from '@@/store/extension/getter-types';

const store = useStore();
const router = useRouter();

const loading = ref(false);

const pending = computed(() => {
  return store.getters[GlobalEmerisGetterTypes.getPending][0];
});

const url = computed(() => {
  return pending.value?.origin;
});

onMounted(async () => {
  const hasWallet = await store.dispatch(GlobalEmerisActionTypes.HAS_WALLET); // checking if the password was set
  if (!hasWallet) {
    // if no password is set, first set a password
    router.push('/password-create?returnTo=/');
    return;
  }

  store.dispatch(GlobalEmerisActionTypes.GET_PENDING);
});

const close = async () => {
  await store.dispatch(GlobalEmerisActionTypes.WHITELIST_WEBSITE, {
    id: pending.value.id,
    accept: false,
  });
  window.close();
};

const accept = async () => {
  loading.value = true;
  await store.dispatch(GlobalEmerisActionTypes.WHITELIST_WEBSITE, {
    id: pending.value.id,
    accept: true,
  });
  router.push('/');
};
</script>

<style>
.wordmark {
  @apply block mx-auto;
}

.box {
  @apply flex flex-col items-center p-4 bg-surface-2 flex-none order-none self-stretch grow-0 box-border rounded-[10px];
}
</style>
