<template>
  <div class="page">
    <div class="mt-32">
      <img :src="'/images/check-brand.png'" class="mb-8 w-16 h-16 mx-auto" />
      <p class="font-medium text-2 text-center">Wallet reset</p>
      <p class="secondary-text mt-4 mb-1.5 text-center">
        You successfully reset your Emeris wallet password, and all accounts have been removed.
      </p>
    </div>
    <div class="mt-auto">
      <Button name="Done" @click="submit" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Button from '@/components/ui/Button.vue';

export default defineComponent({
  name: 'Extension Reset Confirmed',
  components: {
    Button,
  },
  methods: {
    submit() {
      this.$router.push('/welcome');
    },
  },
});
</script>
