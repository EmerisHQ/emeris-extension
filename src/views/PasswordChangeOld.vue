<template>
  <div class="page">
    <Header title="Current password" />
    <div class="form" @keyup.enter="submit">
      <span class="secondary-text mt-2 mb-4">Enter your current password to proceed.</span>
      <div class="mb-4">
        <Input v-model="password" placeholder="Enter current password" type="password" />
        <span v-if="error" class="form-info error">The password is wrong</span>
      </div>
      <div class="mt-auto">
        <Button type="submit" name="Continue" :disabled="btnDisabled" @click="submit" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Header from '@@/components/Header.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';

export default defineComponent({
  name: 'Password Old',
  components: { Button, Input, Header },
  data: () => ({
    password: '',
    error: false,
    btnDisabled: false,
  }),
  methods: {
    async submit() {
      this.error = false;
      this.btnDisabled = true;

      const wallet = await this.$store.dispatch(GlobalEmerisActionTypes.UNLOCK_WALLET, { password: this.password });
      if (wallet) {
        this.btnDisabled = false;
        this.$router.push('/passwordChange/new');
      } else {
        this.btnDisabled = false;
        this.error = true;
      }
    },
  },
});
</script>
<style scoped>
.terms-of-use {
  font-size: 13px;
}
</style>
