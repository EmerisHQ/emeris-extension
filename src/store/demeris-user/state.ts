export type USERState = {
  balancesFirstLoad: boolean;
  stakingBalancesFirstLoad: boolean;
  pricesFirstLoad: boolean;
};
export function getDefaultState(): USERState {
  return {
    balancesFirstLoad: true,
    stakingBalancesFirstLoad: true,
    pricesFirstLoad: true,
  };
}
