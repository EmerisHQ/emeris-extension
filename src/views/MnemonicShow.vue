<template>
  <Loader v-if="!account.accountMnemonic" />
  <div v-else class="page">
    <Header title="Recovery phrase" />
    <span class="secondary-text mb-9">
      Please write down your {{ account.accountMnemonic.trim().split(' ').length }} words in a safe space manually on
      paper
    </span>
    <div class="words mb-5">
      <div v-for="(word, index) in account.accountMnemonic.trim().split(' ')" :key="index" class="word">
        <div class="number">{{ index }}</div>
        <span>{{ word }}</span>
      </div>
    </div>
    <a v-if="copied" class="flex mb-9 text-sm text-positive" @click="copy">
      <Icon name="InformationIcon" :icon-size="1" class="mr-2" />Copied for 2 minutes</a
    >
    <a v-else class="mb-9 text-sm" @click="copy">Click to copy</a>

    <div class="mt-auto">
      <Checkbox
        v-model="checked"
        class="mb-6"
        label="I have backed up my recovery phrase, I understand that if I lose my recovery phrase, I will lose my
          funds."
      />
      <Button name="Continue" :disabled="!checked" @click="submit" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import Button from '@/components/ui/Button.vue';
import Checkbox from '@/components/ui/Checkbox.vue';
import Icon from '@/components/ui/Icon.vue';
import Header from '@@/components/Header.vue';
import Loader from '@@/components/Loader.vue';
import { GlobalEmerisGetterTypes } from '@@/store/extension/getter-types';

const store = useStore();
const router = useRouter();

const checked = ref(false);
const copied = ref(null);

const account = computed(() => {
  return store.getters[GlobalEmerisGetterTypes.getAccount];
});

const submit = () => {
  router.push('/backup/confirm');
};
const copy = () => {
  navigator.clipboard.writeText(account.value.accountMnemonic);
  if (copied.value) {
    clearTimeout(copied.value);
  }
  copied.value = setTimeout(() => {
    navigator.clipboard.writeText('');
    copied.value = null;
  }, 1000 * 120);
};
</script>

<style lang="scss" scoped>
.checkbox-card {
  @apply flex items-start p-4 bg-darkBanner rounded-[10px];
}

.words {
  .word {
    @apply inline-flex mr-4 mb-4;

    .number {
      @apply mr-2 bg-text rounded-[50%] w-6 h-6 font-semibold text-sm pt-1 text-center;
      color: #000000;
    }

    span {
      line-height: 24px;
    }
  }
}

:deep(.checkbox) {
  @apply bg-darkBanner;

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
