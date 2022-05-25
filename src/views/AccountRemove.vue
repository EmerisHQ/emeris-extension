<template>
  <div class="page">
    <Header title="Remove account" :back-to="$route.query.backto" />
    <div class="mt-32">
      <Icon name="InformationIcon" :icon-size="1.5" class="mb-4" />
      <p class="font-medium text-2 text-center">Are you sure you want to remove {{ account.accountName }} account?</p>
    </div>
    <div class="mt-auto">
      <Button class="reset-btn" name="Remove account" @click="removeWallet" />
      <Button name="Cancel" variant="link" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import Button from '@/components/ui/Button.vue';
import Icon from '@/components/ui/Icon.vue';
import Header from '@@/components/Header.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';

const store = useStore();
const router = useRouter();

interface Props {
  index: number;
}

const props = withDefaults(defineProps<Props>(), { index: 0 });

const wallet = computed(() => {
  return store.state.extension.wallet;
});

const account = computed(() => {
  return wallet.value[props.index];
});

const removeWallet = async () => {
  await store.dispatch(GlobalEmerisActionTypes.REMOVE_ACCOUNT, { accountName: account.value.accountName });
  router.push('/accounts');
};
</script>

<style lang="scss" scoped>
:deep(.reset-btn button) {
  background: #ff3d56 !important;
}
</style>
