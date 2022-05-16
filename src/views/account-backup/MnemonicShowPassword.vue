<template>
  <div class="page">
    <Header title="Back up account" />
    <div class="form" @keyup.enter="submit">
      <span class="secondary-text mb-8">
        If your device is lost or stolen, you will be able to recover your wallet. Write down your sentence on a paper
        or in a password manager
      </span>
      <Input v-model="password" placeholder="Password" type="password" />
      <div v-if="error" class="mt-4 text-center text-negative-text">Incorrect word, try again.</div>

      <div class="mt-auto">
        <ListCard
          class="mb-4"
          :img="'/images/Secure.png'"
          caption="Never share your recovery phrase with anyone, store it securily."
        />
        <Button type="submit" name="Show Mnemonic" @click="submit" />
        <Button name="Cancel" variant="link" @click="$router.go(-1)" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Header from '@@/components/Header.vue';
import ListCard from '@@/components/ListCard.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';
import { GlobalEmerisGetterTypes } from '@@/store/extension/getter-types';

const store = useStore();
const router = useRouter();

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
    router.push('/backup/show');
  } catch (e) {
    error.value = true;
  }
};
</script>
