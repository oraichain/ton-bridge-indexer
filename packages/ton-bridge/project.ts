import { CosmosDatasourceKind, CosmosHandlerKind, CosmosProject } from "@subql/types-cosmos";
import { BRIDGE_ACTIONS } from "./src/mappings/common";
import { BRIDGE_ADDRESS } from "./src/mappings/constant";

// Can expand the Datasource processor types via the generic param
const project: CosmosProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "oraichain-starter",
  description:
    "This project can be use as a starting point for developing your Cosmos oraichain based SubQuery project",
  runner: {
    node: {
      name: "@subql/node-cosmos",
      version: ">=3.0.0"
    },
    query: {
      name: "@subql/query",
      version: "*"
    }
  },
  schema: {
    file: "./schema.graphql"
  },
  network: {
    /* The unique chainID of the Cosmos Zone */
    chainId: "Oraichain",
    /**
     * These endpoint(s) should be public non-pruned archive node
     * We recommend providing more than one endpoint for improved reliability, performance, and uptime
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     * If you use a rate limited endpoint, adjust the --batch-size and --workers parameters
     * These settings can be found in your docker-compose.yaml, they will slow indexing but prevent your project being rate limited
     */
    endpoint: ["https://rpc.orai.io"],
    // bypassBlocks: ["28340890-28565792"],
    chaintypes: new Map([])
  },
  dataSources: [
    {
      kind: CosmosDatasourceKind.Runtime,
      startBlock: 29134794,
      endBlock: 29134794,
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            handler: "handleInitPool",
            kind: CosmosHandlerKind.Block
          }
        ]
      }
    },
    {
      kind: CosmosDatasourceKind.Runtime,
      startBlock: 29134795,
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            handler: "handleSendToTon",
            kind: CosmosHandlerKind.Event,
            filter: {
              type: "wasm",
              messageFilter: {
                type: "/cosmwasm.wasm.v1.MsgExecuteContract"
              },
              attributes: {
                _contract_address: BRIDGE_ADDRESS,
                action: BRIDGE_ACTIONS.SEND_TO_TON
              }
            }
          },
          {
            handler: "handleSendToCosmos",
            kind: CosmosHandlerKind.Event,
            filter: {
              type: "wasm",
              messageFilter: {
                type: "/cosmwasm.wasm.v1.MsgExecuteContract"
              },
              attributes: {
                _contract_address: BRIDGE_ADDRESS,
                action: BRIDGE_ACTIONS.SEND_TO_COSMOS
              }
            }
          },
          {
            handler: "handleAckSendToTon",
            kind: CosmosHandlerKind.Event,
            filter: {
              type: "wasm",
              messageFilter: {
                type: "/cosmwasm.wasm.v1.MsgExecuteContract"
              },
              attributes: {
                _contract_address: BRIDGE_ADDRESS,
                action: BRIDGE_ACTIONS.ACK_SEND_TO_TON
              }
            }
          }
        ]
      }
    }
  ]
};

// Must set default to the project instance
export default project;
