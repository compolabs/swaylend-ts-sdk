import { Address } from "fuels";

import { MarketAbi__factory } from "./types/lend-market";
import { AddressInput } from "./types/lend-market/MarketAbi";
import { PythContractAbi__factory } from "./types/pyth";
import BN from "./utils/BN";
import { Options, UserSupplyBorrow } from "./interface";

export class ReadActions {
  fetchUserSupplyBorrow = async (
    accountAddress: string,
    options: Options,
  ): Promise<UserSupplyBorrow | null> => {
    const lendMarketFactory = MarketAbi__factory.connect(
      options.contractAddresses.lendMarket,
      options.wallet,
    );

    const addressInput: AddressInput = {
      value: new Address(accountAddress as any).toB256(),
    };

    try {
      const result = await lendMarketFactory.functions
        .get_user_supply_borrow(addressInput)
        .get();
      const supply = new BN(result.value[0].toString());
      const borrow = new BN(result.value[1].toString());

      console.log("supply", supply.toString());
      console.log("borrow", borrow.toString());

      return {
        supply: new BN(0),
        borrow: new BN(0),
      };
    } catch (err) {
      console.log(err);

      return null;
      // return { supply: BN.ZERO, borrow: BN.ZERO };
    }
  };

  fetchCollateralConfigurations = async (options: Options) => {
    const lendMarketFactory = MarketAbi__factory.connect(
      options.contractAddresses.lendMarket,
      options.wallet,
    );

    const result = await lendMarketFactory.functions
      .get_collateral_configurations()
      .get();

    return result;
  };

  fetchTotalsCollateral = async (assetId: string, options: Options) => {
    const lendMarketFactory = MarketAbi__factory.connect(
      options.contractAddresses.lendMarket,
      options.wallet,
    );

    const result = await lendMarketFactory.functions
      .totals_collateral(assetId)
      .get();

    console.log("result", result.value.toString());
    return result.value.toString();
  };

  fetchBalanceOfAsset = async (
    assetId: string,
    options: Options,
  ): Promise<string> => {
    const lendMarketFactory = MarketAbi__factory.connect(
      options.contractAddresses.lendMarket,
      options.wallet,
    );

    const result = await lendMarketFactory.functions.balance_of(assetId).get();

    return result.value.toString();
  };

  fetchReserves = async (options: Options) => {
    const lendMarketFactory = MarketAbi__factory.connect(
      options.contractAddresses.lendMarket,
      options.wallet,
    );

    const result = await lendMarketFactory.functions.get_reserves().get();

    return result.value;
  };

  fetchUserCollateral = async (
    accountAddress: string,
    assetId: string,
    options: Options,
  ) => {
    const lendMarketFactory = MarketAbi__factory.connect(
      options.contractAddresses.lendMarket,
      options.wallet,
    );
    const addressInput: AddressInput = {
      value: new Address(accountAddress as any).toB256(),
    };

    const result = await lendMarketFactory.functions
      .get_user_collateral(addressInput, assetId)
      .get();

    return result.value.toString();
  };

  fetchUtilization = async (options: Options) => {
    const lendMarketFactory = MarketAbi__factory.connect(
      options.contractAddresses.lendMarket,
      options.wallet,
    );

    const result = await lendMarketFactory.functions.get_utilization().get();

    return result.value;
  };

  fetchAvailableToBorrow = async (accountAddress: string, options: Options) => {
    const lendMarketFactory = MarketAbi__factory.connect(
      options.contractAddresses.lendMarket,
      options.wallet,
    );

    const addressInput: AddressInput = {
      value: new Address(accountAddress as any).toB256(),
    };

    const result = await lendMarketFactory.functions
      .available_to_borrow(addressInput)
      .addContracts([
        PythContractAbi__factory.connect(
          options.contractAddresses.pyth,
          options.wallet,
        ),
      ])
      .get();

    return result.value.toString();
  };

  fetchBorrowRate = async (value: string, options: Options) => {
    const lendMarketFactory = MarketAbi__factory.connect(
      options.contractAddresses.lendMarket,
      options.wallet,
    );

    const result = await lendMarketFactory.functions
      .get_borrow_rate(value)
      .get();

    return result.value.toString();
  };

  fetchSupplyRate = async (value: string, options: Options) => {
    const lendMarketFactory = MarketAbi__factory.connect(
      options.contractAddresses.lendMarket,
      options.wallet,
    );

    const result = await lendMarketFactory.functions
      .get_supply_rate(value)
      .get();

    return result.value.toString();
  };

  fetchWalletBalance = async (
    assetId: string,
    options: Options,
  ): Promise<string> => {
    const balance = await options.wallet.getBalance(assetId);
    return balance.toString();
  };
}
