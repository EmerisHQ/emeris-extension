<template>
  <ConfirmationScreen :title="title" :subtitle="subtitleText" :error-subtitle="error">
    <div class="form" @keyup.enter="checkPassword">
      <div class="buttons mt-auto">
        <div :class="{ error: error }">
          <Input v-model="password" type="password" placeholder="Enter password" />
        </div>
        <Button type="submit" name="Unlock Emeris" @click="checkPassword" />
        <router-link to="/extensionReset">
          <Button name="Forgot Password" variant="link" />
        </router-link>
      </div>
    </div>
  </ConfirmationScreen>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import { useStore } from '@/utils/useStore';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';
import ConfirmationScreen from '@@/views/ConfirmationScreen.vue';

const store = useStore();
const route = useRoute();
const router = useRouter();
const error = ref(false);
const password = ref('');

const subtitleText = computed(() => {
  if (error.value) return 'Wrong Password. Try again.';
  return 'Enter your password to unlock Emeris.';
});

const title = computed(() => {
  return route.fullPath.includes('/signIn') ? 'Sign in' : 'Welcome back';
});

const checkPassword = async () => {
  const wallet = await store.dispatch(GlobalEmerisActionTypes.UNLOCK_WALLET, { password: password.value });
  if (wallet) {
    store.dispatch(GlobalEmerisActionTypes.SET_CURRENT_FLOW, {
      currentFlow: '',
    });
    router.push('/');
  } else {
    error.value = true;
  }
};
</script>
