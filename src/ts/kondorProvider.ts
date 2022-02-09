import { Messenger } from "./Messenger";
import {
  BlockJson,
  CallContractOperationJson,
  TransactionJson,
} from "koilib/lib/interface";

const messenger = new Messenger({});

export const provider = {
  async call<T = unknown>(method: string, params: unknown): Promise<T> {
    return messenger.sendDomMessage("provider:call", { method, params });
  },

  async getNonce(account: string): Promise<number> {
    return messenger.sendDomMessage("provider:getNonce", { account });
  },

  async getAccountRc(account: string): Promise<string> {
    return messenger.sendDomMessage("provider:getAccountRc", { account });
  },

  async getTransactionsById(transactionIds: string[]): Promise<{
    transactions: {
      transaction: TransactionJson[];
      containing_blocks: string[];
    }[];
  }> {
    return messenger.sendDomMessage("provider:getTransactionsById", {
      transactionIds,
    });
  },

  async getBlocksById(blockIds: string[]): Promise<{
    block_items: {
      block_id: string;
      block_height: string;
      block: BlockJson;
    }[];
  }> {
    return messenger.sendDomMessage("provider:getBlocksById", { blockIds });
  },

  async getHeadInfo(): Promise<{
    head_topology: {
      id: string;
      height: string;
      previous: string;
    };
    last_irreversible_block: string;
  }> {
    return messenger.sendDomMessage("provider:getHeadInfo");
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
    return messenger.sendDomMessage("provider:getBlocks", {
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
    return messenger.sendDomMessage("provider:getBlock", { height });
  },

  async sendTransaction(transaction: TransactionJson): Promise<{}> {
    await messenger.sendDomMessage("provider:sendTransaction", { transaction });
    return {};
  },

  async readContract(operation: CallContractOperationJson): Promise<{
    result: string;
    logs: string;
  }> {
    return messenger.sendDomMessage("provider:readContract", { operation });
  },
};

export default provider;
