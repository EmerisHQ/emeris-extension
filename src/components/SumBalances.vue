<template>
  <div class="total-price">
    <CurrencyDisplay :value="displayPrice" :small-decimals="smallDecimals" />
  </div>
</template>

<script setup lang="ts">
import { Coin } from '@cosmjs/amino';
import { useStore } from 'vuex';

import CurrencyDisplay from '@/components/ui/CurrencyDisplay.vue';
import { GlobalGetterTypes } from '@/store';

interface Props {
  balances: Coin[];
  smallDecimals?: boolean;
}
const props = withDefaults(defineProps<Props>(), { smallDecimals: false });

const store = useStore();

const displayPrice = props.balances.reduce((total, balance) => {
  //the passed balances sometimes have the denom as base_denom, sometimes as denom. Needs to be cleaned up.
  const denom = balance.base_denom ?? balance.denom;
  const denomPrice = store.getters[GlobalGetterTypes.API.getPrice]({ denom: denom });
  if (denomPrice) {
    const totalValue = parseInt(balance.amount) * denomPrice;
    const precision = Math.pow(
      10,
      store.getters[GlobalGetterTypes.API.getDenomPrecision]({
        name: denom,
      }) || 6,
    );
    const value = totalValue / precision;
    if (value) {
      return total + value;
    } else {
      return total;
    }
  } else {
    return total;
  }
}, 0);
</script>

<style lang="scss" scoped></style>
