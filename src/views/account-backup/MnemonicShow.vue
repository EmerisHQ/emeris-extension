<template>
  <Loader v-if="!account.accountMnemonic" />
  <div v-else class="page">
    <Header title="Recovery phrase" />
    <span class="secondary-text mb-6">
      Write down the {{ account.accountMnemonic.trim().split(' ').length }} words below and store them in a safe place.
    </span>
    <p class="words bg-surface-2 rounded-[10px] py-4 px-6 flex flex-wrap gap-x-4 gap-y-2 mb-5">
      <span v-for="(word, index) in account.accountMnemonic.trim().split(' ')" :key="index" class="word">
        {{ word }}
      </span>
    </p>

    <div class="mt-auto">
      <Checkbox
        v-model="checked"
        class="mb-6"
        label="I understand that if I lose my secret recovery phrase, I may lose access to my account and its assets."
      />
      <Button name="Continue" :disabled="!checked" @click="submit" />
      <Button name="Back up later" variant="link" @click="backUpLater = true" />
    </div>

    <Slideout :open="backUpLater" @update:open="backUpLater = $event">
      <h1 class="mb-4">Are you sure?</h1>
      <p class="secondary-text mb-6 text-center">
        If you have not backed up your secret recovery phrase, you may not be able to recover your account.
      </p>

      <Checkbox
        v-model="backUpLaterChecked"
        class="mb-6"
        label="I understand that if I don’t back up my account, I risk losing access to it."
      />
      <div class="buttons">
        <Button name="Back up later" :disabled="!backUpLaterChecked" @click="() => $router.push('/account')" />
        <Button name="Cancel" variant="link" @click="() => (backUpLater = false)" />
      </div>
    </Slideout>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import Button from '@/components/ui/Button.vue';
import Checkbox from '@/components/ui/Checkbox.vue';
import Header from '@@/components/Header.vue';
import Loader from '@@/components/Loader.vue';
import Slideout from '@@/components/Slideout.vue';
import { GlobalEmerisGetterTypes } from '@@/store/extension/getter-types';

const store = useStore();
const router = useRouter();

const checked = ref(false);
const backUpLater = ref(false);
const backUpLaterChecked = ref(false);

const account = computed(() => {
  return store.getters[GlobalEmerisGetterTypes.getAccount];
});

const submit = () => {
  router.push('/backup/confirm');
};
</script>

<style lang="scss" scoped>
.checkbox-card {
  @apply flex items-start p-4 bg-darkBanner rounded-[10px];
}

:deep(.checkbox) {
  @apply bg-surface-2;

  .checkbox__control {
    @apply border-text;

    &:checked {
      background: center/contain no-repeat url('@@/assets/Checkbox.svg');
    }
  }

  .checkbox__label {
    @apply text-sm;
  }
}
</style>
