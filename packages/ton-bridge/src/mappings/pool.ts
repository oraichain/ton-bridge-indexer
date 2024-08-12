import { Mechanism, Pool } from "../types";
import { createTokenId } from "./token";

export const createPoolId = (oraichainDenom: string, tonDenom: string) => {
  return `pool-${oraichainDenom}-${tonDenom}`;
};

export const createPool = async (oraichainDenom: string, tonDenom: string, mechanism: Mechanism) => {
  let pool = await Pool.get(createPoolId(oraichainDenom, tonDenom));
  if (!pool) {
    pool = Pool.create({
      id: createPoolId(oraichainDenom, tonDenom),
      tokenId: createTokenId(oraichainDenom, tonDenom),
      mechanism: mechanism,
      tonReserve: BigInt(0),
      oraichainReserve: BigInt(0),
      volume: BigInt(0),
      relayerFee: 0n,
      tokenFee: 0n
    });
    await pool.save();
  }
  return pool;
};
