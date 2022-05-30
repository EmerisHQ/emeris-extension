<template>
  <div class="page">
    <Header title="Confirm secret recovery phrase" />
    <img :src="'/images/Stepper-' + step + '.svg'" class="h-5 mb-8" />
    <p class="select-word text-center mb-12">
      <span class="secondary-text">Select the </span>
      <span class="font-semibold text-text">{{ positionWord }}</span>
      <span class="secondary-text"> word in your secret recovery phrase.</span>
    </p>
    <div class="flex flex-wrap">
      <Button
        v-for="word in possibleWords"
        :key="word"
        :class="{ error: error === word }"
        :name="word"
        class="w-1/2"
        variant="link"
        @click="() => check(word)"
      />
    </div>
    <p v-if="error" class="text-center mt-20 text-negative-text">Incorrect word, try again.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Button from '@/components/ui/Button.vue';
import Header from '@@/components/Header.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';
import { GlobalEmerisGetterTypes } from '@@/store/extension/getter-types';
import wordlist from '@@/wordlists/english.json';

const shuffleArray = (array) => array.sort(() => 0.5 - Math.random());

export default defineComponent({
  name: 'Mnemonic Confirm',
  components: {
    Button,
    Header,
  },
  data: () => ({
    step: 0,
    positions: [],
    error: null,
    possibleWords: [],
    wordList: [],
  }),
  computed: {
    account() {
      return this.$store.getters[GlobalEmerisGetterTypes.getAccount];
    },
    currentFlow() {
      return this.$store.getters[GlobalEmerisGetterTypes.getCurrentFlow];
    },
    positionWord() {
      switch (this.positions[this.step] + 1) {
        case 1:
          return '1st';
        case 2:
          return '2nd';
        case 3:
          return '3rd';
        case 21:
          return '21st';
        case 22:
          return '22nd';
        case 23:
          return '23rd';
        default:
          return this.positions[this.step] + 1 + 'th';
      }
    },
  },
  watch: {
    account: {
      immediate: true,
      handler() {
        this.wordList = this.account.accountMnemonic.trim().split(' ');
        while (this.positions.length < 3) {
          const position = Math.floor(Math.random() * this.wordList.length);
          if (!this.positions.includes(position)) this.positions.push(position);
        }
        this.showWords();
      },
    },
  },
  methods: {
    showWords() {
      const possibleWords = [this.wordList[this.positions[this.step]]];
      while (possibleWords.length < 6) {
        const wordIndex = Math.floor(Math.random() * wordlist.length);
        if (possibleWords.includes(wordlist[wordIndex])) continue;
        possibleWords.push(wordlist[wordIndex]);
      }
      this.possibleWords = shuffleArray(possibleWords);
    },
    check(word) {
      if (this.wordList[this.positions[this.step]] === word) {
        this.error = null;
        if (this.step === 2) {
          this.$store.dispatch(GlobalEmerisActionTypes.ACCOUNT_BACKED_UP, { accountName: this.account.accountName });

          if (this.currentFlow === 'REMOVE_ACCOUNT') {
            this.$router.push('/accountBackedUpForRemove');
          } else {
            this.$router.push('/accountReady');
          }
        }
        this.step++;
        this.showWords();
      } else {
        this.error = word;
      }
    },
  },
});
</script>
<style lang="scss" scoped>
:deep(.error button) {
  background: #ff3d56 !important;
}

:deep(.button-link) {
  height: 48px;

  &:hover {
    background-color: #262626;
  }

  &:active {
    background-color: #ffffff;
    color: white;
  }
}
</style>
