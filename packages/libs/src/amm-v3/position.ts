import { AMM_V3_ACTIONS } from "../utils";
import { ContractAddressAttribute } from "./common";

export type CreatePositionEvent = ContractAddressAttribute & {
  action: AMM_V3_ACTIONS.CREATE_POSITION;
  pool_key: string;
  token_id: string;
  owner: string;
  liquidity: string;
  lower_tick: string;
  upper_tick: string;
  current_sqrt_price: string;
  amount_x: string;
  amount_y: string;
};

export type RemovePositionEvent = ContractAddressAttribute & {
  action: AMM_V3_ACTIONS.REMOVE_POSITION;
  owner: string;
  pool_key: string;
  position_token_id: string;
  liquidity: string;
};

export const buildPositionId = (poolId: string, positionIndex: string) => {
  return poolId + "-" + positionIndex;
};
