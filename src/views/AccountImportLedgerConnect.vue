<template>
  <div class="page">
    <Header back-to="/ledger?next=/ledger/connect" />
    <div class="flex flex-col items-center flex-1 mb-14 mt-36">
      <img class="loader" :src="'/images/EphemerisLoader.svg'" />
      <img :src="'/images/LedgerBox.svg'" class="mt-8 w-36" />
    </div>
    <div class="secondary-text text-center">Connecting Ledger...</div>
  </div>
</template>

<script lang="ts">
import { stringToPath } from '@cosmjs/crypto';
import { LedgerSigner } from '@cosmjs/ledger-amino';
// eslint-disable-next-line @typescript-eslint/naming-convention
import TransportWebUsb from '@ledgerhq/hw-transport-webusb';
import { defineComponent } from 'vue';

import { keyHashfromAddress } from '@/utils/basic';
import chainConfig from '@@/chain-config';
import Header from '@@/components/Header.vue';
import { getHdPath } from '@@/lib/libraries/cosmjs';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';
import { AccountCreateStates } from '@@/types';

const interactiveTimeout = 120_000;

export default defineComponent({
  name: 'Import Ledger',
  components: {
    Header,
  },
  async mounted() {
    try {
      const hasWallet = await this.$store.dispatch(GlobalEmerisActionTypes.HAS_WALLET); // checking if the password was set
      const wallet = await this.$store.dispatch(GlobalEmerisActionTypes.GET_WALLET); // never loaded before as root not hit
      // handle background locked
      if (hasWallet && !wallet) {
        this.$router.push('/');
      }

      const newAccount = await this.$store.dispatch(GlobalEmerisActionTypes.GET_NEW_ACCOUNT);

      // TODO put all in cosmos library and handle different hd paths?
      const chain = (await chainConfig)['cosmos-hub'];
      const path = stringToPath(
        getHdPath(chain, {
          hdPath: newAccount.hdPath,
        }),
      );

      const ledgerTransport = await TransportWebUsb.create(interactiveTimeout, interactiveTimeout);
      const signer = new LedgerSigner(ledgerTransport, { testModeAllowed: true, hdPaths: [path] });

      const accounts = await signer.getAccounts();

      if (this._.isUnmounted) return; // handle component being unmounted by clicking on Go Back

      const keyHash = keyHashfromAddress(accounts[0].address);
      const existingAccount = wallet.find((account) => account.isLedger && account.keyHashes.includes(keyHash));
      if (existingAccount) {
        throw new Error('Ledger is already registered with account: ' + existingAccount.accountName);
      }

      await this.$store.dispatch(GlobalEmerisActionTypes.SET_NEW_ACCOUNT, {
        ...newAccount,
        isLedger: true,
        setupState: AccountCreateStates.COMPLETE,
        keyHash: keyHashfromAddress(accounts[0].address),
        path: `${this.$route.path}/create`,
      });

      this.$router.push(`${this.$route.path}/create`);
    } catch (err) {
      this.$router.push(
        `/ledger/error?error=${err.message}&backto=/ledger%3Fnext%3D%2Fledger%2Fconnect&retry=${this.$route.path}`,
      );
    }
  },
});
</script>

<style lang="scss" scoped>
.loader {
  animation-name: spin;
  animation-duration: 1500ms;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}
</style>
