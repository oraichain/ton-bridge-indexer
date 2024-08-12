FROM node:20.12.0 AS builder

ARG CONTRACT_ADDRESS
ARG RPC_URL
ENV AMM_V3_CONTRACT_ADDRESS=$CONTRACT_ADDRESS
ENV RPC_URL=$RPC_URL
WORKDIR /app
COPY ./package.json ./yarn.lock  ./lerna.json ./
COPY packages/libs/package.json /app/packages/libs/package.json
COPY packages/amm-v3/package.json /app/packages/amm-v3/package.json
COPY packages/tx-history/package.json /app/packages/tx-history/package.json
RUN yarn
COPY packages/libs/ /app/packages/libs/
COPY packages/amm-v3/ /app/packages/amm-v3/
COPY packages/tx-history/ /app/packages/tx-history/
COPY ./tsconfig.json /app/tsconfig.json

RUN yarn prebuild && yarn build

FROM subquerynetwork/subql-node-cosmos:v4.0.1 AS base-node

FROM base-node AS ammv3-indexer

COPY --from=builder /app/packages/amm-v3 /app

