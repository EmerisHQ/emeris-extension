// import { ChainDetails } from './types';
import ChainConfig from '@emeris/chain-config';
import { Chain } from '@emeris/types/lib/EmerisAPI';
import { ChainLibraries } from '@emeris/types/lib/EmerisBase';
const chainConfigApi = new ChainConfig(process.env.VUE_APP_EMERIS_PROD_ENDPOINT || 'https://api.emeris.com/v1');

const chainConfig: Promise<
  (Chain & {
    library: ChainLibraries;
  })[]
> = new Promise(async (resolve) => {
  const chains = await chainConfigApi.getChains();
  resolve(
    await Promise.all(
      chains
        .filter((chain) => chain.enabled)
        .map(async (chain) => {
          const lib = await chainConfigApi.getChainLibrary(chain.chain_name);
          return {
            ...chain,
            library: lib,
          };
        }),
    ),
  );
});

// const chainConfigList = [
//   {
//     library: 'CosmJS',
//     HDPath: "m/44'/118'/0'/0/0",
//     prefix: 'cosmos',
//     rpcEndpoint: 'https://rpc.cosmos.network:443',
//     chainId: 'cosmoshub-4',
//     chainName: 'cosmos-hub',
//   },
// ];
// const chainConfig = Object.fromEntries(chainConfigList.map((config) => [config.chainName, config])) as Record<
//   string,
//   ChainDetails
// >;
export default chainConfig;
