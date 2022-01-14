// import { Provider, SignerInterface } from "koilib";
// import { Abi, ActiveTransactionData, SendTransactionResponse, TransactionJson } from "koilib/lib/interface";
import { Messenger } from "./Messenger";

declare const window: {
  addEventListener: (
    what: string,
    listener: (event: {
      data: {
        command: string;
        id: number;
        args: unknown;
      };
      source: {
        postMessage: (data: unknown, target: string) => void;
      };
      origin: string;
    }) => unknown
  ) => void;
  [x: string]: unknown;
};

let popupLoaded = false;
const messenger = new Messenger(async (request) => {
  const { data } = request;
  const { command } = data as { command: string };
  switch (command) {
    case "popupLoaded": {
      popupLoaded = true;
      return "ok";
    }
    default:
      return undefined;
  }
});

(async () => {
  console.log("calling bg to openPopup");
  const response1 = await messenger.sendMessage("extension", {
    command: "openPopup",
  });
  console.log("response from bg");
  console.log(response1);
  while (!popupLoaded) await new Promise((r) => setTimeout(r, 20));
  console.log("popup uploaded");
  console.log("sending a message to the popup");
  const response2 = await messenger.sendMessage("extension", {
    command: "newWallet",
  });
  console.log("response from extension");
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

window.addEventListener("message", async function (event) {
  const { command, id, args } = event.data;
  let result = 0;

  try {
    switch (command) {
      case "sendTransaction": {
        const { tx, abis } = args as { tx: unknown; abis: unknown };
        result = await messenger.sendMessage("extension", {
          command: "sendTransaction",
          tx,
          abis,
        });
        break;
      }
      default:
        break;
    }
    event.source.postMessage({ id, result }, event.origin);
  } catch (error) {
    console.error(error);
    event.source.postMessage({ id, error }, event.origin);
  }
});
