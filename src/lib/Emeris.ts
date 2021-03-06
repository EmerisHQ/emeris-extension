/* eslint-disable max-lines-per-function */
/* eslint-disable max-lines */
import { AminoMsg, AminoSignResponse } from '@cosmjs/amino';
import { fromBech32 } from '@cosmjs/encoding';
import TxMapper from '@emeris/mapper';
// @ts-ignore
import adapter from '@vespaiach/axios-fetch-adapter';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import browser from 'webextension-polyfill';

import { keyHashfromAddress } from '@/utils/basic';
import { UnlockWalletError } from '@@/errors';
import { EmerisWallet } from '@@/types';
import {
  ActiveAccountRequest,
  ApproveOriginRequest,
  ExtensionRequest,
  ExtensionResponse,
  GetAccountNameRequest,
  GetAddressRequest,
  GetCosmJsAccounts,
  GetPublicKeyRequest,
  GetRawTransactionRequest,
  IsHWWalletRequest,
  RoutedInternalRequest,
  SignAndBroadcastTransactionRequest,
  SignTransactionRequest,
  SupportedChainsRequest,
} from '@@/types/api';
import { IEmeris } from '@@/types/emeris';

import chainConfig from '../chain-config';
// TODO
import EmerisStorage from './EmerisStorage';
import libs from './libraries';
import { importKey } from './libraries/encryption';

// HACK extension and mapper expect different formats, we need to decide and adjust the formats to one
const convertObjectKeys = (obj, doX) => {
  let newObj;
  if (Array.isArray(obj)) {
    newObj = [];
  } else {
    newObj = {};
  }
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      newObj[doX(key)] = convertObjectKeys(obj[key], doX);
    } else {
      newObj[doX(key)] = obj[key];
    }
  });
  return newObj;
};
const snakeToCamel = (str) =>
  str.replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''));

export class Emeris implements IEmeris {
  public loaded: boolean;
  private storage: EmerisStorage;
  private wallet: EmerisWallet;
  private selectedAccount: string;
  private popup: number;
  private cryptoKey: CryptoKey;
  private queuedRequests: Map<
    string,
    Record<'resolver', (value: ExtensionRequest | PromiseLike<ExtensionRequest>) => void>
  >;
  private pending: ExtensionRequest[] = [];
  private timeoutLock: ReturnType<typeof setTimeout>;
  private initialized;
  private initPromise;

