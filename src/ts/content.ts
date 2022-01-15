// import { Provider, SignerInterface } from "koilib";
// import { Abi, ActiveTransactionData, SendTransactionResponse, TransactionJson } from "koilib/lib/interface";
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

let popupLoaded = false;
const messenger: Messenger = new Messenger({
  onExtensionRequest: async (message) => {
    console.log("content command extension: " + message.command);
    const { command } = message;
    switch (command) {
      case "popupLoaded": {
        popupLoaded = true;
        return "ok";
      }
      default:
        return undefined;
    }
  },
  onDomRequest: async (event) => {
    console.log("content command dom: " + event.data.command);
    const { command, args } = event.data;
    switch (command) {
      case "sendTransaction": {
        return messenger.sendExtensionMessage(
          "extension",
          "sendTransaction",
          args
        );
      }
      default:
        return undefined;
    }
  },
});

(async () => {
  const a = await messenger.sendExtensionMessage("extension", "openPopup");
  console.log("reponse openup");
  console.log(a);
  while (!popupLoaded) await new Promise((r) => setTimeout(r, 20));
  console.log("popup loaded");
  const response2 = await messenger.sendExtensionMessage(
    "extension",
    "newWallet"
  );
  console.log("response newWallet");
  console.log(response2);
})();

/* function readStorage(keys: string[]) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, function (result) {
      if (Object.keys(result).length === 0) resolve(null);
      else resolve(result);
    });
  });
}; */

/* async function getRpcNode() {
  let result = (await readStorage(["rpcNode"])) as { rpcNode: string };
  if (!result) throw new Error("rpcNode can not be read from the storage");
  return result.rpcNode;
}; */
