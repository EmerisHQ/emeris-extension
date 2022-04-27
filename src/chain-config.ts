import ChainConfig from '@emeris/chain-config';
import { Chain } from '@emeris/types/lib/EmerisAPI';
import { ChainLibraries } from '@emeris/types/lib/EmerisBase';
const chainConfigApi = new ChainConfig(process.env.VUE_APP_EMERIS_PROD_ENDPOINT || 'https://api.emeris.com/v1');

const chainConfig: Promise<Record<string, Chain & { library: ChainLibraries }>> = new Promise(async (resolve) => {
  const chains = await chainConfigApi.getChains();
  const chainsWithLibs = await Promise.all(
    chains
      .filter((chain) => chain.enabled)
      .map(async (chain) => {
        const lib = await chainConfigApi.getChainLibrary(chain.chain_name);
        return {
          ...chain,
          library: lib,
        };
      }),
  );
  const chainLookup = Object.fromEntries(chainsWithLibs.map((config) => [config.chain_name, config])) as Record<
    string,
    Chain & { library: ChainLibraries }
  >;
  resolve(chainLookup);
});

export default chainConfig;
