import { Provider, Signer } from "koilib/lib/browser";
import { Messenger, Sender } from "kondor-js/lib/browser";
import {
  CallContractOperationJson,
  TransactionJson,
  BlockJson,
} from "koilib/lib/interface";
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
  if (!sender || !sender.tab) throw new Error("invalid command preparePopup");

  try {
    await messenger.sendExtensionMessage("popup", "ping2", {}, { timeout: 20 });
  } catch (error) {
    tabIdRequester = sender.tab.id;
    chrome.windows.create(
      {
        focused: true,
        height: 500,
        width: 309,
        type: "popup",
        url: "popup.html",
        top: 0,
        left: 0,
      },
      () => {}
    );
  }
}

const messenger = new Messenger({
  // eslint-disable-next-line
  // @ts-ignore
  onExtensionRequest: async (message, id, sender) => {
    const { command, args, to } = message;

    if (to !== "background") return undefined;

    await idHelper.add(id);

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
          let chainId = await storage.getChainId(false);
          if (!chainId) {
            chainId = await provider.getChainId();
            await storage.setChainId(chainId);
          }
          result = chainId;
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
          preparePopup(sender);
          const { transaction } = args as { transaction: TransactionJson };
          if (!transaction.header || !transaction.header.payer)
            throw new Error("Please define a payer for the transaction");
          if (!transaction.header.chain_id) {
            let chainId = await storage.getChainId(false);
            if (!chainId) {
              chainId = await provider.getChainId();
              await storage.setChainId(chainId);
            }
            transaction.header.chain_id = chainId;
          }
          result = await signer!.prepareTransaction(transaction);
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
