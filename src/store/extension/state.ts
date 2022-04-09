import { EmerisAccount, EmerisWallet, ExtensionRequest } from '@@/types';

export type State = {
  pending: Array<ExtensionRequest>;
  wallet: EmerisWallet;
  lastAccount: string;
  newAccount: EmerisAccount & {
    route: string; // route user dropped off
  };
  whitelistedWebsites: { origin: string }[];
};
export function getDefaultState(): State {
  return {
    pending: [],
    wallet: null,
    lastAccount: null,
    newAccount: null,
    whitelistedWebsites: [],
    ledgerSignData: null,
  };
}
