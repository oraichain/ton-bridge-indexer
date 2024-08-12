import { CosmosEvent } from "@subql/types-cosmos";
import { AMM_V3_ACTIONS } from "../utils/constant";
import { ContractAddressAttribute, parseEventToAmmV3Action } from "./common";

export type ClaimFeeEvent = ContractAddressAttribute & {
  action: AMM_V3_ACTIONS.CLAIM_FEE;
  owner: string;
  pool_key: string;
  position_token_id: string;
  amount_x: string;
  amount_y: string;
  incentives_token_address: string;
  incentives_amount: string;
};

export function createClaimFeeId(txHash: string, positionId: string): string {
  return `${txHash}-claimFee-${positionId}`;
}

export function extractClaimFeeEvent(event: CosmosEvent, ammV3: string) {
  return parseEventToAmmV3Action<ClaimFeeEvent>(event, AMM_V3_ACTIONS.CLAIM_FEE, ammV3);
}

export function parseIncentivesAttr(incentives: string) {
  return incentives.split(",");
}

export function parseIncentiveReward(incentive: string) {
  return incentive.split(",");
}

export function createClaimFeeIncentiveTokenId(claimFeeId: string, incentiveToken: string) {
  return `${claimFeeId}-${incentiveToken}`;
}
