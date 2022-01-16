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
    throw new Error("signTransaction is not available");
  },
  encodeTransaction: (): Promise<TransactionJson> => {
    throw new Error("encodeTransaction is not available");
  },
  decodeTransaction: (): Promise<ActiveTransactionData> => {
    throw new Error("decodeTransaction is not available");
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
