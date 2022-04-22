import { useExtensionStore } from '@@/store';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';
import { AccountCreateStates, EmerisAccount, EmerisWallet } from '@@/types';

export const account = {
  accountName: 'test',
  accountMnemonic: import.meta.env.VITE_EMERIS_MNEMONIC,
  keyHash: import.meta.env.VITE_EMERIS_KEYHASH,
  keyHashes: [import.meta.env.VITE_EMERIS_KEYHASH],
  isLedger: false,
  setupState: AccountCreateStates.COMPLETE,
} as EmerisAccount;

export const wallet = [account] as EmerisWallet;

export const password = import.meta.env.VITE_EMERIS_WALLET_PASSWORD as string;

export const webDebugging = async () => {
  if (import.meta.env.MODE === 'web') {
    console.log('web debugging activated');

    const store = useExtensionStore();

    await store.dispatch(GlobalEmerisActionTypes.CREATE_WALLET, { password: password });
    await store.dispatch(GlobalEmerisActionTypes.CREATE_ACCOUNT, { account: account });
  }
};
