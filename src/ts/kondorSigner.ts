import { SignerInterface } from "koilib";
import { Messenger } from "./Messenger";
import {
  Abi,
  ActiveTransactionData,
  TransactionJson,
  TransactionJsonWait,
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
  encodeTransaction: async (
    activeData: ActiveTransactionData
  ): Promise<TransactionJson> => {
    return messenger.sendDomMessage("signer:encodeTransaction", { activeData });
  },
  decodeTransaction: async (
    tx: TransactionJson
  ): Promise<ActiveTransactionData> => {
    return messenger.sendDomMessage("signer:decodeTransaction", { tx });
  },
  sendTransaction: async (
    tx: TransactionJson,
    abis?: Record<string, Abi>
  ): Promise<TransactionJsonWait> => {
    const transaction = await messenger.sendDomMessage<TransactionJson>(
      "signer:sendTransaction",
      {
        tx,
        abis,
      }
    );
    return {
      ...transaction,
      wait: async (
        type: "byTransactionId" | "byBlock" = "byBlock",
        timeout = 30000
      ) => {
        return messenger.sendDomMessage("provider:wait", {
          txId: transaction.id,
          type,
          timeout,
        });
      },
    };
  },
};

export default signer;
