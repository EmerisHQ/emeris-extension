<template>
  <ConfirmationScreen title="Welcome back" subtitle="Experience the power of cross-chain DeFi">
    <div class="form" @keyup.enter="checkPassword">
      <div
        :style="{
          marginTop: 'auto',
        }"
        class="buttons"
      >
        <div :class="{ error: error }">
          <Input v-model="password" type="password" placeholder="Enter Password" />
        </div>
        <span v-if="error" class="form-info error">Wrong Password</span>
        <Button type="submit" name="Unlock" @click="checkPassword" />
        <router-link to="/extensionReset">
          <Button name="Forgot Password" variant="link" />
        </router-link>
      </div>
    </div>
  </ConfirmationScreen>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';
import ConfirmationScreen from '@@/views/ConfirmationScreen.vue';

export default defineComponent({
  name: 'Welcome Back',
  components: {
    Button,
    Input,
    ConfirmationScreen,
  },
  data: () => ({
    error: false,
    password: '',
  }),
  methods: {
    async checkPassword() {
      const wallet = await this.$store.dispatch(GlobalEmerisActionTypes.UNLOCK_WALLET, { password: this.password });
      if (wallet) {
        this.$router.push('/');
      } else {
        this.error = true;
      }
    },
  },
});
</script>
<style scoped>
.wordmark {
  margin-left: auto;
  margin-right: auto;
  display: block;
}
</style>
