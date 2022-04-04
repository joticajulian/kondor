import { SignerInterface } from "koilib";
import { Messenger } from "./Messenger";
import {
  Abi,
  BlockJson,
  TransactionJson,
  TransactionJsonWait,
  TransactionReceipt,
} from "koilib/lib/interface";

const messenger = new Messenger({});

export const signer: SignerInterface = {
  getAddress: (): string => {
    throw new Error(
      "getAddress is not available. Please use getAccounts from kondor"
    );
  },
  getPrivateKey: (): string => {
    throw new Error("getPrivateKey is not available");
  },
  signTransaction: (): Promise<TransactionJson> => {
    throw new Error(
      "signTransaction is not available. Use sendTransaction instead"
    );
  },
  signHash: (): Promise<Uint8Array> => {
    throw new Error("signHash is not available. Use sendTransaction instead");
  },
  prepareBlock: (): Promise<BlockJson> => {
    throw new Error("prepareBlock is not available");
  },
  signBlock: (): Promise<BlockJson> => {
    throw new Error("signBlock is not available");
  },
  prepareTransaction: async (
    transaction: TransactionJson
  ): Promise<TransactionJson> => {
    const tx = await messenger.sendDomMessage<TransactionJson>(
      "background",
      "signer:prepareTransaction",
      { transaction }
    );
    return tx;
  },
  sendTransaction: async (
    tx: TransactionJson,
    abis?: Record<string, Abi>
  ): Promise<{
    receipt: TransactionReceipt;
    transaction: TransactionJsonWait;
  }> => {
    const { transaction, receipt } = await messenger.sendDomMessage<{
      receipt: TransactionReceipt;
      transaction: TransactionJson;
    }>("popup", "signer:sendTransaction", {
      tx,
      abis,
    });
    return {
      receipt,
      transaction: {
        ...transaction,
        wait: async (
          type: "byTransactionId" | "byBlock" = "byBlock",
          timeout = 30000
        ) => {
          return messenger.sendDomMessage("background", "provider:wait", {
            txId: transaction.id,
            type,
            timeout,
          });
        },
      },
    };
  },
};

export default signer;
