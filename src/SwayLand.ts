import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";
import {
  arrayify,
  Provider,
  Wallet,
  WalletLocked,
  WalletUnlocked,
} from "fuels";

import { PythContractAbi__factory } from "./types/pyth";
import { NETWORK_ERROR, NetworkError } from "./utils/NetworkError";
import {
  BETA_CONTRACT_ADDRESSES,
  DEFAULT_GAS_LIMIT_MULTIPLIER,
  DEFAULT_GAS_PRICE,
} from "./constants";
import {
  Asset,
  Options,
  OptionsSwayLand,
  SwayLandParams,
  WriteTransactionResponse,
} from "./interface";
import { ReadActions } from "./ReadActions";
import { WriteActions } from "./WriteActions";

const PYTH_URL = "https://hermes.pyth.network";

export class SwayLand {
  private write = new WriteActions();
  private read = new ReadActions();

  private providerPromise: Promise<Provider>;
  private options: OptionsSwayLand;
  private pythServiceConnection: EvmPriceServiceConnection;

  constructor(params: SwayLandParams) {
    this.options = {
      contractAddresses: params.contractAddresses ?? BETA_CONTRACT_ADDRESSES,
      wallet: params.wallet,
      gasPrice: params.gasPrice ?? DEFAULT_GAS_PRICE,
      gasLimitMultiplier:
        params.gasLimitMultiplier ?? DEFAULT_GAS_LIMIT_MULTIPLIER,
    };

    this.providerPromise = Provider.create(params.networkUrl);

    this.pythServiceConnection = new EvmPriceServiceConnection(
      params.pythUrl ?? PYTH_URL,
      {
        logger: {
          error: console.error,
          warn: console.warn,
          info: () => undefined,
          debug: () => undefined,
          trace: () => undefined,
        },
      },
    );
  }

  setActiveWallet = (wallet?: WalletLocked | WalletUnlocked) => {
    const newOptions = { ...this.options };
    newOptions.wallet = wallet;
    this.options = newOptions;
  };

  mintToken = async (
    token: Asset,
    amount: string,
  ): Promise<WriteTransactionResponse> => {
    return this.write.mintToken(token, amount, this.getApiOptions());
  };

  fetchWalletBalance = async (asset: Asset): Promise<string> => {
    // We use getApiOptions because we need the user's wallet
    return this.read.fetchWalletBalance(asset.address, this.getApiOptions());
  };

  getProviderWallet = async () => {
    const provider = await this.providerPromise;
    return Wallet.generate({ provider });
  };

  getProvider = async () => {
    return this.providerPromise;
  };

  fetchUserSupplyBorrow = async (accountAddress: string) => {
    const options = await this.getFetchOptions();

    return this.read.fetchUserSupplyBorrow(accountAddress, options);
  };

  fetchCollateralConfigurations = async () => {
    const options = await this.getFetchOptions();

    return this.read.fetchCollateralConfigurations(options);
  };

  fetchTotalsCollateral = async (asset: Asset) => {
    const options = await this.getFetchOptions();

    return this.read.fetchTotalsCollateral(asset.address, options);
  };

  fetchBalanceOfAsset = async (asset: Asset) => {
    const options = await this.getFetchOptions();

    return this.read.fetchBalanceOfAsset(asset.address, options);
  };

  fetchReserves = async (asset: Asset) => {
    const options = await this.getFetchOptions();

    return this.read.fetchReserves(options);
  };

  fetchUserCollateral = async (accountAddress: string, asset: Asset) => {
    const options = await this.getFetchOptions();

    return this.read.fetchUserCollateral(
      accountAddress,
      asset.address,
      options,
    );
  };

  fetchUtilization = async () => {
    const options = await this.getFetchOptions();

    return this.read.fetchUtilization(options);
  };

  fetchAvailableToBorrow = async (accountAddress: string) => {
    const options = await this.getFetchOptions();

    return this.read.fetchAvailableToBorrow(accountAddress, options);
  };

  fetchBorrowRate = async (value: string) => {
    const options = await this.getFetchOptions();

    return this.read.fetchBorrowRate(value, options);
  };

  fetchSupplyRate = async (value: string) => {
    const options = await this.getFetchOptions();

    return this.read.fetchSupplyRate(value, options);
  };

  supplyBase = async (asset: Asset, amount: string) => {
    return this.write.supplyBase(asset.address, amount, this.getApiOptions());
  };

  withdrawBase = async (amount: string) => {
    return this.write.withdrawBase(amount, this.getApiOptions());
  };

  supplyCollateral = async (asset: Asset, amount: string) => {
    return this.write.supplyCollateral(
      asset.address,
      amount,
      this.getApiOptions(),
    );
  };

  withdrawCollateral = async (asset: Asset, amount: string) => {
    return this.write.withdrawCollateral(
      asset.address,
      amount,
      this.getApiOptions(),
    );
  };

  private getFetchOptions = async (): Promise<Options> => {
    const providerWallet = await this.getProviderWallet();
    const options: Options = { ...this.options, wallet: providerWallet };

    return options;
  };

  private getApiOptions = (): Options => {
    if (!this.options.wallet) {
      throw new NetworkError(NETWORK_ERROR.UNKNOWN_WALLET);
    }

    return this.options as Options;
  };

  private getPriceFeedUpdateData = async (
    feedIds: string | string[],
  ): Promise<{
    priceUpdateData: number[][];
    updateFee: unknown;
  }> => {
    const options = await this.getFetchOptions();

    const pythContract = PythContractAbi__factory.connect(
      options.contractAddresses.pyth,
      options.wallet,
    );

    const priceUpdateData =
      await this.pythServiceConnection.getPriceFeedsUpdateData(
        [feedIds].flat(),
      );

    const parsedUpdateData = priceUpdateData.map((v) =>
      Array.from(arrayify(v)),
    );

    const updateFee = await pythContract.functions
      .update_fee(parsedUpdateData)
      .get();

    return {
      priceUpdateData: parsedUpdateData,
      updateFee: updateFee.value,
    };
  };
}
