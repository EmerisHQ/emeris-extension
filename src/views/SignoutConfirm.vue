<template>
  <div class="page">
    <Header title="Sign out" />
    <div class="mt-20">
      <Icon name="InformationIcon" :icon-size="2" class="mb-1.5" />
      <p class="font-medium text-2 text-center">Are you sure you want to sign out?</p>
      <p class="secondary-text mt-4 mb-1.5 text-center">
        To avoid permanently losing access to your assets, ensure you have backed up the secret recovery phrases for all
        your accounts.
      </p>
    </div>
    <div class="mt-auto">
      <Button class="reset-btn" name="Yes, sign out of Emeris" @click="submit" />
      <Button name="Cancel" variant="link" @click="$router.push('/settings')" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import Button from '@/components/ui/Button.vue';
import Icon from '@/components/ui/Icon.vue';
import Header from '@@/components/Header.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';

const store = useStore();
const router = useRouter();

const submit = () => {
  store.dispatch(GlobalEmerisActionTypes.LOCK_WALLET);
  router.push('/signIn');
};
</script>
<style lang="scss" scoped>
:deep(.reset-btn button) {
  background: #ff3d56 !important;
}
</style>
