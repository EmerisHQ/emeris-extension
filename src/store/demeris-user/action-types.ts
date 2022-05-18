export enum ActionTypes {
  BALANCES_LOADED = 'BALANCES_LOADED',
  PRICES_LOADED = 'PRICES_LOADED',
  STAKING_BALANCES_LOADED = 'STAKING_BALANCES_LOADED',
  // Internal module actions
  RESET_STATE = 'RESET_STATE',
}
export enum GlobalActionTypes {
  /**
   * Namespace is defined in the module and should be re-used here. Not possible due to TypeScript limitation,
   * re-evaluate once this is released:
   *     https://github.com/microsoft/TypeScript/issues/40793
   */
  BALANCES_LOADED = 'demerisUSER/BALANCES_LOADED',
  PRICES_LOADED = 'demerisUSER/PRICES_LOADED',
  STAKING_BALANCES_LOADED = 'demerisUSER/STAKING_BALANCES_LOADED',
  // Internal module actions
  RESET_STATE = 'demerisUSER/RESET_STATE',
}
