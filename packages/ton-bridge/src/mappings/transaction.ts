import { CosmosEvent } from "@subql/types-cosmos";
import { Transaction } from "../types";
import { handleError } from "./common";

export async function createTransactionIfNotExist(event: CosmosEvent): Promise<Transaction> {
  try {
    const transactionId = event.tx.hash;
    const blockHeight = BigInt(event.tx.block.block.header.height);
    const timestamp = BigInt(event.block.block.header.time.getTime());
    let transaction = await Transaction.get(transactionId);
    if (!transaction) {
      transaction = Transaction.create({
        id: transactionId,
        blockNumber: blockHeight,
        timestamp,
        gasUsed: BigInt(event.tx.tx.gasUsed)
      });
      await transaction.save();
    }
    return transaction;
  } catch (error) {
    return handleError("saveNewTransaction", error);
  }
}
