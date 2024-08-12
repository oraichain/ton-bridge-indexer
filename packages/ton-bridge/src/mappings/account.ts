import { Account, Network } from "../types";
import { handleError } from "./common";

export async function createAccountIfNotExist(accountId: string, network: Network) {
  try {
    const account = await Account.get(accountId);
    if (account) {
      return { account };
    }
    const newAccount = Account.create({ id: accountId, address: accountId, type: network });
    await newAccount.save();
    return { account: newAccount };
  } catch (error) {
    handleError("createAccountIfNotExist", error);
  }
}
