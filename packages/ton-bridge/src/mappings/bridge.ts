import { CosmosEvent } from "@subql/types-cosmos";
import { Account, Bridge, BridgeStatus, Direction, Mechanism, Network, Pool, Token } from "../types";
import { BRIDGE_ACTIONS, filterAction, filterOutContractAddress, handleError, parseWasmEvents } from "./common";
import { BRIDGE_ADDRESS } from "./constant";
import { createPoolId } from "./pool";
import { createTransactionIfNotExist } from "./transaction";

export type SendToCosmosEvent = {
  action: BRIDGE_ACTIONS.SEND_TO_COSMOS;
  seq: string;
  opcode_packet: string;
  remote_amount: string;
  timeout_timestamp: string;
  recipient: string;
  remote_denom: string;
  remote_sender: string;
  ack: string;
  ack_value: string;
  local_amount: string;
  relayer_fee: string;
  token_fee: string;
};

export type SendToTonEvent = {
  action: BRIDGE_ACTIONS.SEND_TO_TON;
  opcode_packet: string;
  local_sender: string;
  remote_receiver: string;
  remote_denom: string;
  local_amount: string;
  token_origin: string;
  relayer_fee: string;
  token_fee: string;
  timeout_timestamp: string;
  remote_amount: string;
  seq: string;
};

export type AckSendToTonEvent = {
  action: BRIDGE_ACTIONS.ACK_SEND_TO_TON;
  seq: string;
  status: string;
};

const createBridgeId = (direction: Direction, tokenId: string, seq: string) => {
  return `${tokenId}-${direction}-${seq}`;
};

const numberToStatus: Record<string, BridgeStatus> = {
  "0": BridgeStatus.SUCCESS,
  "1": BridgeStatus.FAILED,
  "2": BridgeStatus.TIMEOUT
};

type AggregatedBridgeData = {
  reserveChange: bigint;
  volume: bigint;
  relayerFee: bigint;
  tokenFee: bigint;
};

export async function handleSendToCosmos(event: CosmosEvent) {
  try {
    const { id: transactionId } = await createTransactionIfNotExist(event);
    const wasmAttr = parseWasmEvents(event.event as any);
    const bridgeAttr = filterOutContractAddress(wasmAttr, BRIDGE_ADDRESS);
    const sendToCosmosEvents = filterAction<SendToCosmosEvent>(bridgeAttr, BRIDGE_ACTIONS.SEND_TO_COSMOS);
    const accounts: Account[] = [];
    const bridges: Bridge[] = [];
    for (const sendToCosmosEvent of sendToCosmosEvents) {
      const queryResult = await Token.getByTonDenom(sendToCosmosEvent.remote_denom);
      if (queryResult?.length === 0 || !queryResult) {
        throw new Error(`Token with denom ${sendToCosmosEvent.remote_denom} not found`);
      }
      const token = queryResult[0];
      const tonAccount = Account.create({
        id: sendToCosmosEvent.remote_sender,
        address: sendToCosmosEvent.remote_sender,
        type: Network.TON
      });
      const cosmosAccount = Account.create({
        id: sendToCosmosEvent.recipient,
        address: sendToCosmosEvent.recipient,
        type: Network.ORAI
      });
      const bridge = Bridge.create({
        id: createBridgeId(Direction.TON_TO_ORAI, token?.id, sendToCosmosEvent.seq),
        seq: BigInt(sendToCosmosEvent.seq),
        poolId: createPoolId(token.oraichainDenom, token.tonDenom),
        direction: Direction.TON_TO_ORAI,
        srcSenderId: sendToCosmosEvent.remote_sender,
        destAddressId: sendToCosmosEvent.recipient,
        amount: BigInt(sendToCosmosEvent.local_amount),
        status: numberToStatus[sendToCosmosEvent.ack],
        relayerFee: BigInt(sendToCosmosEvent.relayer_fee),
        tokenFee: BigInt(sendToCosmosEvent.token_fee),
        transactionId
      });
      bridges.push(bridge);
      accounts.push(tonAccount, cosmosAccount);
    }
    const poolIdToBridge = bridges.reduce((acc, bridge) => {
      if (!acc[bridge.poolId]) {
        acc[bridge.poolId] = {
          reserveChange: BigInt(0),
          volume: BigInt(0),
          relayerFee: BigInt(0),
          tokenFee: BigInt(0)
        };
      }
      if (bridge.status === BridgeStatus.SUCCESS) {
        acc[bridge.poolId].reserveChange += bridge.amount;
      }
      acc[bridge.poolId].volume += bridge.amount;
      acc[bridge.poolId].relayerFee += BigInt(bridge.relayerFee);
      acc[bridge.poolId].tokenFee += BigInt(bridge.tokenFee);
      return acc;
    }, {} as Record<string, AggregatedBridgeData>);

    const pools = await Pool.getByFields([["id", "in", Object.keys(poolIdToBridge)]]);
    const updatedPools = pools.map((pool) => {
      const data = poolIdToBridge[pool.id];
      if (pool.mechanism === Mechanism.LOCK_UNLOCK) {
        pool.oraichainReserve -= data.reserveChange;
      }
      pool.tonReserve += data.reserveChange;
      pool.volume += data.volume;
      pool.relayerFee += data.relayerFee;
      pool.tokenFee += data.tokenFee;
      return pool;
    });

    await Promise.all([
      store.bulkUpdate("Account", accounts),
      store.bulkUpdate("Bridge", bridges),
      store.bulkUpdate("Pool", updatedPools)
    ]);
  } catch (e) {
    logger.error("handleSendToCosmos" + JSON.stringify(e));
  }
}