  constructor(storage: EmerisStorage) {
    this.initialized = new Promise((resolve) => {
      this.initPromise = resolve;
    });
    this.storage = storage;
    this.init();
  }
  isInitialized() {
    return this.initialized;
  }
  async init() {
    const lastAccessed = (await browser.storage['local'].get('lastAccessed')).lastAccessed;
    if (!lastAccessed || Date.now() - lastAccessed > 300000) {
      this.clear();
      this.popup = null;
      this.queuedRequests = new Map();
    } else {
      const cryptoKeyJwk = (await browser.storage['session'].get('cryptoKey')).cryptoKey;
      this.cryptoKey = cryptoKeyJwk
        ? await crypto.subtle.importKey('jwk', cryptoKeyJwk, 'AES-GCM', true, ['encrypt', 'decrypt'])
        : null;
      this.wallet = (await browser.storage['session'].get('wallet')).wallet ?? null;
      this.pending = [];
      this.selectedAccount = (await browser.storage['session'].get('selectedAccount')).selectedAccount ?? null;
      this.loaded = true;
      this.popup = (await browser.storage['session'].get('popup')).popup ?? null;
      this.queuedRequests = new Map();
    }
    await this.storeSession();
    this.initPromise();
  }
  async storeSession(): Promise<void> {
    await browser.storage['local'].set({ lastAccessed: Date.now() });
    await browser.storage['session'].set({ wallet: this.wallet });
    await browser.storage['session'].set({
      cryptoKey: this.cryptoKey ? await crypto.subtle.exportKey('jwk', this.cryptoKey) : undefined,
    });
    await browser.storage['session'].set({ selectedAccount: this.selectedAccount });

    await browser.storage['session'].set({ popup: this.popup });
  }
  clear(): void {
    this.cryptoKey = null;
    this.wallet = null;
    this.pending = [];
    this.selectedAccount = null;
    this.loaded = true;
  }
  async unlockWallet(password: string): Promise<EmerisWallet> {
    try {
      const cryptoKey = await importKey(password);
      this.wallet = await this.storage.unlockWallet(cryptoKey);
      this.cryptoKey = cryptoKey;
      this.selectedAccount = await this.storage.getLastAccount();
      if (this.wallet.length > 0 && !this.selectedAccount) {
        this.setLastAccount(this.wallet[0].accountName);
      }
      await this.storeSession();
      return this.wallet;
    } catch (e) {
      throw new UnlockWalletError('Could not unlock wallet: ' + e);
    }
  }
  async lockWallet(): Promise<void> {
    this.clear();
    this.storeSession();
  }
  async launchPopup(): Promise<number> {
    return (
      await browser.windows.create({
        width: 375,
        height: 600,
        type: 'popup',
        url: browser.runtime.getURL('/popup.html'),
      })
    ).id;
  }
  async forwardToPopup(request: ExtensionRequest): Promise<ExtensionResponse> {
    let resolver;
    const response: Promise<ExtensionResponse> = new Promise((resolve) => {
      resolver = resolve;
    });
    this.queuedRequests.set(request.id, { resolver });
    this.pending.push(request);
    this.ensurePopup();
    await this.storeSession();
    const resp = await response;
    return resp;
  }
  getAccount() {
    return this.wallet.find((x) => x.accountName == this.selectedAccount);
  }
  async setLastAccount(accountName) {
    if (accountName) {
      try {
        await this.storage.setLastAccount(accountName);
        this.selectedAccount = accountName;
        await this.storeSession();

        // send an event to all tabs that the account has changed
        const tabs = await browser.tabs.query({});
        tabs.forEach((tab) => browser.tabs.sendMessage(tab.id, { type: 'lastAccountUpdated' }));
      } catch (e) {
        console.log(e);
      }
    }
  }
  async popupHandler(message: RoutedInternalRequest): Promise<unknown> {
    switch (message?.data.action) {
      case 'getPending':
        return this.pending ?? [];
      case 'setLastAccount':
        await this.setLastAccount(message.data.data.accountName);
        break;
      case 'getLastAccount':
        try {
          const accountName = await this.storage.getLastAccount();
          return accountName;
        } catch (e) {
          console.log(e);
        }
        break;
      case 'createAccount':
        // guard
        if (!message.data.data.account.isLedger && !message.data.data.account.accountMnemonic) {
          throw new Error('Account has no mnemonic');
        }
        await this.storage.saveAccount(message.data.data.account, this.cryptoKey);
        try {
          this.wallet = await this.storage.unlockWallet(this.cryptoKey);
          await this.setLastAccount(message.data.data.account.accountName);
          await this.storeSession();
        } catch (e) {
          console.log(e);
        }
        return this.wallet;
      case 'updateAccount':
        try {
          await this.storage.updateAccount(
            message.data.data.account,
            message.data.data.targetAccountName,
            this.cryptoKey,
          );
          this.wallet = await this.storage.unlockWallet(this.cryptoKey);
          await this.setLastAccount(message.data.data.account.accountName);
          await this.storeSession();
        } catch (e) {
          console.log(e);
        }
        return;
      case 'removeAccount':
        try {
          await this.storage.removeAccount(message.data.data.accountName, this.cryptoKey);
          if (this.selectedAccount === message.data.data.accountName) {
            this.selectedAccount === undefined;
          }
          await this.storeSession();
          return await this.storage.unlockWallet(this.cryptoKey);
        } catch (e) {
          console.log(e);
        }
        return this.wallet;
      case 'getWallet':
        return this.getDisplayAccounts();
      case 'getAddress':
        return this.getAddress(message.data);
      case 'getMnemonic':
        try {
          // ATTENTION here is is important, that the password comes from the outside to prove the user entered the password again
          const wallet = await this.unlockWallet(message.data.data.password);
          if (wallet) {
            return wallet.find((x) => x.accountName == message.data.data.accountName);
          }
        } catch (e) {
          console.log(e);
        }
        return;
      case 'createWallet':
      case 'unlockWallet':
        try {
          await this.unlockWallet(message.data.data.password);
          return await this.getDisplayAccounts();
        } catch (e) {
          console.log(e);
        }
        return;
      case 'lockWallet':
        return await this.lockWallet();
      case 'hasWallet':
        return await this.hasWallet();
      case 'getRawTransaction':
        return await this.getRawTransaction(message.data);
      case 'signTransaction':
        return await this.getTransactionSignature(message.data, message.data.data.memo);
      case 'signTransactionForOfflineAminoSigner':
        return await this.getTransactionSignatureForOfflineAminoSigner(message.data, message.data.data.memo);
      case 'setResponse':
        return this.setResponse(message.data.data.id, message.data.data);
      case 'extensionReset':
        this.storage.extensionReset();
        return;
      case 'removeWhitelistedWebsite':
        this.storage.deleteWhitelistedWebsite(this.cryptoKey, message.data.data.website);
        return;
      case 'getWhitelistedWebsite':
        return this.storage.getWhitelistedWebsites(this.cryptoKey);
      case 'addWhitelistedWebsite':
        // prevent dupes
        const whitelistedWebsites = await this.storage.getWhitelistedWebsites(this.cryptoKey);
        if (whitelistedWebsites.find((whitelistedWebsite) => whitelistedWebsite.origin === message.data.data.website))
          return true;
        return this.storage.addWhitelistedWebsite(this.cryptoKey, message.data.data.website);
      case 'setPartialAccountCreationStep':
        return this.storage.setPartialAccountCreationStep(message.data.data, this.cryptoKey);
      case 'getPartialAccountCreationStep':
        return this.storage.getPartialAccountCreationStep(this.cryptoKey);
    }
  }
  async ensurePopup(): Promise<void> {
    if (!this.popup) {
      this.popup = await this.launchPopup();
      browser.windows.update(this.popup as number, {
        focused: true,
      });
    } else {
      try {
        await browser.windows.get(this.popup as number);
        browser.runtime.sendMessage({ type: 'toPopup', data: { action: 'update' } });
      } catch (e) {
        this.popup = await this.launchPopup();
      }

      await browser.windows.update(this.popup as number, {
        focused: true,
      });
    }
  }
  async getAddress(req: GetAddressRequest): Promise<string> {
    if (!this.wallet) {
      throw new Error('No wallet configured');
    }
    const chain = (await chainConfig)[req.data.chainId];
    if (!chain) {
      throw new Error('Chain not supported: ' + req.data.chainId);
    }
    const account = this.getAccount();
    if (!account) {
      throw new Error('No account selected');
    }

    try {
      return await libs[chain.library].getAddress(account, chain);
    } catch (err) {
      console.error(err);
      throw new Error('Cant get address for chain ' + chain.chain_name);
    }
  }
  // function limits the data that we return to the view layers to not expose accidentially data
  async getDisplayAccounts() {
    if (!this.wallet) return undefined;
    return await Promise.all(
      this.wallet.map(async (account) => {
        const displayAccount = {
          accountName: account.accountName,
          isLedger: account.isLedger,
          setupState: account.setupState,
          // wrapping in a Set to make all values unique
          keyHashes: [
            ...new Set(
              (
                await Promise.all(
                  Object.values(await chainConfig).map(async (chain) => {
                    try {
                      const address = await libs[chain.library].getAddress(account, chain);
                      const keyHash = keyHashfromAddress(address);
                      return keyHash;
                    } catch (err) {
                      console.error(err);
                      return null;
                    }
                  }),
                )
              ).filter((x) => !!x),
            ),
          ],
        };
        return displayAccount;
      }),
    );
  }

