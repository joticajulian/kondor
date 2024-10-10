import {
  Provider,
  Signer,
  Transaction,
  CallContractOperationJson,
  TransactionJson,
  BlockJson,
  GetBlockOptions,
} from "koilib";
import { Messenger, Sender } from "kondor-js";
import * as storage from "./storage";

const EXPIRATION_ID = 30 * 60 * 1000; // 30 minutes

let tabIdRequester: number | undefined;

const getIds = async () => {
  const ids =
    (await storage.read<{ id: string; timestamp: number }[]>(
      "bg-ids",
      false
    )) || [];
  return ids.filter(
    (id) => id.timestamp && Date.now() < id.timestamp + EXPIRATION_ID
  );
};

const writeIds = async (ids: { id: string; timestamp: number }[]) => {
  await storage.write("bg-ids", ids);
};

const idHelper = {
  add: async (id: string) => {
    const ids = await getIds();
    ids.push({ id, timestamp: Date.now() });
    await writeIds(ids);
  },
  remove: async (id: string) => {
    const ids = await getIds();
    const index = ids.findIndex((rId) => rId.id === id);
    if (index < 0) return;
    ids.splice(index, 1);
    await writeIds(ids);
  },
};

async function preparePopup(sender?: Sender) {
  console.log("preparePopup called", sender);
  if (!sender || !sender.tab) {
    console.error("Invalid sender or sender.tab");
    throw new Error("invalid command preparePopup");
  }

  try {
    console.log("Attempting to send ping2 message");
    await messenger.sendExtensionMessage("popup", "ping2", {}, { timeout: 20 });
    console.log("ping2 message sent successfully");
  } catch (error) {
    console.log("ping2 message failed, creating new popup window", error);
    tabIdRequester = sender.tab.id;
    const popupWidth = 357;
    const popupHeight = 600;

    // Get the current window's information
    chrome.windows.getCurrent({}, (currentWindow) => {
      const top = (currentWindow.top || 0) + 80;
      const left =
        (currentWindow.left || 0) +
        (currentWindow.width || 0) -
        popupWidth -
        130;

      chrome.windows.create(
        {
          url: chrome.runtime.getURL("popup.html"),
          type: "popup",
          width: popupWidth,
          height: popupHeight,
          top,
          left,
          focused: true,
        },
        (window) => {
          if (chrome.runtime.lastError) {
            console.error("Error creating popup:", chrome.runtime.lastError);
          } else if (window) {
            console.log("Popup window created successfully", window);
          } else {
            console.error("Window creation failed");
          }
        }
      );
    });
  }
}

async function getProvider(inputNetworkTag?: string): Promise<Provider> {
  const networkTag = inputNetworkTag || (await storage.getCurrentNetwork());
  const networks = await storage.getNetworks();
  const network = networks.find((n) => n.tag === networkTag);
  if (!network) throw new Error(`network ${networkTag} not found`);
  return new Provider(network.rpcNodes);
}

async function getChainIdFromStorage(
  inputNetworkTag?: string
): Promise<string> {
  const networkTag = inputNetworkTag || (await storage.getCurrentNetwork());
  const networks = await storage.getNetworks();
  const network = networks.find((n) => n.tag === networkTag);
  if (!network) throw new Error(`network ${networkTag} not found`);
  return network.chainId;
}

function checkKondorWindows(): Promise<chrome.windows.Window[]> {
  return new Promise((resolve) => {
    chrome.windows.getAll({ populate: true }, (windows) => {
      const kondorWindows = windows.filter((window) => {
        return window.tabs?.some((tab) => {
          return tab.url && tab.url.includes(chrome.runtime.id);
        });
      });
      resolve(kondorWindows);
    });
  });
}

