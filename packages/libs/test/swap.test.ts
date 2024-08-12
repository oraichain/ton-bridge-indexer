import { Event } from "@cosmjs/stargate";
import { extractAtomicSwapsFromEvents } from "../src/amm-v3/swap";
import { AMM_V3_ACTIONS, AMM_V3_CONTRACT_ADDRESS } from "../src/utils/constant";

describe("extractAtomicSwapsFromEvents", () => {
  it("should extract atomic swaps correctly", () => {
    const mockEvent: Event = {
      type: "wasm",
      attributes: [
        { key: "_contract_address", value: AMM_V3_CONTRACT_ADDRESS },
        { key: "action", value: AMM_V3_ACTIONS.SWAP },
        { key: "pool_key", value: "pool1" },
        { key: "sender", value: "sender1" },
        { key: "amount_in", value: "100" },
        { key: "amount_out", value: "90" },
        { key: "x_to_y", value: "true" },
        { key: "fee", value: "10" }
      ]
    };

    const expectedOutput: any[] = [
      {
        _contract_address: AMM_V3_CONTRACT_ADDRESS,
        action: AMM_V3_ACTIONS.SWAP,
        pool_key: "pool1",
        sender: "sender1",
        amount_in: "100",
        amount_out: "90",
        x_to_y: "true",
        fee: "10"
      }
    ];

    const result = extractAtomicSwapsFromEvents(mockEvent);
    expect(result).toEqual(expectedOutput);
  });

  it("should return an empty array if no swaps are found", () => {
    const mockEvent: Event = {
      type: "wasm",
      attributes: [
        { key: "_contract_address", value: "other_address" },
        { key: "action", value: "other_action" }
      ]
    };
    const result = extractAtomicSwapsFromEvents(mockEvent);
    expect(result).toEqual([]);
  });

  it("should handle events with complex attributes", () => {
    const mockEvent: Event = {
      type: "wasm",
      attributes: [
        { key: "_contract_address", value: AMM_V3_CONTRACT_ADDRESS },
        { key: "action", value: AMM_V3_ACTIONS.SWAP },
        { key: "pool_key", value: "pool1" },
        { key: "sender", value: "sender1" },
        { key: "amount_in", value: "100" },
        { key: "amount_out", value: "90" },
        { key: "x_to_y", value: "true" },
        { key: "fee", value: "10" },
        { key: "extra_info", value: JSON.stringify({ foo: "bar", baz: [1, 2, 3] }) },
        { key: "_contract_address", value: AMM_V3_CONTRACT_ADDRESS },
        { key: "action", value: AMM_V3_ACTIONS.REMOVE_POSITION },
        { key: "_contract_address", value: AMM_V3_CONTRACT_ADDRESS },
        { key: "action", value: AMM_V3_ACTIONS.REMOVE_POSITION },
        { key: "_contract_address", value: AMM_V3_CONTRACT_ADDRESS },
        { key: "action", value: AMM_V3_ACTIONS.SWAP },
        { key: "pool_key", value: "pool1" },
        { key: "sender", value: "sender1" },
        { key: "amount_in", value: "100" },
        { key: "amount_out", value: "90" },
        { key: "x_to_y", value: "true" },
        { key: "fee", value: "10" },
        { key: "extra_info", value: JSON.stringify({ foo: "bar", baz: [1, 2, 3] }) },
        { key: "_contract_address", value: AMM_V3_CONTRACT_ADDRESS },
        { key: "action", value: AMM_V3_ACTIONS.REMOVE_POSITION },
        { key: "_contract_address", value: AMM_V3_CONTRACT_ADDRESS },
        { key: "action", value: AMM_V3_ACTIONS.CREATE_POOL },
        { key: "_contract_address", value: AMM_V3_CONTRACT_ADDRESS },
        { key: "action", value: AMM_V3_ACTIONS.CREATE_POSITION },
        { key: "_contract_address", value: AMM_V3_CONTRACT_ADDRESS },
        { key: "action", value: AMM_V3_ACTIONS.SWAP },
        { key: "pool_key", value: "pool1" },
        { key: "sender", value: "sender1" },
        { key: "amount_in", value: "100" },
        { key: "amount_out", value: "90" },
        { key: "x_to_y", value: "true" },
        { key: "fee", value: "10" },
        { key: "extra_info", value: JSON.stringify({ foo: "bar", baz: [1, 2, 3] }) },
        { key: "_contract_address", value: AMM_V3_CONTRACT_ADDRESS },
        { key: "action", value: AMM_V3_ACTIONS.REMOVE_POSITION },
        { key: "_contract_address", value: AMM_V3_CONTRACT_ADDRESS },
        { key: "action", value: AMM_V3_ACTIONS.SWAP },
        { key: "pool_key", value: "pool1" },
        { key: "sender", value: "sender1" },
        { key: "amount_in", value: "100" },
        { key: "amount_out", value: "90" },
        { key: "x_to_y", value: "true" },
        { key: "fee", value: "10" },
        { key: "extra_info", value: JSON.stringify({ foo: "bar", baz: [1, 2, 3] }) }
      ]
    };

    const expectedOutput: any[] = [
      {
        _contract_address: "orai10s0c75gw5y5eftms5ncfknw6lzmx0dyhedn75uz793m8zwz4g8zq4d9x9a",
        action: "swap",
        pool_key: "pool1",
        sender: "sender1",
        amount_in: "100",
        amount_out: "90",
        x_to_y: "true",
        fee: "10",
        extra_info: '{"foo":"bar","baz":[1,2,3]}'
      },
      {
        _contract_address: "orai10s0c75gw5y5eftms5ncfknw6lzmx0dyhedn75uz793m8zwz4g8zq4d9x9a",
        action: "swap",
        pool_key: "pool1",
        sender: "sender1",
        amount_in: "100",
        amount_out: "90",
        x_to_y: "true",
        fee: "10",
        extra_info: '{"foo":"bar","baz":[1,2,3]}'
      },
      {
        _contract_address: "orai10s0c75gw5y5eftms5ncfknw6lzmx0dyhedn75uz793m8zwz4g8zq4d9x9a",
        action: "swap",
        pool_key: "pool1",
        sender: "sender1",
        amount_in: "100",
        amount_out: "90",
        x_to_y: "true",
        fee: "10",
        extra_info: '{"foo":"bar","baz":[1,2,3]}'
      },
      {
        _contract_address: "orai10s0c75gw5y5eftms5ncfknw6lzmx0dyhedn75uz793m8zwz4g8zq4d9x9a",
        action: "swap",
        pool_key: "pool1",
        sender: "sender1",
        amount_in: "100",
        amount_out: "90",
        x_to_y: "true",
        fee: "10",
        extra_info: '{"foo":"bar","baz":[1,2,3]}'
      }
    ];

    const result = extractAtomicSwapsFromEvents(mockEvent);
    expect(result).toEqual(expectedOutput);
  });
});
