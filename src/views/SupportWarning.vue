<template>
  <div class="page">
    <Header :title="$route.query.caption" back-to="/settings" />
    <div class="mt-16 text-center">
      <Icon name="WarningTriangleIcon" :icon-size="2" class="mb-6 text-warning" />
      <h1 class="mb-6">The Emeris support team will never ask you your secret recovery phrase.</h1>
      <span class="secondary-text"
        >Scammers will sometimes pose as company representatives in an attempt to gain access to your account and steal
        your assets. Be careful out there!</span
      >
    </div>
    <div class="mt-auto">
      <Button :name="'Continue to ' + $route.query.caption" @click="submit">
        <template #right>
          <Icon name="DaggArrowRightIcon" :icon-size="1" class="inline-flex -rotate-45" />
        </template>
      </Button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Button from '@/components/ui/Button.vue';
import Icon from '@/components/ui/Icon.vue';
import Header from '@@/components/Header.vue';

export default defineComponent({
  name: 'Support Warning',
  components: {
    Button,
    Icon,
    Header,
  },
  methods: {
    async submit() {
      window.open(this.$route.query.url, '_blank');
    },
  },
});
</script>
<style lang="scss" scoped>
:deep(.reset-btn button) {
  background: #ff3d56 !important;
}
</style>
