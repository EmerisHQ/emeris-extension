<template>
  <button @click="approve">approve</button>
  <button @click="reject">reject</button>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { ExtensionRequest } from '@@/types/index';

export default defineComponent({
  name: 'ApproveOrigin',
  emits: ['response'],
  props: {
    request: {
      type: Object as PropType<ExtensionRequest>,
    },
  },
  setup(props, { emit }) {
    const approve = () => {
      emit('response', true);
    };
    const reject = () => {
      emit('response', false);
    };
    return { approve, reject };
  },
});
</script>
