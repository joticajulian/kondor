import { Messenger } from "./Messenger";
import {
  BlockJson,
  CallContractOperationJson,
  TransactionJson,
} from "koilib/lib/interface";

const messenger = new Messenger({});

export const provider = {
  async call<T = unknown>(method: string, params: unknown): Promise<T> {
    return messenger.sendDomMessage("background", "provider:call", {
      method,
      params,
    });
  },

  async getNonce(account: string): Promise<number> {
    return messenger.sendDomMessage("background", "provider:getNonce", {
      account,
    });
  },

  async getAccountRc(account: string): Promise<string> {
    return messenger.sendDomMessage("background", "provider:getAccountRc", {
      account,
    });
  },

  async getTransactionsById(transactionIds: string[]): Promise<{
    transactions: {
      transaction: TransactionJson[];
      containing_blocks: string[];
    }[];
  }> {
    return messenger.sendDomMessage(
      "background",
      "provider:getTransactionsById",
      {
        transactionIds,
      }
    );
  },

  async getBlocksById(blockIds: string[]): Promise<{
    block_items: {
      block_id: string;
      block_height: string;
      block: BlockJson;
    }[];
  }> {
    return messenger.sendDomMessage("background", "provider:getBlocksById", {
      blockIds,
    });
  },

  async getHeadInfo(): Promise<{
    head_topology: {
      id: string;
      height: string;
      previous: string;
    };
    last_irreversible_block: string;
  }> {
    return messenger.sendDomMessage("background", "provider:getHeadInfo");
  },

  async getChainId(): Promise<string> {
    return messenger.sendDomMessage("background", "provider:getChainId");
  },

  async getBlocks(
    height: number,
    numBlocks = 1,
    idRef?: string
  ): Promise<
    {
      block_id: string;
      block_height: string;
      block: BlockJson;
      block_receipt: {
        [x: string]: unknown;
      };
    }[]
  > {
    return messenger.sendDomMessage("background", "provider:getBlocks", {
      height,
      numBlocks,
      idRef,
    });
  },

  async getBlock(height: number): Promise<{
    block_id: string;
    block_height: string;
    block: BlockJson;
    block_receipt: {
      [x: string]: unknown;
    };
  }> {
    return messenger.sendDomMessage("background", "provider:getBlock", {
      height,
    });
  },

  async wait(
    txId: string,
    type: "byTransactionId" | "byBlock" = "byBlock",
    timeout = 30000
  ): Promise<string | number> {
    return messenger.sendDomMessage("background", "provider:wait", {
      txId,
      type,
      timeout,
    });
  },

  async sendTransaction(transaction: TransactionJson): Promise<{}> {
    await messenger.sendDomMessage("background", "provider:sendTransaction", {
      transaction,
    });
    return {};
  },

  async submitBlock(block: BlockJson): Promise<Record<string, never>> {
    return messenger.sendDomMessage("background", "provider:submitBlock", {
      block,
    });
  },

  async readContract(operation: CallContractOperationJson): Promise<{
    result: string;
    logs: string;
  }> {
    return messenger.sendDomMessage("background", "provider:readContract", {
      operation,
    });
  },
};

export default provider;
