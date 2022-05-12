<template>
  <div class="page">
    <Header title="Accounts" back-to="/account">
      <a v-if="!edit" @click="edit = true">Edit</a>
      <a v-else @click="edit = false">Done</a>
    </Header>
    <div v-for="account in wallet" :key="account.accountName" class="wallet" @click="!edit && goToAccount(account)">
      <img :src="'/images/Avatar.svg'" style="width: 40px; height: 40px" />
      <div style="cursor: pointer">
        <h2 style="font-weight: 600">{{ account.accountName }}</h2>
        <span v-if="backedUp(account)" class="secondary-text"><SumBalances :balances="balances(account)" /></span>
        <span v-else
          ><SumBalances
            :balances="balances(account)"
            small-decimals
            style="display: inline-block"
            class="secondary-text"
          /><span style="color: #ff6072; font-size: 13px"> · Not backed up</span></span
        >
      </div>
      <div
        v-if="account.isLedger"
        style="display: flex; flex-direction: column; margin-left: auto; justify-content: center"
      >
        <span
          style="
            padding: 4px 12px 4px 12px;

            background: #262626;
            color: white;
            border-radius: 16px;
            font-size: 13px;
          "
        >
          Ledger
        </span>
      </div>
      <Icon
        v-if="edit"
        style="margin-left: auto; cursor: pointer"
        :style="{
          marginLeft: account.isLedger ? '12px' : 'auto',
        }"
        name="ThreeDotsIcon"
        :icon-size="1.5"
        @click="() => (editWallet = account)"
      />
      <div
        v-else-if="account.accountName === lastAccount"
        style="display: flex; flex-direction: column; justify-content: center"
        :style="{
          marginLeft: account.isLedger ? '12px' : 'auto',
        }"
      >
        <img :src="'/images/CheckmarkCircle.svg'" alt="Checkmark" style="height: 24px" />
      </div>
    </div>
    <div style="margin-top: auto">
      <Button name="Add account" @click="addAdditionalAccount = true" />
    </div>
    <Slideout :open="!!editWallet" @update:open="() => (editWallet = null)">
      <Button name="Edit wallet name" variant="link" style="margin-bottom: 4px" @click="renameAccount" />
      <hr style="opacity: 0.14; margin-bottom: 4px" />
      <Button name="Remove account" variant="link" link-color="red" style="margin-bottom: 4px" @click="removeAccount" />
      <hr style="opacity: 0.14; margin-bottom: 4px" />
      <div style="font-weight: 600">
        <Button name="Cancel" variant="link" @click="() => (editWallet = null)" />
      </div>
    </Slideout>

    <!-- Add Additional Account -->
    <Slideout :open="addAdditionalAccount" @update:open="() => (addAdditionalAccount = null)">
      <router-link :to="{ name: 'Create Wallet' }" style="margin-bottom: 4px; color: white">
        <Button name="Create account" variant="link" />
      </router-link>
      <hr style="opacity: 0.14; margin-bottom: 4px" />
      <router-link :to="{ name: 'Account Import Info' }" style="margin-bottom: 4px; color: white">
        <Button name="Import account" variant="link" />
      </router-link>
      <hr style="opacity: 0.14; margin-bottom: 4px" />
      <div style="font-weight: 600">
        <Button name="Cancel" variant="link" @click="() => (addAdditionalAccount = null)" />
      </div>
    </Slideout>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';

import Button from '@/components/ui/Button.vue';
import Icon from '@/components/ui/Icon.vue';
import { GlobalActionTypes } from '@/store';
import Header from '@@/components/Header.vue';
import Slideout from '@@/components/Slideout.vue';
import SumBalances from '@@/components/SumBalances.vue';
import { RootState } from '@@/store';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';
import { GlobalEmerisGetterTypes } from '@@/store/extension/getter-types';
import { AccountCreateStates } from '@@/types';

export default defineComponent({
  name: 'Accounts',
  computed: {
    ...mapState({
      wallet: (state: RootState) => state.extension.wallet,
      lastAccount: (state: RootState) => state.extension.lastAccount,
    }),
    editWalletIndex() {
      return this.wallet.findIndex((wallet) => wallet.accountName === this.editWallet?.accountName);
    },
  },
  components: {
    Button,
    Icon,
    Header,
    Slideout,
    SumBalances,
  },
  data: () => ({
    editWallet: null,
    addAdditionalAccount: false,
    edit: false,
  }),
  watch: {
    wallet: {
      handler(wallet) {
        if (wallet && wallet.length > 0) this.loadBalances();
        if (wallet && wallet.length === 0) this.$router.push('/welcome');
      },
      immediate: true,
    },
  },
  methods: {
    addAccount() {
      this.$router.push('/accountAddAdditional');
    },
    removeAccount() {
      this.$router.push('/accountRemove/' + this.editWalletIndex);
    },
    renameAccount() {
      this.$router.push('/accountRename/' + this.editWalletIndex);
    },
    goToAccount(account) {
      this.$store.dispatch(GlobalEmerisActionTypes.SET_LAST_ACCOUNT_USED, {
        accountName: account.accountName,
      });
      this.$store.dispatch(GlobalEmerisActionTypes.GET_WALLET);
      this.$store.dispatch(GlobalEmerisActionTypes.LOAD_SESSION_DATA);
      this.$router.push('/portfolio');
    },
    backedUp(account) {
      return account.setupState === AccountCreateStates.COMPLETE;
    },
    loadBalances() {
      this.wallet.forEach((account) => {
        if (!this.$store.getters[GlobalEmerisGetterTypes.getAllBalances](account)) {
          this.$store.dispatch(GlobalActionTypes.API.GET_BALANCES, {
            subscribe: true,
            params: { address: account.keyHash },
          });
        }
      });
    },
    balances(account) {
      return this.$store.getters[GlobalEmerisGetterTypes.getAllBalances](account) || [];
    },
  },
});
</script>
<style lang="scss" scoped>
.wallet {
  display: flex;
  margin-bottom: 24px;

  > img {
    height: 48px;
    width: 48px;
    margin-right: 16px;
    margin-top: 6px;
  }
}

:deep(.total-price) {
  * {
    font-size: 13px !important;
  }
}
</style>
