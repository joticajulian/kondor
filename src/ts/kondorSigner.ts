import { SignerInterface } from "koilib";
import { Messenger } from "./Messenger";
import {
  Abi,
  ActiveTransactionData,
  SendTransactionResponse,
  TransactionJson,
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
  ): Promise<SendTransactionResponse> => {
    const txId = await messenger.sendDomMessage("signer:sendTransaction", {
      tx,
      abis,
    });
    return {
      wait: async (
        type: "byTransactionId" | "byBlock" = "byBlock",
        timeout = 30000
      ) => {
        return messenger.sendDomMessage("provider:wait", {
          txId,
          type,
          timeout,
        });
      },
    };
  },
};

export default signer;
