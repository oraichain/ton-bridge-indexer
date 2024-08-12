import { CosmosBlock } from "@subql/types-cosmos";
import { Pool } from "../types";
import { PoolSeeds } from "./seed-pools";
import { createTokenIfNotExist, fromTokenIdToDenom } from "./token";

export async function handleInitPool(_block: CosmosBlock) {
  const pools: Pool[] = [];
  for (const poolSeed of PoolSeeds) {
    const pool = Pool.create(poolSeed);
    pools.push(pool);
    const { oraichainDenom, tonDenom } = fromTokenIdToDenom(pool.tokenId);
    logger.info(`oraichainDenom: ${oraichainDenom}, tonDenom: ${tonDenom}`);
    await createTokenIfNotExist(api, oraichainDenom, tonDenom);
  }
  await store.bulkUpdate("Pool", pools);
}
