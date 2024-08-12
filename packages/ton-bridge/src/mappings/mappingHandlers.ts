//@ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export { handleAckSendToTon, handleSendToCosmos, handleSendToTon } from "./bridge";
export { handleInitPool } from "./init";