  // needed in CosmJs offline signer
  async getCosmJsAccounts(req: GetCosmJsAccounts) {
    if (!this.wallet) {
      throw new Error('No wallet configured');
    }

    // cosmjs will send the on chain id not our id
    const chain = Object.values(await chainConfig).find((chain) => chain.node_info.chain_id === req.data.chainId);
    if (!chain) {
      throw new Error('Chain not supported: ' + req.data.chainId);
    }

    return [].concat(
      ...(await Promise.all(
        this.wallet.map(async (account) => {
          const address = await libs[chain.library].getAddress(account, chain);
          const pubkey = await libs[chain.library].getPublicKey(account, chain);
          return {
            address,
            algo: 'secp256k1',
            pubkey: Buffer.from(pubkey).toString('hex'),
          };
        }),
      )),
    );
  }

  async getPublicKey(req: GetPublicKeyRequest): Promise<Uint8Array> {
    if (!this.wallet) {
      throw new Error('No wallet configured');
    }
    const chain = (await chainConfig)[req.data.chainId];
    if (!chain) {
      throw new Error('Chain not supported: ' + req.data.chainId);
    }

    const account = this.getAccount();
    if (!account) {
      throw new Error('No account selected');
    }

    return await libs[chain.library].getPublicKey(account, chain);
  }
  async isPermitted(origin: string): Promise<boolean> {
    return await this.storage.isWhitelistedWebsite(this.cryptoKey, origin);
  }
  async isHWWallet(_req: IsHWWalletRequest): Promise<boolean> {
    return false;
  }
  async supportedChains(_req: SupportedChainsRequest): Promise<string[]> {
    return Object.keys(await chainConfig);
  }
  async getAccountName(_req: GetAccountNameRequest): Promise<string> {
    return this.selectedAccount;
  }
  async hasWallet(): Promise<boolean> {
    return await this.storage.hasWallet();
  }

