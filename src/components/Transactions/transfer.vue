<template>
  <div style="text-align: left">
    <span style="margin-bottom: 12px; display: block">Send</span>

    <span class="secondary-text" style="font-size: 13px; margin-bottom: 8px; display: block">Amount</span>
    <div style="display: flex; flex-direction: row; margin-bottom: 12px">
      <CircleSymbol :denom="message.amount.denom" style="margin-right: 16px" />
      <AmountDisplay :amount="message.amount" style="font-weight: 500; font-size: 21px" />
    </div>

    <span class="secondary-text" style="font-size: 13px; margin-bottom: 8px; display: block">To</span>
    <div style="display: flex; flex-direction: row">
      <CircleSymbol
        variant="chain"
        :chain-name="chainName"
        :glow="false"
        style="margin-right: 16px; margin-top: 10px"
      />
      <div style="display: flex; flex-direction: column">
        <Address :address="message.to_address" />
        <span class="secondary-text" style="font-size: 13px">{{ chainName }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { EmerisTransactions } from '@emeris/types';

import AmountDisplay from '@/components/common/AmountDisplay.vue';
import CircleSymbol from '@/components/common/CircleSymbol.vue';
import Address from '@@/components/Address.vue';
export default {
  components: {
    AmountDisplay,
    CircleSymbol,
    Address,
  },
  props: {
    message: { type: EmerisTransactions.TransferData, required: true },
    chainName: { type: String, required: true },
  },
};
</script>

<style></style>
