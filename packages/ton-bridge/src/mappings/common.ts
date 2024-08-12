import { type Event } from "@cosmjs/stargate";
import type { CustomChainInfo } from "@oraichain/common/build/chain-infos/types";
import fetch from "node-fetch";

export enum BRIDGE_ACTIONS {
  SEND_TO_COSMOS = "send_to_cosmos",
  SEND_TO_TON = "send_to_ton",
  ACK_SEND_TO_TON = "acknowledgment"
}

export type ParsedWasmEvent = {
  [key: string]: string;
};

export function filterAction<T>(attributes: ParsedWasmEvent[], action: BRIDGE_ACTIONS): T[] {
  return attributes.filter((attr): attr is T & ParsedWasmEvent => attr["action"] === action);
}

export function filterOutContractAddress(attributes: ParsedWasmEvent[], contract: string) {
  return attributes.filter((attr) => attr["_contract_address"] === contract);
}

export async function getWhitelistCurrencies() {
  const oraichainResponse = await fetch(
    "https://raw.githubusercontent.com/oraichain/oraichain-sdk/master/chains/Oraichain.json"
  ).then((res) => res.json());
  const oraichainMetadata = oraichainResponse as CustomChainInfo;
  return oraichainMetadata.currencies;
}

export const parseWasmEvents = (events: readonly Event[]): ParsedWasmEvent[] => {
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

export const handleError = (funcName: string, error: unknown) => {
  const errorMsg = `❌ Error ${funcName}: ${error}`;
  throw new Error(errorMsg);
};
