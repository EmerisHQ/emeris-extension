<template>
  <div class="page">
    <Header title="Enter password" />
    <form class="form" @submit.prevent="submit">
      <span class="secondary-text mb-8">
        For your security, enter your account password to view your secret recovery phrase.
      </span>
      <Input v-model="password" placeholder="Password" type="password" />
      <div v-if="error" class="mt-4 text-center text-negative-text">Incorrect word, try again.</div>

      <div class="mt-auto">
        <Button type="submit" :disabled="!password" name="Continue" @click="submit" />
      </div>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Header from '@@/components/Header.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';
import { GlobalEmerisGetterTypes } from '@@/store/extension/getter-types';

const store = useStore();
const router = useRouter();
const route = useRoute();

const password = ref(undefined);
const error = ref(undefined);

const account = computed(() => {
  return store.getters[GlobalEmerisGetterTypes.getAccount];
});

const submit = async () => {
  error.value = false;
  try {
    await store.dispatch(GlobalEmerisActionTypes.GET_MNEMONIC, {
      accountName: account.value.accountName,
      password: password.value,
    });
    router.push(`${route.path.replace('/show', '')}/show`);
  } catch (e) {
    error.value = true;
  }
};
</script>
