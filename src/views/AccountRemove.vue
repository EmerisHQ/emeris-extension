<template>
  <Loader v-if="!account" />
  <ConfirmationScreen
    v-else
    :title="`Are you sure that you want to remove ${account.accountName}?`"
    subtitle="If you have not backed up this wallet, you will lose access entirely"
  >
    <div
      :style="{
        marginTop: 'auto',
      }"
      class="buttons"
    >
      <Button name="Remove" @click="removeWallet" />
      <router-link to="/accounts">
        <Button name="Cancel" variant="link" />
      </router-link>
    </div>
  </ConfirmationScreen>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';

import Button from '@/components/ui/Button.vue';
import Loader from '@@/components/Loader.vue';
import { RootState } from '@@/store';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';
import ConfirmationScreen from '@@/views/ConfirmationScreen.vue';

export default defineComponent({
  name: 'Account Remove',
  computed: {
    ...mapState({
      wallet: (state: RootState) => state.extension.wallet,
    }),
    account() {
      return this.wallet[this.index];
    },
  },
  components: {
    Button,
    ConfirmationScreen,
    Loader,
  },
  props: {
    index: { type: Number, required: true },
  },
  methods: {
    async removeWallet() {
      await this.$store.dispatch(GlobalEmerisActionTypes.REMOVE_ACCOUNT, { accountName: this.account.accountName });
      this.$router.push('/accounts');
    },
  },
});
</script>
