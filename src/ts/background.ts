import { Provider } from "koilib/lib/browser";
import {
  ActiveTransactionData,
  CallContractOperationJson,
  TransactionJson,
} from "koilib/lib/interface";
import { Messenger } from "./Messenger";
import * as storage from "./storage";

let tabIdRequester: number | undefined;

console.log("call background");

const messenger = new Messenger({
  // eslint-disable-next-line
  // @ts-ignore
  onExtensionRequest: async (message, id, sender) => {
    console.log("background command extension: " + message.command);
    const { command, args } = message;

    let provider = new Provider([]);
    if (command.startsWith("provider")) {
      const rpcNodes = await storage.getRpcNodes();
      provider = new Provider(rpcNodes);
    }

    switch (command) {
      case "preparePopup": {
        if (!sender || !sender.tab)
          throw new Error("invalid command preparePopup");

        try {
          await messenger.sendExtensionMessage(
            "extension",
            "ping2",
            {},
            { timeout: 20 }
          );
          console.log("ping2 ok, no need to create a new popup");
        } catch (error) {
          console.log(error);
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
        return "ok";
      }
      case "getTab": {
        return tabIdRequester;
      }
      case "provider:call": {
        const { method, params } = args as { method: string; params: unknown };
        return provider.call(method, params);
      }
      case "provider:getNonce": {
        const { account } = args as { account: string };
        return provider.getNonce(account);
      }
      case "provider:getAccountRc": {
        const { account } = args as { account: string };
        return provider.getAccountRc(account);
      }
      case "provider:getTransactionsById": {
        const { transactionIds } = args as { transactionIds: string[] };
        return provider.getTransactionsById(transactionIds);
      }
      case "provider:getBlocksById": {
        const { blockIds } = args as { blockIds: string[] };
        return provider.getBlocksById(blockIds);
      }
      case "provider:getHeadInfo": {
        return provider.getHeadInfo();
      }
      case "provider:getBlocks": {
        const { height, numBlocks, idRef } = args as {
          height: number;
          numBlocks?: number;
          idRef?: string;
        };
        return provider.getBlocks(height, numBlocks, idRef);
      }
      case "provider:getBlock": {
        const { height } = args as { height: number };
        return provider.getBlock(height);
      }
      case "provider:sendTransaction": {
        const { transaction } = args as { transaction: TransactionJson };
        return provider.sendTransaction(transaction);
      }
      case "provider:wait": {
        const { txId, type, timeout } = args as {
          txId: string;
          type: "byTransactionId" | "byBlock";
          timeout: number;
        };
        return provider.wait(txId, type, timeout);
      }
      case "provider:readContract": {
        const { operation } = args as { operation: CallContractOperationJson };
        return provider.readContract(operation);
      }
      default:
        return undefined;
    }
  },
});
