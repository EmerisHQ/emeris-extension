import { AminoSignResponse, StdSignDoc } from '@cosmjs/amino';
import { EmerisBase as Base } from '@emeris/types';
import { EmerisTransactions } from '@emeris/types';
import { v4 as uuidv4 } from 'uuid';

import {
  ApproveOriginRequest,
  ExtensionRequest,
  ExtensionResponse,
  GetAccountNameRequest,
  GetAddressRequest,
  GetPublicKeyRequest,
  HasWalletRequest,
  IsHWWalletRequest,
  RoutedExtensionRequest,
  SignAndBroadcastTransactionRequest,
  SignTransactionRequest,
  SupportedChainsRequest,
} from '@@/types/api';
import { DisplayAccount, IEmeris } from '@@/types/emeris';
import { AbstractTxResult } from '@@/types/transactions';

export class ProxyEmeris implements IEmeris {
  loaded: boolean;
  keplr: object;
  isWalletUnlocked: boolean;

  private queuedRequests: Map<
    string,
    {
      resolver: (any) => void;
      rejecter: (err: Error) => void;
    }
  >;

  constructor() {
    this.loaded = true;
    this.queuedRequests = new Map();
    this.isWalletUnlocked = false;

    window.addEventListener('message', this.responseHandler.bind(this));
  }

  private async responseHandler(event) {
    // We only accept messages from ourselves
    if (event.source !== window) {
      return;
    }
    // We only deal with messages to the extension
    if (event.data.type !== 'fromEmerisExtension') {
      return;
    }

    // Clear action queue if wallet is locked and popup closes
    // to avoid queueing failed methods
    // if (event.data.action === 'onPopupClosed') {
    //   console.log('proxy - popup closed');
    //   console.log('isWalletUnlocked?', this.isWalletUnlocked);
    //   if (!this.isWalletUnlocked) {
    //     // reject all queued promises
    //     this.queuedRequests.forEach((r, requestedAction) =>
    //       r.rejecter(new Error(`Wallet must be unlocked to allow ${requestedAction}.`)),
    //     );
    //     this.queuedRequests.clear();
    //     console.log('proxy - clear queue', this.queuedRequests);
    //   }
    //   return;
    // }

    const request = this.queuedRequests.get(event.data.data.id);
    if (!request) {
      return;
    }

    if (event.data.data.err) {
      request.rejecter(event.data.data.err);
    } else {
      request.resolver(event.data.data);
    }

    this.queuedRequests.delete(event.data.data.id);
  }

  private async sendRequest(request: ExtensionRequest): Promise<ExtensionResponse> {
    console.log('proxy sendRequest start');
    const requestId = uuidv4();

    const fullRequest: RoutedExtensionRequest = {
      type: 'toEmerisExtension',
      data: { id: requestId, ...request },
    };

    let resolver, rejecter;
    const response: Promise<ExtensionResponse> = new Promise((resolve, reject) => {
      resolver = resolve;
      rejecter = reject;
    });
    console.log('proxy sendRequest fullRequest', fullRequest);

    this.queuedRequests.set(requestId, { resolver, rejecter });
    window.postMessage(fullRequest, window.location.origin);
    console.log('proxy postMessage', fullRequest);
    return await response;
  }

  async getAddress(chainId: string): Promise<string> {
    const request = {
      action: 'getAddress',
      data: { chainId },
    };
    const response = await this.sendRequest(request as GetAddressRequest);
    return response.data as string;
  }

  private async getExtensionStatus() {
    console.log('proxy getExtensionStatus start');
    const request = {
      action: 'getEmerisStatus',
    };
    try {
      const response = await this.sendRequest(request as ExtensionRequest);
      console.log('getEmerisStatus response', response);
      return response.data as string;
    } catch (e) {
      console.log('error getExtensionStatus', e);
    }
    return 'failed getExtensionStatus';
  }

  async getPublicKey(chainId: string, accountName?: string): Promise<Uint8Array> {
    const request = {
      action: 'getPublicKey',
      data: { chainId, accountName },
    };
    const response = await this.sendRequest(request as GetPublicKeyRequest);
    return response.data as Uint8Array;
  }

  async isHWWallet(): Promise<boolean> {
    const request = {
      action: 'isHWWallet',
      data: {},
    };
    const response = await this.sendRequest(request as IsHWWalletRequest);
    return response.data as boolean;
  }

  async supportedChains(): Promise<string[]> {
    const request = {
      action: 'supportedChains',
      data: {},
    };
    const response = await this.sendRequest(request as SupportedChainsRequest);
    return response.data as string[];
  }

  async getAccountName(): Promise<string> {
    const request = {
      action: 'getAccountName',
      data: {},
    };
    const response = await this.sendRequest(request as GetAccountNameRequest);
    return response.data as string;
  }

