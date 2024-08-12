import { Event } from "@cosmjs/stargate";

export const parseWasmEvents = (
  events: readonly Event[]
): {
  [key: string]: string;
}[] => {
  const wasmEvents = events.filter((e) => e.type.startsWith("wasm"));
  const attrs = [];
  for (const wasmEvent of wasmEvents) {
    let attr: Record<string, string> | undefined;
    for (const { key, value } of wasmEvent.attributes) {
      if (key === "_contract_address") {
        if (attr) attrs.push(attr);
        attr = {};
      }
      // @ts-ignore
      attr[key] = value;
    }
    attrs.push(attr);
  }
  return attrs as any;
};
