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

export const password = '1234';
