import { Provider, Signer } from "koilib/lib/browser";
import {
  CallContractOperationJson,
  TransactionJson,
  BlockJson,
} from "koilib/lib/interface";
import { Messenger } from "./Messenger";
import * as storage from "./storage";

let tabIdRequester: number | undefined;
let requestIds: string[] = [];

function removeId(id: string) {
  const index = requestIds.findIndex((rId) => rId === id);
  if (index < 0) return;
  requestIds.splice(index, 1);
}

const messenger = new Messenger({
  // eslint-disable-next-line
  // @ts-ignore
  onExtensionRequest: async (message, id, sender) => {
    const { command, args, to } = message;

    if (to !== "background") return undefined;

    requestIds.push(id);

    let provider = new Provider([]);
    let signer: Signer;
    if (command.startsWith("provider")) {
      const rpcNodes = await storage.getRpcNodes();
      provider = new Provider(rpcNodes);
    }
    if (command.startsWith("signer")) {
      const rpcNodes = await storage.getRpcNodes();
      provider = new Provider(rpcNodes);
      signer = Signer.fromSeed("seed");
      signer.provider = provider;
    }

    try {
      let result: unknown;
      switch (command) {
        case "preparePopup": {
          if (!sender || !sender.tab)
            throw new Error("invalid command preparePopup");

          try {
            await messenger.sendExtensionMessage(
              "popup",
              "ping2",
              {},
              { timeout: 20 }
            );
          } catch (error) {
            tabIdRequester = sender.tab.id;
            chrome.windows.create(
              {
                focused: true,
                height: 500,
                width: 309,
                type: "popup",
                url: "index.html",
                top: 0,
                left: 0,
              },
              () => {}
            );
          }
          result = "ok";
          break;
        }
        case "ping": {
          const rId = requestIds.find(
            (rId) => rId === (args as { id: string }).id
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
          const { method, params } = args as {
            method: string;
            params: unknown;
          };
          result = await provider.call(method, params);
          break;
        }
        case "provider:getNonce": {
          const { account } = args as { account: string };
          result = await provider.getNonce(account);
          break;
        }
        case "provider:getAccountRc": {
          const { account } = args as { account: string };
          result = await provider.getAccountRc(account);
          break;
        }
        case "provider:getTransactionsById": {
          const { transactionIds } = args as { transactionIds: string[] };
          result = await provider.getTransactionsById(transactionIds);
          break;
        }
        case "provider:getBlocksById": {
          const { blockIds } = args as { blockIds: string[] };
          result = await provider.getBlocksById(blockIds);
          break;
        }
        case "provider:getHeadInfo": {
          result = await provider.getHeadInfo();
          break;
        }
        case "provider:getChainId": {
          result = await provider.getChainId();
          break;
        }
        case "provider:getBlocks": {
          const { height, numBlocks, idRef } = args as {
            height: number;
            numBlocks?: number;
            idRef?: string;
          };
          result = await provider.getBlocks(height, numBlocks, idRef);
          break;
        }
        case "provider:getBlock": {
          const { height } = args as { height: number };
          result = await provider.getBlock(height);
          break;
        }
        case "provider:wait": {
          const { txId, type, timeout } = args as {
            txId: string;
            type: "byTransactionId" | "byBlock";
            timeout: number;
          };
          result = await provider.wait(txId, type, timeout);
          break;
        }
        case "provider:sendTransaction": {
          const { transaction } = args as { transaction: TransactionJson };
          result = await provider.sendTransaction(transaction);
          break;
        }
        case "provider:submitBlock": {
          const { block } = args as { block: BlockJson };
          result = await provider.submitBlock(block);
          break;
        }
        case "provider:readContract": {
          const { operation } = args as {
            operation: CallContractOperationJson;
          };
          result = await provider.readContract(operation);
          break;
        }
        case "signer:prepareTransaction": {
          const { transaction } = args as { transaction: TransactionJson };
          if (!transaction.header || !transaction.header.payer)
            throw new Error("Please define a payer for the transaction");
          result = await signer!.prepareTransaction(transaction);
        }
        default: {
          result = undefined;
          break;
        }
      }
      removeId(id);
      return result;
    } catch (error) {
      removeId(id);
      throw error;
    }
  },
});