const messenger = new Messenger({
  // eslint-disable-next-line
  // @ts-ignore
  onExtensionRequest: async (message, id, sender) => {
    const { command, args, to } = message;

    if (to !== "background") return undefined;

    await idHelper.add(id);

    try {
      let result: unknown;
      switch (command) {
        case "preparePopup": {
          await preparePopup(sender);
          result = "ok";
          break;
        }
        case "ping": {
          const rId = (await getIds()).find(
            (rId) => rId.id === (args as { id: string }).id
          );
          if (!rId) throw new Error("Connection closed background");
          result = "ok";
          break;
        }
        case "getTab": {
          result = tabIdRequester;
          break;
        }
        case "provider:call": {
          const { network, method, params } = args as {
            network: string;
            method: string;
            params: unknown;
          };
          const provider = await getProvider(network);
          result = await provider.call(method, params);
          break;
        }
        case "provider:getNonce": {
          const { network, account } = args as {
            network: string;
            account: string;
          };
          const provider = await getProvider(network);
          result = await provider.getNonce(account);
          break;
        }
        case "provider:getNextNonce": {
          const { network, account } = args as {
            network: string;
            account: string;
          };
          const provider = await getProvider(network);
          result = await provider.getNextNonce(account);
          break;
        }
        case "provider:getAccountRc": {
          const { network, account } = args as {
            network: string;
            account: string;
          };
          const provider = await getProvider(network);
          result = await provider.getAccountRc(account);
          break;
        }
        case "provider:getTransactionsById": {
          const { network, transactionIds } = args as {
            network: string;
            transactionIds: string[];
          };
          const provider = await getProvider(network);
          result = await provider.getTransactionsById(transactionIds);
          break;
        }
        case "provider:getBlocksById": {
          const { network, blockIds } = args as {
            network: string;
            blockIds: string[];
          };
          const provider = await getProvider(network);
          result = await provider.getBlocksById(blockIds);
          break;
        }
        case "provider:getHeadInfo": {
          const a = args as { network: string } | undefined;
          const network = a && a.network ? a.network : undefined;
          const provider = await getProvider(network);
          result = await provider.getHeadInfo();
          break;
        }
        case "provider:getChainId": {
          const a = args as { network: string } | undefined;
          const network = a && a.network ? a.network : undefined;
          result = await getChainIdFromStorage(network);
          break;
        }
        case "provider:getBlocks": {
          const { network, height, numBlocks, idRef, opts } = args as {
            network: string;
            height: number;
            numBlocks?: number;
            idRef?: string;
            opts?: GetBlockOptions;
          };
          const provider = await getProvider(network);
          result = await provider.getBlocks(height, numBlocks, idRef, opts);
          break;
        }
        case "provider:getBlock": {
          const { network, height, opts } = args as {
            network: string;
            height: number;
            opts: GetBlockOptions;
          };
          const provider = await getProvider(network);
          result = await provider.getBlock(height, opts);
          break;
        }
        case "provider:wait": {
          const { network, txId, type, timeout } = args as {
            network: string;
            txId: string;
            type: "byTransactionId" | "byBlock";
            timeout: number;
          };
          const provider = await getProvider(network);
          result = await provider.wait(txId, type, timeout);
          break;
        }
        case "provider:sendTransaction": {
          const { network, transaction, broadcast } = args as {
            network: string;
            transaction: TransactionJson;
            broadcast: boolean;
          };
          const provider = await getProvider(network);
          result = await provider.sendTransaction(transaction, broadcast);
          break;
        }
        case "provider:submitBlock": {
          const { network, block } = args as {
            network: string;
            block: BlockJson;
          };
          const provider = await getProvider(network);
          result = await provider.submitBlock(block);
          break;
        }
        case "provider:readContract": {
          const { network, operation } = args as {
            network: string;
            operation: CallContractOperationJson;
          };
          const provider = await getProvider(network);
          result = await provider.readContract(operation);
          break;
        }
        case "signer:prepareTransaction": {
          const { network, transaction, signerAddress } = args as {
            network: string;
            transaction: TransactionJson;
            signerAddress: string;
          };
          preparePopup(sender);

          if (!transaction.header) {
            transaction.header = { payer: signerAddress };
          }

          if (!transaction.header.payer) {
            transaction.header.payer = signerAddress;
          }

          if (!transaction.header.chain_id) {
            transaction.header.chain_id = await getChainIdFromStorage(network);
          }

          const signer = Signer.fromSeed("seed");
          signer.provider = await getProvider(network);
          result = Transaction.prepareTransaction(transaction, signer.provider);
          break;
        }
        case "provider:getForkHeads": {
          const { network } = args as {
            network: string;
          };
          const provider = await getProvider(network);
          result = await provider.getForkHeads();
          break;
        }
        case "provider:getResourceLimits": {
          const { network } = args as {
            network: string;
          };
          const provider = await getProvider(network);
          result = await provider.getResourceLimits();
          break;
        }

        case "provider:invokeSystemCall": {
          throw new Error(
            "invokeSystemCall not implemented in kondor provider"
          );
        }

        case "provider:invokeGetContractMetadata": {
          const { network, contractId } = args as {
            network: string;
            contractId: string;
          };
          const provider = await getProvider(network);
          result = await provider.invokeGetContractMetadata(contractId);
          break;
        }

        default: {
          result = undefined;
          break;
        }
      }
      await idHelper.remove(id);
      return result;
    } catch (error) {
      await idHelper.remove(id);
      throw error;
    }
  },
});
