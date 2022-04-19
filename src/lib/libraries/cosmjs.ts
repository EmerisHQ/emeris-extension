import { AminoMsg } from '@cosmjs/amino';
import { EncodeObject } from '@cosmjs/proto-signing';
import { SigningStargateClient, StdFee } from '@cosmjs/stargate';
import EmerisSigner from '@emeris/signer';
import { Chain } from '@emeris/types/lib/EmerisAPI';
import { bech32 } from 'bech32';

import { EmerisAccount } from '@@/types';

export function chainAddressfromKeyHash(prefix: string, keyHash: string) {
  return bech32.encode(prefix, bech32.toWords(Buffer.from(keyHash, 'hex')));
}

export const getHdPath = (chainConfig: Chain, account) => {
  let hdPath = chainConfig.derivation_path;
  if (account.hdPath) {
    hdPath = chainConfig.derivation_path.split('/').slice(0, 3).concat(account.hdPath).join('/');
  }
  return hdPath;
};

const helpers = {
  getAddress: async (account: EmerisAccount, chainConfig: Chain): Promise<string> => {
    if (account.isLedger) {
      return chainAddressfromKeyHash(chainConfig.node_info.bech32_config.prefix_account, account.keyHash);
    } else {
      const signer = EmerisSigner.withMnemonic(getHdPath(chainConfig, account), account.accountMnemonic);
      return signer.getAddress(chainConfig.chain_name);
    }
  },
  getPublicKey: async (account: EmerisAccount, chainConfig: Chain): Promise<Uint8Array> => {
    const signer = EmerisSigner.withMnemonic(getHdPath(chainConfig, account), account.accountMnemonic);
    return signer.getPubkey(chainConfig.chain_name);
  },
  // bubble exceptions to show users
  async sign(
    account: EmerisAccount,
    chainConfig: Chain,
    messages: EncodeObject[] | AminoMsg[],
    fee: StdFee,
    memo: string,
  ) {
    const signer = EmerisSigner.withMnemonic(getHdPath(chainConfig, account), account.accountMnemonic);
    const broadcastable = await signer.signTx({
      msgs: messages,
      fee: {
        amount: fee.amount.map(({ amount, denom }) => ({ amount: String(amount), denom })),
        gas: String(fee.gas),
      },
      memo,
      chain_name: chainConfig.chain_name,
    });
    return broadcastable;
  },
  // bubble exceptions to show users
  async signLedger(
    account: EmerisAccount,
    chainConfig: Chain,
    messages: EncodeObject[] | AminoMsg[],
    fee: StdFee,
    memo: string,
  ) {
    const signer = EmerisSigner.withLedger(getHdPath(chainConfig, account));
    const broadcastable = await signer.signTx({
      msgs: messages,
      fee: {
        amount: fee.amount.map(({ amount, denom }) => ({ amount: String(amount), denom })),
        gas: String(fee.gas),
      },
      memo,
      chain_name: chainConfig.chain_name,
    });

    return broadcastable;
  },
  async getRawSignable(account: EmerisAccount, chainConfig: Chain, messages, fee, memo): Promise<any> {
    try {
      const signer = account.isLedger
        ? EmerisSigner.withMnemonic(
            getHdPath(chainConfig, account),
            'chunk grain pen dune horror better chase garden vital wet embark fever unlock churn exhaust jaguar owner radar hungry chronic core video milk alley', // rando key as withLedger breaks and we don't need it here
          )
        : EmerisSigner.withMnemonic(getHdPath(chainConfig, account), account.accountMnemonic);
      const rawTx = await signer.getRawTX({
        msgs: messages,
        fee,
        memo,
        chain_name: chainConfig.chain_name,
      });

      return rawTx;
    } catch (err) {
      console.error(err);
      return undefined;
    }
  },
  async broadcast(broadcastable, chainConfig: Chain) {
    try {
      const client = await SigningStargateClient.connect(chainConfig.public_node_endpoints.tendermint_rpc[0]);
      const response = await client.broadcastTx(broadcastable);
      return response; // TODO this should be a standardized abstract result not the chain response but for now doesn't matter as we only deal with cosmos
    } catch (err) {
      console.error(err);
      return undefined;
    }
  },
};
export default helpers;
