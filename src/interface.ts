import { WalletLocked, WalletUnlocked } from "fuels";

import BN from "./utils/BN";

export type MarketStatusOutput = "Opened" | "Paused" | "Closed";

export interface Contracts {
  tokenFactory: string;
  pyth: string;
  lendMarket: string;
}

export interface Asset {
  address: string;
  symbol: string;
  decimals: number;
}

interface BaseOptions {
  contractAddresses: Contracts;
  gasPrice: string;
  gasLimitMultiplier: string;
}

export interface Options extends BaseOptions {
  wallet: WalletLocked | WalletUnlocked;
}

export interface OptionsSwayLand extends BaseOptions {
  wallet?: WalletLocked | WalletUnlocked;
}

export interface SwayLandParams {
  networkUrl: string;
  contractAddresses?: Contracts;
  wallet?: WalletLocked | WalletUnlocked;
  gasPrice?: string;
  gasLimitMultiplier?: string;
  pythUrl?: string;
}

export type WriteTransactionResponse = {
  transactionId: string;
  value: unknown;
};

export type UserSupplyBorrow = {
  supply: BN;
  borrow: BN;
};
