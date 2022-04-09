<template>
  <PrettyPrintTX :request="request" />
  <button @click="approve">approve</button>
  <button @click="reject">reject</button>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import PrettyPrintTX from '@@/components/helpers/PrettyPrintTX.vue';
import { ExtensionRequest } from '@@/types/index';

export default defineComponent({
  name: 'SignTransaction',
  components: {
    PrettyPrintTX,
  },
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
