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
  smallDecimals: boolean;
}
const props = withDefaults(defineProps<Props>(), { smallDecimals: false });

const store = useStore();

const displayPrice = props.balances.reduce((total, balance) => {
  if (store.getters[GlobalGetterTypes.API.getPrice]({ denom: balance.denom })) {
    const totalValue =
      parseInt(balance.amount) * store.getters[GlobalGetterTypes.API.getPrice]({ denom: balance.denom });
    const precision = Math.pow(
      10,
      store.getters[GlobalGetterTypes.API.getDenomPrecision]({
        name: balance.denom,
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
