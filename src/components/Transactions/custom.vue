<template>
  <div class="text-left">
    <span class="mb-3 block">Custom transaction</span>
    <div
      class="flex flex-col overflow-hidden transition-height duration-500 ease-out"
      :class="{ 'h-max': expand, 'h-32': !expand }"
    >
      <Yaml :json="message" />
    </div>
    <div
      ref="innerSlideout"
      class="flex flex-col align-middle ml-4 border-t-1 border-white/[.14]"
      style="border-top: 1px solid #ffffff24"
      @click="expand = !expand"
    >
      <Icon
        :name="'CaretDownIcon'"
        :icon-size="1"
        class="transform transition-transform -ml-2 mt-4"
        :class="{ 'rotate-180': expand }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { EmerisTransactions } from '@emeris/types';
import { ref } from 'vue';

import Icon from '@/components/ui/Icon.vue';

import Yaml from '../Yaml.vue';

defineProps<{
  message: EmerisTransactions.CustomData;
}>();

let expand = ref(false);
</script>
