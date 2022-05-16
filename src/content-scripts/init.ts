import { ProxyEmeris } from '@@/lib/ProxyEmeris';

export async function init(emeris: ProxyEmeris): Promise<void> {
  const {
    loaded,
    getAddress,
    getPublicKey,
    isHWWallet,
    supportedChains,
    getAccountName,
    hasWallet,
    signTransaction,
    enable,
    signAndBroadcastTransaction,
    keplrEnable,
    getOfflineAminoSigner,
    getActiveAccount,
    ready,
  } = emeris;
  window.emeris = {
    loaded,
    ready: ready.bind(emeris),
    getAddress: getAddress.bind(emeris),
    getPublicKey: getPublicKey.bind(emeris),
    isHWWallet: isHWWallet.bind(emeris),
    supportedChains: supportedChains.bind(emeris),
    signAndBroadcastTransaction: signAndBroadcastTransaction.bind(emeris),
    getAccountName: getAccountName.bind(emeris),
    hasWallet: hasWallet.bind(emeris),
    signTransaction: signTransaction.bind(emeris),
    enable: (chainIds) => {
      if (!chainIds) return enable.call(emeris);
      return keplrEnable.call(emeris, chainIds);
    },
    getOfflineSigner: getOfflineAminoSigner.bind(emeris),
    getActiveAccount: getActiveAccount.bind(emeris),
  };
}
