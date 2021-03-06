import { AccountData, AminoSignResponse, StdSignDoc } from '@cosmjs/amino';
import { Transaction, TransactionData } from 'EmerisTransactions';

import * as Base from '@@/../../types/lib/EmerisBase';

import {
  ApproveOriginRequest,
  GetAccountNameRequest,
  GetAddressRequest,
  GetPublicKeyRequest,
  HasWalletRequest,
  IsHWWalletRequest,
  SignAndBroadcastTransactionRequest,
  SignTransactionRequest,
  SupportedChainsRequest,
} from './api';
import { AbstractTxResult } from './transactions';

export interface DisplayAccount {
  name: string;
  algo: string;
  pubKey: Uint8Array;
  address: Uint8Array;
  bech32Address: string;
}

export interface IEmeris {
  loaded: boolean;
  ready?: () => Promise<boolean>;
  getAddress?: (arg: string | GetAddressRequest) => Promise<string>;
  getPublicKey?: (arg: string | GetPublicKeyRequest) => Promise<Uint8Array>;
  isHWWallet?: (arg?: IsHWWalletRequest) => Promise<boolean>;
  supportedChains?: (arg?: SupportedChainsRequest) => Promise<string[]>;
  getAccountName?: (arg?: GetAccountNameRequest) => Promise<string>;
  hasWallet?: (arg?: HasWalletRequest) => Promise<boolean>;
  enable?: (arg?: ApproveOriginRequest) => Promise<boolean>;
  signTransaction?: (
    arg:
      | {
          signingAddress: string;
          chainId: string;
          messages: Transaction<TransactionData>[];
          fee: {
            gas: string;
            amount: Base.Amount[];
          };
          memo?: string;
        }
      | SignTransactionRequest,
  ) => Promise<Uint8Array>;
  signAndBroadcastTransaction?: (
    arg:
      | {
          signingAddress: string;
          chainId: string;
          messages: Transaction<TransactionData>[];
          fee: {
            gas: string;
            amount: Base.Amount[];
          };
          memo?: string;
        }
      | SignAndBroadcastTransactionRequest,
  ) => Promise<AbstractTxResult>;
  getOfflineSigner: (chainId: string) => {
    signAmino: (signerAddress: string, signDoc: StdSignDoc) => Promise<AminoSignResponse>;
    getAccounts: () => Promise<AccountData>;
  };
  getActiveAccount: (chainId: string) => Promise<DisplayAccount>;
}
