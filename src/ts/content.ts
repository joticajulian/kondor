import { Messenger } from "./Messenger";

interface Event {
  data: {
    command: string;
    id: number;
    args: unknown;
    result?: unknown;
    error?: unknown;
  };
  source: {
    postMessage: (data: unknown, target: string) => void;
  };
  origin: string;
}

declare const window: {
  addEventListener: (what: string, listener: (event: Event) => unknown) => void;
  removeEventListener: (
    what: string,
    listener: (event: Event) => unknown
  ) => void;
  postMessage: (data: unknown, target: string) => void;
  [x: string]: unknown;
};

const allowedCommands = [
  "getAccounts",
  "signer:sendTransaction",
  "signer:encodeTransaction",
  "signer:decodeTransaction",
  "provider:call",
  "provider:getNonce",
  "provider:getAccountRc",
  "provider:getTransactionsById",
  "provider:getBlocksById",
  "provider:getHeadInfo",
  "provider:getBlocks",
  "provider:getBlock",
  "provider:sendTransaction",
  "provider:wait",
  "provider:readContract",
];

let popupReady = false;

async function preparePopup() {
  await messenger.sendExtensionMessage("extension", "preparePopup");
  while (!popupReady) await new Promise((r) => setTimeout(r, 20));
}

const messenger: Messenger = new Messenger({
  onExtensionRequest: async (message) => {
    const { command } = message;
    switch (command) {
      case "popupReady": {
        popupReady = true;
        return "ok";
      }
      default:
        return undefined;
    }
  },
  onDomRequest: async (event) => {
    const { command, args } = event.data;
    if (allowedCommands.includes(command!)) {
      popupReady = false;
      await preparePopup();
      return messenger.sendExtensionMessage("extension", command, args, {
        ping: true,
      });
    }
    return undefined;
  },
});
