<template>
  <div class="page">
    <Header title="">
      <template #backButton>
        <!-- TODO add icon to Demeris -->
        <img :src="'/images/CoqIcon.svg'" @click="$router.push('/settings')" />
      </template>
      <Icon name="ChevronRightIcon" @click="$router.push('/portfolio')" />
    </Header>
    <img
      style="height: 72px; width: 72px; margin-top: 40px; margin-left: auto; margin-right: auto"
      :src="'/images/Avatar.svg'"
    />
    <span
      class="account-selector"
      style="text-align: center; margin-bottom: 32px; cursor: pointer; font-size: 21px"
      @click="$router.push('/accounts')"
      >{{ account.accountName }} <Icon name="ChevronRightIcon" :icon-size="1"
    /></span>
    <div
      class="list-card-container"
      style="margin-bottom: 16px"
      :style="{
        opacity: account.isLedger ? 0.6 : 1,
      }"
      @click="goToBackupPage"
    >
      <h2>Back up your wallet</h2>
      <span v-if="!backedUp" class="secondary-text">Your wallet is currently not secured</span>
      <span v-if="account.isLedger" class="secondary-text">Not possible on Ledger devices</span>
      <Icon name="ChevronRightIcon" :icon-size="1" />
    </div>
    <div class="list-card-container" style="margin-bottom: 16px">
      <h2>Swap</h2>
      <span class="secondary-text">Swap assets wih Emeris</span>
      <img :src="'/images/SwapListItemGraphic.svg'" />
    </div>
    <div class="list-card-container">
      <h2>Add liquidity to a pool</h2>
      <span class="secondary-text">Browse our pool on Emeris</span>
      <img :src="'/images/LiquidityListItemGraphic.svg'" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Icon from '@/components/ui/Icon.vue';
import Header from '@@/components/Header.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';
import { GlobalEmerisGetterTypes } from '@@/store/extension/getter-types';
import { AccountCreateStates } from '@@/types';

export default defineComponent({
  name: 'Account',
  components: {
    Icon,
    Header,
  },
  computed: {
    account() {
      return this.$store.getters[GlobalEmerisGetterTypes.getAccount] || {};
    },
    backedUp() {
      return this.account.setupState === AccountCreateStates.COMPLETE;
    },
  },
  methods: {
    goToBackupPage() {
      this.$store.dispatch(GlobalEmerisActionTypes.SET_CURRENT_FLOW, {
        currentFlow: 'BACK_UP',
      });
      if (!this.account.isLedger) {
        this.$router.push('/backup');
      }
    },
  },
});
</script>
<style lang="scss" scoped>
.account-selector {
  .icon {
    display: inline-block;
    transform: rotate(90deg) translateX(2px);
  }
}
.list-card-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px;
  height: 90px;
  cursor: pointer;

  background: linear-gradient(0deg, #171717 0%, #040404 100%);

  box-shadow: 3px 9px 32px -4px rgba(0, 0, 0, 0.07);
  border-radius: 10px;

  position: relative;
  overflow: hidden;

  img {
    position: absolute;
    top: 0;
    right: 0;
  }

  .icon {
    position: absolute;
    top: 50%;
    right: 24px;
  }

  .secondary-text {
    font-size: 13px;
  }
}
</style>
