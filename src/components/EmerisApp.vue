<template>
  <Loader />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import browser from 'webextension-polyfill';

import Loader from '@@/components/Loader.vue';
import { useExtensionStore } from '@@/store';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';
import { GlobalEmerisGetterTypes } from '@@/store/extension/getter-types';
import { ExtensionRequest } from '@@/types';
import { webDebugging } from '@@/utils/web-debugging';

// TODO this component should be refactored into sth more speaking imo

export default defineComponent({
  name: 'EmerisApp',
  components: {
    Loader,
  },
  setup() {
    const store = useExtensionStore();

    const pending = computed<ExtensionRequest[]>(() => {
      return store.getters[GlobalEmerisGetterTypes.getPending];
    });
    const wallet = computed<ExtensionRequest[]>(() => {
      return store.getters[GlobalEmerisGetterTypes.getWallet];
    });
    const respond = (id) => {
      browser.runtime.sendMessage({
        type: 'fromPopup',
        data: {
          action: 'setResponse',
          data: pending.value.find((item) => item.id == id),
        },
      });
    };

    return { pending, respond, wallet };
  },
  mounted() {
    this.route();
  },
  methods: {
    async route() {
      if (import.meta.env.MODE === 'web') {
        await webDebugging();
      }
      const pending = await this.$store.dispatch(GlobalEmerisActionTypes.GET_PENDING);
      const hasWallet = await this.$store.dispatch(GlobalEmerisActionTypes.HAS_WALLET); // checking if the password was set
      const wallet = await this.$store.dispatch(GlobalEmerisActionTypes.GET_WALLET); // if able to load the wallet, the extension is unlocked

      // if we are in a popup and there are no more pending requests, close
      if (pending.length === 0 && location.search !== '?browser=true') {
        window.close();
      }

      // if the use has a password set but the extension is not unlocked
      if (hasWallet && !wallet) {
        this.$router.push('/welcomeBack');
        return;
      }
      // if there are pending requests show those first
      else if (pending.length > 0) {
        switch (pending[0].action) {
          // TODO replace action names with enums
          case 'enable':
          case 'keplrEnable':
            this.$router.push({ path: '/whitelist' });
            break;
          case 'signTransaction':
          case 'signTransactionForOfflineAminoSigner':
          case 'signAndBroadcastTransaction':
            this.$router.push({ path: '/transaction/review' });
            break;
          default:
            this.$router.push('/portfolio');
        }
        return;
      }
      // if the user has not yet created an account
      else if (!hasWallet || (wallet && wallet.length === 0)) {
        this.$router.push('/welcome');
        return;
      }

      await this.$store.dispatch(GlobalEmerisActionTypes.LOAD_SESSION_DATA);

      // return to account creation
      const newAccount = await this.$store.dispatch(GlobalEmerisActionTypes.GET_NEW_ACCOUNT);
      if (newAccount) {
        this.$router.push('/create-resume');
        return;
      }

      // default case go to portfolio
      this.$router.push('/portfolio');
    },
  },
});
</script>

<style scoped>
p {
  font-size: 20px;
}
</style>