export async function handleSendToTon(event: CosmosEvent) {
  try {
    const { id: transactionId } = await createTransactionIfNotExist(event);
    const wasmAttr = parseWasmEvents(event.event as any);
    const bridgeAttr = filterOutContractAddress(wasmAttr, BRIDGE_ADDRESS);
    const sendToTonEvents = filterAction<SendToTonEvent>(bridgeAttr, BRIDGE_ACTIONS.SEND_TO_COSMOS);
    const accounts: Account[] = [];
    const bridges: Bridge[] = [];
    for (const sendToTonEvent of sendToTonEvents) {
      const queryResult = await Token.getByTonDenom(sendToTonEvent.remote_denom);
      if (!queryResult || queryResult.length === 0) {
        throw new Error(`Token with denom ${sendToTonEvent.remote_denom} not found`);
      }
      const token = queryResult[0];
      const tonAccount = Account.create({
        id: sendToTonEvent.remote_receiver,
        address: sendToTonEvent.remote_receiver,
        type: Network.TON
      });
      const cosmosAccount = Account.create({
        id: sendToTonEvent.local_sender,
        address: sendToTonEvent.local_sender,
        type: Network.ORAI
      });
      const bridge = Bridge.create({
        id: createBridgeId(Direction.TON_TO_ORAI, token?.id, sendToTonEvent.seq),
        seq: BigInt(sendToTonEvent.seq),
        poolId: createPoolId(token.oraichainDenom, token.tonDenom),
        direction: Direction.TON_TO_ORAI,
        srcSenderId: sendToTonEvent.local_sender,
        destAddressId: sendToTonEvent.remote_receiver,
        amount: BigInt(sendToTonEvent.remote_amount),
        status: BridgeStatus.PENDING,
        relayerFee: BigInt(sendToTonEvent.relayer_fee),
        tokenFee: BigInt(sendToTonEvent.token_fee),
        transactionId
      });
      bridges.push(bridge);
      accounts.push(tonAccount, cosmosAccount);
    }
    const poolIdToBridge = bridges.reduce((acc, bridge) => {
      if (!acc[bridge.poolId]) {
        acc[bridge.poolId] = {
          reserveChange: BigInt(0),
          volume: BigInt(0),
          relayerFee: BigInt(0),
          tokenFee: BigInt(0)
        };
      }
      acc[bridge.poolId].reserveChange += bridge.amount;
      acc[bridge.poolId].volume += bridge.amount;
      acc[bridge.poolId].relayerFee += BigInt(bridge.relayerFee);
      acc[bridge.poolId].tokenFee += BigInt(bridge.tokenFee);
      return acc;
    }, {} as Record<string, AggregatedBridgeData>);
    const pools = await Pool.getByFields([["id", "in", Object.keys(poolIdToBridge)]]);
    const updatedPools = pools.map((pool) => {
      const data = poolIdToBridge[pool.id];
      if (pool.mechanism === Mechanism.LOCK_UNLOCK) {
        pool.oraichainReserve += data.reserveChange;
      }
      pool.volume += data.volume;
      pool.relayerFee += data.relayerFee;
      pool.tokenFee += data.tokenFee;
      return pool;
    });
    await Promise.all([
      store.bulkUpdate("Account", accounts),
      store.bulkUpdate("Bridge", bridges),
      store.bulkUpdate("Pool", updatedPools)
    ]);
  } catch (e) {
    handleError("handleSendToTon", e);
  }
}

export async function handleAckSendToTon(event: CosmosEvent) {
  try {
    const wasmAttr = parseWasmEvents(event.event as any);
    const bridgeAttr = filterOutContractAddress(wasmAttr, BRIDGE_ADDRESS);
    const allAckSendToTon = filterAction<AckSendToTonEvent>(bridgeAttr, BRIDGE_ACTIONS.ACK_SEND_TO_TON);
    const bridges: Bridge[] = [];
    for (const ackSendToTon of allAckSendToTon) {
      const allResult = await Bridge.getByFields([
        ["seq", "=", ackSendToTon.seq.toString()],
        ["direction", "=", Direction.ORAI_TO_TON]
      ]);
      if (allResult.length === 0) {
        // throw new Error(`Bridge with seq ${ackSendToTon.seq} not found`);
        continue;
      }
      const bridge = allResult[0];

      const updatedBridge = Bridge.create({
        ...bridge,
        status: numberToStatus[ackSendToTon.status]
      });
      bridges.push(updatedBridge);
    }
    const poolIdToBridge = bridges.reduce((acc, bridge) => {
      if (!acc[bridge.poolId]) {
        acc[bridge.poolId] = {
          reserveChange: BigInt(0),
          volume: BigInt(0),
          relayerFee: BigInt(0),
          tokenFee: BigInt(0)
        };
      }
      if (bridge.status === BridgeStatus.SUCCESS) {
        acc[bridge.poolId].reserveChange += bridge.amount;
      } else {
        acc[bridge.poolId].reserveChange -= bridge.amount;
      }
      return acc;
    }, {} as Record<string, AggregatedBridgeData>);

    const pools = await Pool.getByFields([["id", "in", Object.keys(poolIdToBridge)]]);
    const updatedPools = pools.map((pool) => {
      const data = poolIdToBridge[pool.id];
      if (data.reserveChange < BigInt(0) && pool.mechanism === Mechanism.LOCK_UNLOCK) {
        // refund to user
        pool.oraichainReserve += data.reserveChange;
      } else {
        pool.tonReserve -= data.reserveChange;
      }
      return pool;
    });
    await store.bulkUpdate("Pool", updatedPools);
    return;
  } catch (e) {
    handleError("handleAckSendToTon", e);
  }
}
