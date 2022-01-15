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
  sendTransaction: (
    tx: TransactionJson,
    abis?: Record<string, Abi>
  ): Promise<SendTransactionResponse> => {
    return messenger.sendDomMessage("sendTransaction", { tx, abis });
  },
};

export default signer;
