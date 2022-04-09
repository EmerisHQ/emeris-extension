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

export interface IEmeris {
  loaded: boolean;
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
}
