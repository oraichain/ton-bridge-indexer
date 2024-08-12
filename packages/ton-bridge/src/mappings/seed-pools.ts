import { Mechanism } from "../types";
import { PoolProps } from "../types/models/Pool";

export const PoolSeeds: PoolProps[] = [
  {
    id: "pool-factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/ton-ton",
    mechanism: Mechanism.MINT_BURN,
    tokenId: "factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/ton-ton",
    tonReserve: 7527000000000n,
    oraichainReserve: 0n,
    volume: 0n,
    relayerFee: 0n,
    tokenFee: 0n
  },
  {
    id: "pool-orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh-EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
    mechanism: Mechanism.LOCK_UNLOCK,
    tokenId: "orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh-EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
    tonReserve: 1904000000n,
    oraichainReserve: 1904000000n,
    volume: 0n,
    relayerFee: 0n,
    tokenFee: 0n
  }
];
