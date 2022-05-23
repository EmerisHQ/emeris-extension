<template>
  <Loader v-if="loading" />
  <div v-else class="page text-center">
    <Brandmark class="wordmark" />
    <p class="secondary-text">{{ url }} wants to connect to your wallet</p>
    <div class="box mt-24">
      <span class="mb-4">Allow {{ url }} to:</span>
      <p class="secondary-text text-[13px]">
        View your account balances and activity<br />
        Request approval for transactions
      </p>
    </div>
    <div class="flex mt-auto">
      <Button name="Reject" variant="secondary" class="mr-4 flex-1" @click="close" />
      <Button name="Accept" class="flex-1" @click="accept" />
    </div>
  </div>
</template>

<script>
import Brandmark from '@/components/common/Brandmark.vue';
import Button from '@/components/ui/Button.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';
import { GlobalEmerisGetterTypes } from '@@/store/extension/getter-types';

export default {
  components: {
    Brandmark,
    Button,
  },
  computed: {
    pending() {
      return this.$store.getters[GlobalEmerisGetterTypes.getPending][0];
    },
    url() {
      const pending = this.$store.getters[GlobalEmerisGetterTypes.getPending];
      return pending && pending.length > 0 ? pending[0].origin : undefined;
    },
  },
  async mounted() {
    const hasWallet = await this.$store.dispatch(GlobalEmerisActionTypes.HAS_WALLET); // checking if the password was set
    if (!hasWallet) {
      // if no password is set, first set a password
      this.$router.push('/passwordCreate?returnTo=/');
      return;
    }

    this.$store.dispatch(GlobalEmerisActionTypes.GET_PENDING);
  },
  methods: {
    async close() {
      await this.$store.dispatch(GlobalEmerisActionTypes.WHITELIST_WEBSITE, {
        id: this.pending.id,
        accept: false,
      });
      window.close();
    },
    async accept() {
      this.loading = true;
      await this.$store.dispatch(GlobalEmerisActionTypes.WHITELIST_WEBSITE, {
        id: this.pending.id,
        accept: true,
      });
      this.$router.push('/');
    },
  },
};
</script>

<style>
.wordmark {
  @apply block mx-auto;
}

.box {
  @apply flex flex-col items-center p-4 bg-surface-2 flex-none order-none self-stretch grow-0 box-border rounded-[10px];
}
</style>
