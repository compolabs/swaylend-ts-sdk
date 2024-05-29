import { Provider, Wallet } from "fuels";

import SwayLand, { BETA_CONTRACT_ADDRESSES, BETA_NETWORK } from "../src";
import { TOKENS_BY_SYMBOL } from "../tests/constants";

const provider = await Provider.create(BETA_NETWORK.url);

const TEST_PRIVATE_KEY = "";

const wallet = Wallet.fromPrivateKey(TEST_PRIVATE_KEY, provider);

const swayLand = new SwayLand({
  networkUrl: BETA_NETWORK.url,
  contractAddresses: BETA_CONTRACT_ADDRESSES,
  wallet,
});

swayLand.fetchWalletBalance(TOKENS_BY_SYMBOL["USDC"]).then(console.log);
