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
          funds"
      />
      <Button name="Continue" :disabled="!checked" @click="submit" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Button from '@/components/ui/Button.vue';
import Checkbox from '@/components/ui/Checkbox.vue';
import Icon from '@/components/ui/Icon.vue';
import Header from '@@/components/Header.vue';
import Loader from '@@/components/Loader.vue';
import { GlobalEmerisGetterTypes } from '@@/store/extension/getter-types';

export default defineComponent({
  name: 'Mnemonic Show',
  components: {
    Button,
    Header,
    Checkbox,
    Icon,
    Loader,
  },
  data: () => ({
    checked: false,
    copied: null,
  }),
  computed: {
    account() {
      return this.$store.getters[GlobalEmerisGetterTypes.getAccount];
    },
  },
  methods: {
    submit() {
      this.$router.push('/backup/confirm');
    },
    copy() {
      navigator.clipboard.writeText(this.account.accountMnemonic);
      if (this.copied) {
        clearTimeout(this.copied);
      }
      this.copied = setTimeout(() => {
        navigator.clipboard.writeText('');
        this.copied = null;
      }, 1000 * 120);
    },
  },
});
</script>
<style lang="scss" scoped>
.checkbox-card {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 16px;

  background: #171717;
  border-radius: 10px;
}

.words {
  .word {
    display: inline-flex;
    margin-right: 16px;
    margin-bottom: 16px;

    .number {
      margin-right: 8px;
      background: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      font-weight: 600;
      font-size: 13px;
      line-height: 16px;
      color: #000000;
      padding-top: 4px;
      text-align: center;
    }

    span {
      line-height: 24px;
    }
  }
}

:deep(.checkbox) {
  background-color: #171717;

  .checkbox__label {
    font-size: 13px;
  }
}
</style>
