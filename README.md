# Oraichain Indexer

## How to build

```bash
docker build . \
--build-arg CONTRACT_ADDRESS=$AMM_V3_CONTRACT_ADDRESS \
--build-arg RPC_URL=$RPC_URL \
--target ammv3-indexer \
-t oraichain/defi_ammv3-indexer
```

## How to run

```bash
cd packages/${project} && docker-compose up --remove-orphans
```
