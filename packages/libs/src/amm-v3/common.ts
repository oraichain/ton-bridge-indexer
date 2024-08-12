import { Event } from "@cosmjs/stargate";
import type { CustomChainInfo } from "@oraichain/common/build/chain-infos/types";
import { CosmosEvent } from "@subql/types-cosmos/dist/interfaces";
import { AMM_V3_ACTIONS, AMM_V3_CONTRACT_ADDRESS } from "../utils/constant";

export type ContractAddressAttribute = {
  _contract_address: string;
};

export function filterAction<T>(
  attributes: {
    [key: string]: string;
  }[],
  action: AMM_V3_ACTIONS
): T[] {
  return attributes.filter((attr): attr is T & { [key: string]: string } => attr["action"] === action);
}

export function filterOutContractAddress(
  attributes: {
    [key: string]: string;
  }[],
  contract: string
) {
  return attributes.filter((attr) => attr["_contract_address"] === contract);
}

export async function getWhitelistCurrencies() {
  const oraichainResponse = await fetch(
    "https://raw.githubusercontent.com/oraichain/oraichain-sdk/master/chains/Oraichain.json"
  ).then((res) => res.json());
  const oraichainMetadata = oraichainResponse as CustomChainInfo;
  return oraichainMetadata.currencies;
}

export const parseWasmEvents = (
  events: readonly Event[]
): {
  [key: string]: string;
}[] => {
  const wasmEvents = events.filter((e) => e.type.startsWith("wasm"));
  const attrs = [];
  for (const wasmEvent of wasmEvents) {
    let attr;
    for (const { key, value } of wasmEvent.attributes) {
      if (key === "_contract_address") {
        if (attr) attrs.push(attr);
        attr = {};
      }
      if (!attr) {
        attr = { [key]: value };
      } else {
        attr[`${key}`] = value;
      }
    }
    attrs.push(attr);
  }
  return attrs as any;
};

export function parseEventToAmmV3Action<T>(
  event: CosmosEvent,
  action: AMM_V3_ACTIONS,
  ammV3: string = AMM_V3_CONTRACT_ADDRESS
): T[] {
  const wasmAttributes = parseWasmEvents([event.event]);
  const ammV3SwapAttr = filterOutContractAddress(wasmAttributes, ammV3);
  const createPoolEvents = filterAction<T>(ammV3SwapAttr, action);
  return createPoolEvents;
}
