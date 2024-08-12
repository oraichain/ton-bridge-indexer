import { Event } from "@cosmjs/stargate";
import { parseWasmEvents } from "../common";
import { AMM_V3_ACTIONS, AMM_V3_CONTRACT_ADDRESS } from "../utils/constant";

export type SwapEvent = {
  action: AMM_V3_ACTIONS.SWAP;
  pool_key: string;
  sender: string;
  amount_in: string;
  amount_out: string;
  x_to_y: string;
  fee: string;
  liquidity: string;
  current_tick: string;
  sqrt_price: string;
};

export function createSwapRouteId(txHash: string, idx: number, eventIndex: number): string {
  return `${txHash}-swap-${idx}-${eventIndex}`;
}

export function createSwapId(txHash: string, idx: number): string {
  return `${txHash}-swap-${idx}`;
}

export function assertAttrSwapV3(attr: { [key: string]: string }, contract_address?: string) {
  if (!attr) {
    return false;
  }
  const ammV3 = contract_address ?? AMM_V3_CONTRACT_ADDRESS;
  return attr["action"] === AMM_V3_ACTIONS.SWAP && attr["_contract_address"] === ammV3;
}

export function extractAtomicSwapsFromEvents(event: Event, ammV3: string = AMM_V3_CONTRACT_ADDRESS): SwapEvent[] {
  const wasmAttributes = parseWasmEvents([event]);
  let swap: SwapEvent[] = [];
  for (const element of wasmAttributes) {
    if (assertAttrSwapV3(element, ammV3)) {
      swap.push(element as SwapEvent);
    }
  }
  return swap;
}
