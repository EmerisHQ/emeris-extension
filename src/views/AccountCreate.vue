<template>
  <Loader v-if="loading" />
  <div v-else class="page">
    <Header title="Account Name" />
    <div class="w-3/4 mx-auto mt-10">
      <div
        class="bg-brand w-16 h-16 rounded-full text-center font-medium text-2 text-inverse pt-3.5 mx-auto shadow-brand"
      >
        {{ nameFirstLetter }}
      </div>
      <div class="my-6">
        <input
          v-model="name"
          type="text"
          class="w-full border-none !bg-transparent text-center font-medium text-2 focus:outline-none focus:border-none"
          :class="{ 'text-negative-text': error || nameHasSpecialCharacters }"
          placeholder="Surfer"
          style="caret-color: rgba(255, 255, 255, 0.5)"
        />
        <p v-if="errorText" class="form-info error text-center mt-6">
          {{ errorText }}
        </p>
      </div>
    </div>
    <div class="mt-auto">
      <Button name="Continue" :disabled="buttonDisabled" @click="submit" />
    </div>
  </div>
</template>

<script lang="ts">
import * as bip39 from 'bip39';
import { defineComponent } from 'vue';
import { mapState } from 'vuex';

import Button from '@/components/ui/Button.vue';
import Header from '@@/components/Header.vue';
import Loader from '@@/components/Loader.vue';
import { RootState } from '@@/store';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';
import { AccountCreateStates } from '@@/types';
import wordlist from '@@/wordlists/english.json';

export default defineComponent({
  name: 'Create Account',
  components: { Button, Header, Loader },
  computed: {
    ...mapState({
      wallet: (state: RootState) => state.extension.wallet,
      newAccount: (state: RootState) => state.extension.newAccount,
    }),
    nameHasSpecialCharacters() {
      return /[^a-zA-Z0-9\s]/.test(this.name);
    },
    error() {
      return this.wallet && this.wallet.find(({ accountName }) => accountName === this.name);
    },
    nameFirstLetter() {
      return this.name && this.name.length > 0 ? this.name.slice(0, 1) : 'S';
    },
    buttonDisabled() {
      return !this.name || this.error || this.nameHasSpecialCharacters;
    },
    errorText() {
      if (this.error) return 'You already used this name for another account. Choose another name.';
      if (this.nameHasSpecialCharacters) return 'Name cannot contain special characters, only numbers and letters.';
      return '';
    },
  },
  data: () => ({
    name: undefined,
    loading: false,
  }),
  watch: {
    name(name) {
      this.$store.dispatch(GlobalEmerisActionTypes.SET_NEW_ACCOUNT, {
        ...this.newAccount,
        accountName: name,
      });
    },
  },
  async mounted() {
    const hasPassword = await this.$store.dispatch(GlobalEmerisActionTypes.HAS_WALLET); // the wallet is encrypted with the password so the existence is equal
    if (!hasPassword) {
      this.$router.push({
        path: '/passwordCreate',
        query: { returnTo: this.$route.fullPath },
      });
    }

    const accounts = (await this.$store.dispatch(GlobalEmerisActionTypes.GET_WALLET)) || [];

    // find an unused account name
    let name;
    let i = 1;
    do {
      name = 'Surfer ' + i++;
    } while (accounts.find(({ accountName }) => accountName === name));

    this.name = name;
    this.$store.dispatch(GlobalEmerisActionTypes.SET_NEW_ACCOUNT, {
      ...this.newAccount,
      route: '/accountCreate',
    });
  },
  methods: {
    async submit() {
      this.loading = true;
      try {
        const aMnemonic = bip39.generateMnemonic(256, null, wordlist);

        await this.$store.dispatch(GlobalEmerisActionTypes.CREATE_ACCOUNT, {
          account: {
            accountName: this.name,
            accountMnemonic: aMnemonic, // will be overwritten by existing new account
            isLedger: false, // will be overwritten by existing new account
            setupState: this.newAccount.setupState || AccountCreateStates.CREATED, // if this is an import we don't need to check if the user backed up the mnemonic
            ...this.newAccount,
          },
        });

        // if the account is imported we don't need to show the backup seed screen
        let nextRoute;
        if (this.newAccount.setupState === AccountCreateStates.COMPLETE) {
          nextRoute = '/accountImportReady';
        } else {
          nextRoute = '/backup?previous=/accountCreate';
        }

        await this.$store.dispatch(GlobalEmerisActionTypes.SET_NEW_ACCOUNT, undefined); // remove new account from flow
        this.$router.push(nextRoute);
      } catch (err) {
        console.error(err);
      }
      this.loading = false;
    },
    open(url) {
      window.open(url);
    },
  },
});
</script>

<style scoped>
.terms-of-use {
  font-size: 13px;
}
.shadow-brand {
  box-shadow: 0.1rem 0.2rem 0.5rem 0.02rem var(--primary);
}
</style>
