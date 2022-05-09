<template>
  <div class="page">
    <Header title="Forgot password" />
    <div class="mt-20">
      <Icon name="InformationIcon" icon-size="2" class="mb-1.5" />
      <p class="font-medium text-2 text-center">Are you sure you want to reset your wallet?</p>
      <p class="secondary-text mt-4 mb-1.5 text-center">
        To avoid permanently losing access to your assets, ensure you have backed up the secret recovery phrases for all
        your accounts.
      </p>
    </div>
    <div class="mt-auto">
      <Button class="reset-btn mt-1.5" name="Yes, reset Emeris wallet" @click="submit" />
      <router-link to="/">
        <Button name="Cancel" variant="link" />
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Button from '@/components/ui/Button.vue';
import Icon from '@/components/ui/Icon.vue';
import Header from '@@/components/Header.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';

export default defineComponent({
  name: 'Extension Reset Confirm',
  components: {
    Button,
    Icon,
    Header,
  },
  methods: {
    async submit() {
      await this.$store.dispatch(GlobalEmerisActionTypes.EXTENSION_RESET);
      this.$router.push('/extensionReset/confirmed');
    },
  },
});
</script>
<style lang="scss" scoped>
:deep(.reset-btn button) {
  background: #ff3d56 !important;
}
</style>