  async signTransactionForOfflineAminoSigner(request: SignTransactionRequest): Promise<AminoSignResponse> {
    request.id = uuidv4();

    // cosmjs will send the on chain id not our id
    const chain = Object.values(await chainConfig).find((chain) => chain.node_info.chain_id === request.data.chainId);
    if (!chain) throw new Error('Could not find matching chain in Emeris');
    request.data.chainId = chain.chain_name;

    const { response: aminoSignResponse } = await this.forwardToPopup(request);
    return aminoSignResponse;
  }
  async getTransactionSigningData(request: SignTransactionRequest | GetRawTransactionRequest) {
    if (!this.wallet) {
      throw new Error('No wallet configured');
    }
    const chain = (await chainConfig)[request.data.chainId];
    if (!chain) {
      throw new Error('Chain not supported: ' + request.data.chainId);
    }

    const accountsWithAddress = [];
    await Promise.all(
      this.wallet.map(async (account) => {
        const address = await libs[chain.library].getAddress(account, chain);
        accountsWithAddress.push({
          address,
          account,
        });
      }),
    );
    const selectedAccountPair = accountsWithAddress.find(({ address }) => {
      return address === request.data.signingAddress;
    });

    if (!selectedAccountPair) {
      throw new Error('The requested signing address is not available in the extension');
    }
    const selectedAccount = selectedAccountPair.account;

    const abstractTx = {
      ...request.data,
      chainName: request.data.chainId,
      txs: request.data.messages.map((message) => {
        if (message.type === 'custom') return message;
        return convertObjectKeys(message, snakeToCamel);
      }),
    }; // HACK need to adjust transported data model
    const chainMessages = await TxMapper(abstractTx);

    return { chain, selectedAccount, chainMessages };
  }
  async getRawTransaction(request: GetRawTransactionRequest): Promise<string> {
    const { chain, selectedAccount, chainMessages } = await this.getTransactionSigningData(request);

    const signable = await libs[chain.library].getRawSignable(
      selectedAccount,
      chain,
      chainMessages,
      request.data.fee,
      request.data.memo,
    );

    return signable;
  }
  async getTransactionSignatureForOfflineAminoSigner(request: SignTransactionRequest, memo: string): Promise<string> {
    const { chain, selectedAccount, chainMessages } = await this.getTransactionSigningData(request);

    let aminoSignResponse;
    // currently not used, as we need to sign in the view part of the app
    if (selectedAccount.isLedger) {
      aminoSignResponse = await libs[chain.library].signLedgerForAminoOfflineSigner(
        selectedAccount,
        chain,
        chainMessages as AminoMsg[],
        request.data.fee,
        memo,
      );
    } else {
      aminoSignResponse = await libs[chain.library].signForAminoOfflineSigner(
        selectedAccount,
        chain,
        chainMessages as AminoMsg[],
        request.data.fee,
        memo,
      );
    }
    return aminoSignResponse;
  }
  async getTransactionSignature(request: SignTransactionRequest, memo: string): Promise<string> {
    const { chain, selectedAccount, chainMessages } = await this.getTransactionSigningData(request);

    let broadcastable;
    // currently not used, as we need to sign in the view part of the app
    if (selectedAccount.isLedger) {
      broadcastable = await libs[chain.library].signLedger(
        selectedAccount,
        chain,
        chainMessages as AminoMsg[],
        request.data.fee,
        memo,
      );
    } else {
      broadcastable = await libs[chain.library].sign(
        selectedAccount,
        chain,
        chainMessages as AminoMsg[],
        request.data.fee,
        memo,
      );
    }
    // converting the broadcastable into a string that can be converted back to a unit8array
    // might need to be adjusted if we have any other broadcastable
    return Buffer.from(broadcastable).toString('hex');
  }
  async signTransaction(request: SignTransactionRequest): Promise<any> {
    request.id = uuidv4();
    const { response: broadcastable } = await this.forwardToPopup(request);
    return broadcastable;
  }
  async signAndBroadcastTransaction(request: SignAndBroadcastTransactionRequest): Promise<any> {
    const broadcastable = await this.signTransaction({ ...request, action: 'signTransaction' });

    if (!broadcastable) throw new Error('User canceled the transactions');

    // @ts-ignore doesn't accept SignAndBroadcastTransactionRequest inheriting from SignTransactionRequest
    const response = await axios
      .post(
        (process.env.VUE_APP_EMERIS_PROD_ENDPOINT || 'https://api.emeris.com/v1') + '/tx/' + request.data.chainId,
        {
          tx_bytes: Buffer.from(broadcastable, 'hex').toString('base64'),
          // @ts-ignore doesn't accept SignAndBroadcastTransactionRequest inheriting from SignTransactionRequest
          address: request.data.signingAddress,
        },
        { adapter },
      )
      .catch((error) => {
        if (error.response) {
          const causeRegexp = /^.+, .+, (.+)/gm; // format of Cosmos SDK errors
          const cause = causeRegexp.exec(error.response.data.cause)[1];
          throw new Error('Transaction failed: ' + cause);
        } else {
          throw error;
        }
      });

    return response;
  }
  async enable(request: ApproveOriginRequest): Promise<boolean> {
    if (await this.storage.isWhitelistedWebsite(this.cryptoKey, request.origin)) {
      return true;
    }

    request.id = uuidv4();
    const enabled = (await this.forwardToPopup(request)).accept as boolean;
    if (enabled) {
      await this.storage.addWhitelistedWebsite(this.cryptoKey, request.origin);
    }
    return enabled;
  }
  setResponse(id: string, response: any) {
    const request = this.queuedRequests.get(id);
    if (!request) {
      return;
    }
    request.resolver(response);
    this.queuedRequests.delete(id);
    this.pending.splice(
      this.pending.findIndex((req) => req.id == id),
      1,
    );
    this.storeSession();

    browser.runtime.sendMessage({ type: 'toPopup', data: { action: 'update' } });
    return true;
  }
  async keplrEnable(request: ApproveOriginRequest): Promise<boolean> {
    //  TODO : need to check whether this is allowed.(to not check per-chain)
    if (await this.storage.isWhitelistedWebsite(this.cryptoKey, request.origin)) {
      return true;
    }
    request.id = uuidv4();
    const chainIds = request.data.chainIds;
    const chainConfigLookup = await chainConfig;
    if (typeof chainIds === 'string') {
      Object.values(chainConfigLookup).forEach((config) => {
        if (config.node_info.chain_id !== chainIds) {
          return false;
        }
      });
    } else if (Array.isArray(chainIds)) {
      chainIds.forEach((chainId) => {
        Object.values(chainConfigLookup).forEach((config) => {
          if (config.node_info.chain_id !== chainId) {
            return false;
          }
        });
      });
    } else {
      return false;
    }
    const enabled = (await this.forwardToPopup(request)).accept as boolean;
    if (enabled) {
      await this.storage.addWhitelistedWebsite(this.cryptoKey, request.origin);
    }
    return enabled;
  }

  async getActiveAccount(request: ActiveAccountRequest): Promise<{
    readonly name: string;
    readonly algo: string;
    readonly pubKey: string; // hex encoded Uint8Array
    readonly address: string; // hex encoded Uint8Array
    readonly bech32Address: string;
  }> {
    // find chain based on chain ID
    const chain = Object.values(await chainConfig).find((config) => config.node_info.chain_id == request.data.chainId);
    if (!chain) {
      throw new Error('Chain not supported: ' + request.data.chainId);
    }

    const account = this.getAccount();
    if (!account) {
      throw new Error('No account selected');
    }

    const name = this.selectedAccount;
    const pubKey = await libs[chain.library].getPublicKey(account, chain);
    const bech32Address = await libs[chain.library].getAddress(account, chain);
    const address = fromBech32(bech32Address).data;
    return {
      name,
      algo: 'secp256k1',
      pubKey: Buffer.from(pubKey).toString('hex'),
      address: Buffer.from(address).toString('hex'),
      bech32Address,
    };
  }
}
