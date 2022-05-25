import { Messenger } from "kondor-js/lib/browser";

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

const backgroundCommands = [
  "provider:call",
  "provider:getNonce",
  "provider:getAccountRc",
  "provider:getTransactionsById",
  "provider:getBlocksById",
  "provider:getHeadInfo",
  "provider:getChainId",
  "provider:getBlocks",
  "provider:getBlock",
  "provider:wait",
  "provider:sendTransaction",
  "provider:submitBlock",
  "provider:readContract",
  "signer:prepareTransaction",
];

const popupCommands = [
  "getAccounts",
  "signer:signHash",
  "signer:signMessage",
  "signer:signTransaction",
  "signer:sendTransaction",
];

let popupReady = false;

async function preparePopup() {
  await messenger.sendExtensionMessage("background", "preparePopup");
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
    const { command, args, to } = event.data;
    const isBackgroundCommand = backgroundCommands.includes(command!);
    const isPopupCommand = popupCommands.includes(command!);
    if (!isBackgroundCommand && !isPopupCommand) return undefined;

    if (isPopupCommand) {
      popupReady = false;
      await preparePopup();
    }

    return messenger.sendExtensionMessage(to, command, args, {
      ping: true,
      pingTimeout: 2000,
    });
  },
});
