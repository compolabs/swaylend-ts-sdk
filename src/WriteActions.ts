import { hashMessage } from "fuels";
import { CoinQuantityLike, FunctionInvocationScope } from "fuels";

import { MarketAbi__factory } from "./types/lend-market";
import { PythContractAbi__factory } from "./types/pyth";
import { TokenAbi__factory } from "./types/src-20";
import { IdentityInput } from "./types/src-20/TokenAbi";
import BN from "./utils/BN";
import { Asset, Options, WriteTransactionResponse } from "./interface";

export class WriteActions {
  supplyBase = async (
    assetAddress: string,
    amount: string,
    options: Options,
  ): Promise<WriteTransactionResponse> => {
    const lendMarketFactory = MarketAbi__factory.connect(
      options.contractAddresses.lendMarket,
      options.wallet,
    );

    const forward: CoinQuantityLike = {
      amount: amount,
      assetId: assetAddress,
    };

    const tx = await lendMarketFactory.functions
      .supply_base()
      .callParams({ forward })
      .txParams({ gasPrice: options.gasPrice });

    return this.sendTransaction(tx, options);
  };

  withdrawBase = async (tokenAmount: string, options: Options) => {
    const lendMarketFactory = MarketAbi__factory.connect(
      options.contractAddresses.lendMarket,
      options.wallet,
    );

    const tx = await lendMarketFactory.functions
      .withdraw_base(tokenAmount)
      .txParams({ gasPrice: options.gasPrice });

    return this.sendTransaction(tx, options);
  };

  supplyCollateral = async (
    assetAddress: string,
    tokenAmount: string,
    options: Options,
  ) => {
    const lendMarketFactory = MarketAbi__factory.connect(
      options.contractAddresses.lendMarket,
      options.wallet,
    );

    const forward: CoinQuantityLike = {
      amount: tokenAmount,
      assetId: assetAddress,
    };

    const tx = await lendMarketFactory.functions
      .supply_collateral()
      .callParams({ forward })
      .txParams({ gasPrice: options.gasPrice });

    return this.sendTransaction(tx, options);
  };

  withdrawCollateral = async (
    assetAddress: string,
    amount: string,
    options: Options,
  ) => {
    const lendMarketFactory = MarketAbi__factory.connect(
      options.contractAddresses.lendMarket,
      options.wallet,
    );

    const tx = await lendMarketFactory.functions
      .withdraw_collateral(assetAddress, amount)
      .txParams({ gasPrice: options.gasPrice })
      .addContracts([
        PythContractAbi__factory.connect(
          options.contractAddresses.pyth,
          options.wallet,
        ),
      ]);

    return this.sendTransaction(tx, options);
  };

  mintToken = async (
    token: Asset,
    amount: string,
    options: Options,
  ): Promise<WriteTransactionResponse> => {
    const tokenFactory = options.contractAddresses.tokenFactory;
    const tokenFactoryContract = TokenAbi__factory.connect(
      tokenFactory,
      options.wallet,
    );

    const mintAmount = BN.parseUnits(amount, token.decimals);
    const hash = hashMessage(token.symbol);
    const identity: IdentityInput = {
      Address: {
        value: options.wallet.address.toB256(),
      },
    };

    const tx = await tokenFactoryContract.functions
      .mint(identity, hash, mintAmount.toString())
      .txParams({ gasPrice: options.gasPrice });

    return this.sendTransaction(tx, options);
  };

  private sendTransaction = async (
    tx: FunctionInvocationScope,
    options: Options,
  ): Promise<WriteTransactionResponse> => {
    const { gasUsed } = await tx.getTransactionCost();
    const gasLimit = gasUsed.mul(options.gasLimitMultiplier).toString();
    const res = await tx.txParams({ gasLimit }).call();

    return {
      transactionId: res.transactionId,
      value: res.value,
    };
  };
}