  async hasWallet(): Promise<boolean> {
    const request = {
      action: 'hasWallet',
      data: {},
    };
    const response = await this.sendRequest(request as HasWalletRequest);
    return response.data as boolean;
  }

  private async requestUnlockWallet(
    warningMessage = 'Wallet is currently locked. Enter password to interact.',
  ): Promise<boolean> {
    await this.getExtensionStatus();
    if (this.isWalletUnlocked) return true;
    console.warn(warningMessage);
    await this.enable();
    this.isWalletUnlocked = true;
    return true;
  }

  async signTransaction({
    messages,
    chainId,
    signingAddress,
    fee,
    memo,
  }: {
    signingAddress: string;
    chainId: string;
    messages: EmerisTransactions.AbstractTransaction[];
    fee: {
      gas: string;
      amount: Base.Amount[];
    };
    memo?: string;
  }): Promise<Uint8Array> {
    await this.requestUnlockWallet('Wallet locked. Add password to sign transactions.');
    const request = {
      action: 'signTransaction',
      data: { messages, chainId, signingAddress, fee, memo },
    };
    const response = await this.sendRequest(request as SignTransactionRequest);
    if (!response.data) {
      throw new Error('Signing was not successful');
    }
    return response.data as Uint8Array;
  }

  async signTransactionForOfflineAminoSigner({
    messages,
    chainId,
    signingAddress,
    fee,
    memo,
  }: {
    signingAddress: string;
    chainId: string;
    messages: EmerisTransactions.AbstractTransaction[];
    fee: {
      gas: string;
      amount: Base.Amount[];
    };
    memo?: string;
  }): Promise<AminoSignResponse> {
    const request = {
      action: 'signTransactionForOfflineAminoSigner',
      data: { messages, chainId, signingAddress, fee, memo },
    };
    const response = await this.sendRequest(request as SignTransactionRequest);
    if (!response.data) {
      throw new Error('Signing was not successful');
    }
    return response.data as AminoSignResponse;
  }

  async signAndBroadcastTransaction({
    messages,
    chainId,
    signingAddress,
    fee,
    memo,
  }: {
    signingAddress: string;
    chainId: string;
    messages: EmerisTransactions.AbstractTransaction[];
    fee: {
      gas: string;
      amount: Base.Amount[];
    };
    memo?: string;
  }): Promise<AbstractTxResult> {
    const request = {
      action: 'signAndBroadcastTransaction',
      data: { messages, chainId, signingAddress, fee, memo },
    };
    const response = await this.sendRequest(request as SignAndBroadcastTransactionRequest);
    return response.data as AbstractTxResult;
  }

  async enable(): Promise<boolean> {
    const request = {
      action: 'enable',
      data: {},
    };
    console.log('enable request', request);
    const { response } = await this.sendRequest(request as ApproveOriginRequest);
    console.log('enable response', response);
    if (!!response?.data) this.isWalletUnlocked = true;
    return response?.data as boolean;
  }

  async getCosmJsAccounts(chainId: string): Promise<any> {
    const request = {
      action: 'getCosmJsAccounts',
      data: {
        chainId, // this is the on chain Id which will be resolved in the backend
      },
    };
    const response = await this.sendRequest(request as ApproveOriginRequest);
    return response.data;
  }

  async keplrEnable(chainIds: string | string[]): Promise<boolean> {
    const request = {
      action: 'keplrEnable',
      data: { chainIds },
    };
    const response = await this.sendRequest(request as ApproveOriginRequest);
    return response.data as boolean;
  }

  async getActiveAccount(chainId: string): Promise<DisplayAccount> {
    const request = {
      action: 'getActiveAccount',
      data: { chainId },
    };
    const response = await this.sendRequest(request as ApproveOriginRequest);
    const data = response.data as {
      name: string;
      algo: string;
      pubKey: string;
      address: string;
      bech32Address: string;
    };
    return {
      ...data,
      pubKey: Uint8Array.from(Buffer.from(data.pubKey, 'hex')),
      address: Uint8Array.from(Buffer.from(data.address, 'hex')),
    };
  }

  getOfflineAminoSigner(chainId) {
    const offlineSigner = {
      chainId: undefined,
      signAmino: async (signerAddress: string, signDoc: StdSignDoc): Promise<AminoSignResponse> => {
        return this.signTransactionForOfflineAminoSigner({
          messages: signDoc.msgs.map((msg) => ({
            type: 'custom',
            data: {
              raw: msg,
            },
          })),
          chainId: signDoc.chain_id, // will be resolved in the backend
          signingAddress: signerAddress,
          fee: {
            gas: signDoc.fee.gas,
            amount: signDoc.fee.amount,
          },
          memo: signDoc.memo,
        });
      },
      getAccounts: async () => {
        return (await this.getCosmJsAccounts(chainId)).map((account) => ({
          ...account,
          pubkey: Uint8Array.from(Buffer.from(account.pubkey, 'hex')),
        }));
      },
    };
    return offlineSigner;
  }
}
