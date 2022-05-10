<template>
  <div class="page">
    <Header title="Advanced" :back-to="$route.query.previous" />
    <div class="form" @keyup.enter="submit">
      <span class="my-4">HD derivation path</span>
      <div class="flex mb-4">
        <span class="mr-2 leading-[48px] secondary-text">m/44’/...’/</span>
        <div class="relative mr-2 w-20" :class="{ error: accountError }">
          <Input v-model="account" /><span class="absolute right-5 top-3.5 z-10">’</span>
        </div>
        <div class="mr-2 w-20 flex items-center justify-center" :class="{ error: changeError }">
          <!-- We can not actually change the account change in ledger-cosmos-js -->
          {{ change }}
        </div>
        <div class="mr-2 w-20" :class="{ error: addressIndexError }">
          <Input v-model="addressIndex" />
        </div>
      </div>
      <a @click="infoOpen = true">What is an HD derivation path?</a>
      <Slideout :open="infoOpen" @update:open="infoOpen = $event">
        <h1 class="mb-4">What does it mean HD derivation path?</h1>
        <div class="secondary-text mb-6">
          Derivation path, help you to have multiple accounts under one recovery phrase, please make sure to understand
          before to set it. What each number represents: m / purpose' / coin_type' / account' / change / address_index
        </div>
        <Button name="Ok" @click="() => (infoOpen = false)" />
      </Slideout>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Header from '@@/components/Header.vue';
import Slideout from '@@/components/Slideout.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';

const defaultHdPath = ['0', '0', '0'];
const hdPathRegex = /^(0|(\d{1,2}|1([0-1]\d|2[0-7])))$/; // 0-127 harding is automatic on the first 3 positions of the hd path hardcoded in leder-cosmos-js

const updateHdPath = (position, value, store) => {
  const newAccount = store.state.extension.newAccount;
  const hdPath = newAccount?.hdPath || new Array(...defaultHdPath);
  hdPath[position] = value;
  store.dispatch(GlobalEmerisActionTypes.SET_NEW_ACCOUNT, {
    ...newAccount,
    hdPath,
  });
};

export default defineComponent({
  name: 'Create Account',
  components: { Header, Button, Slideout, Input },
  data: () => ({
    account: '0',
    change: '0',
    addressIndex: '0',

    accountError: undefined,
    changeError: undefined,
    addressIndexError: undefined,

    infoOpen: false,
  }),
  computed: {
    newAccount() {
      return this.$store.state.extension.newAccount;
    },
  },
  watch: {
    newAccount(account) {
      if (account?.hdPath) {
        this.account = account.hdPath[0];
        this.change = account.hdPath[1];
        this.addressIndex = account.hdPath[2];
      }
    },
    account(account) {
      this.accountError = !hdPathRegex.test(account);

      if (!this.accountError) {
        updateHdPath(0, String(account), this.$store);
      }
    },
    change(change) {
      this.changeError = !hdPathRegex.test(change);

      if (!this.changeError) {
        updateHdPath(1, String(change), this.$store);
      }
    },
    addressIndex(index) {
      this.addressIndexError = !hdPathRegex.test(index);

      if (!this.addressIndexError) {
        updateHdPath(2, String(index), this.$store);
      }
    },
  },
  async mounted() {
    await this.$store.dispatch(GlobalEmerisActionTypes.GET_NEW_ACCOUNT);
    this.$store.dispatch(GlobalEmerisActionTypes.SET_NEW_ACCOUNT, {
      ...this.newAccount,
      route: '/accountImportHdPath?previous=' + encodeURI(this.$route.query.previous),
    });
  },
});
</script>
<style lang="scss" scoped>
:deep(input) {
  text-align: center;
}
</style>
