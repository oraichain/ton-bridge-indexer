import { OraiswapTokenQueryClient } from "@oraichain/oraidex-contracts-sdk";
import { CosmWasmSafeClient } from "@subql/types-cosmos";
import { Token } from "../types";
import { getWhitelistCurrencies, handleError } from "./common";

export const getCW20Metadata = async (client: CosmWasmSafeClient, denom: string) => {
  const tokenQueryClient = new OraiswapTokenQueryClient(client as any, denom);
  const token = await tokenQueryClient.tokenInfo();
  return token;
};

const isNativeToken = (denom: string) => {
  if (denom.startsWith("orai1")) {
    return false;
  }
  return true;
};

export const createTokenId = (oraichainDenom: string, tonDenom: string) => {
  return `${oraichainDenom}-${tonDenom}`;
};

export const fromTokenIdToDenom = (tokenId: string) => {
  const [oraichainDenom, tonDenom] = tokenId.split("-");
  return { oraichainDenom, tonDenom };
};

export const createTokenIfNotExist = async (client: CosmWasmSafeClient, oraichainDenom: string, tonDenom: string) => {
  let token = await Token.get(createTokenId(oraichainDenom, tonDenom));
  logger.info(`token` + JSON.stringify(token));
  if (!token) {
    token = await buildToken(client, oraichainDenom, tonDenom);
    logger.info(`Create token` + JSON.stringify(token));
    await token.save().catch((e) => handleError("createTokenIfNotExist", e));
  }
  return token;
};

export const buildToken = async (client: CosmWasmSafeClient, oraichainDenom: string, tonDenom: string) => {
  let cw20Metadata;
  const whitelistCurrencies = await getWhitelistCurrencies();
  const currency = whitelistCurrencies.find(
    (currencies) => currencies.coinMinimalDenom === oraichainDenom || currencies.contractAddress === oraichainDenom
  );
  if (!isNativeToken(oraichainDenom)) {
    cw20Metadata = await getCW20Metadata(client, oraichainDenom);
  }
  const token = Token.create({
    id: createTokenId(oraichainDenom, tonDenom),
    symbol: currency?.coinDenom ?? cw20Metadata?.symbol ?? "",
    name: currency?.coinMinimalDenom ?? cw20Metadata?.name ?? "",
    decimals: currency?.coinDecimals ?? cw20Metadata?.decimals ?? 0,
    tonDenom,
    oraichainDenom
  });
  return token;
};
