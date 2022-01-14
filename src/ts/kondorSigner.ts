import { SignerInterface } from "koilib";
import {
  Abi,
  ActiveTransactionData,
  SendTransactionResponse,
  TransactionJson,
} from "koilib/lib/interface";

interface Event {
  data: {
    command: string;
    id: number;
    args: unknown;
    result?: unknown;
    error?: unknown;
  };
  source: {
    postMessage: (data: unknown, target: string) => void;
  };
  origin: string;
}

declare const window: {
  addEventListener: (what: string, listener: (event: Event) => unknown) => void;
  removeEventListener: (
    what: string,
    listener: (event: Event) => unknown
  ) => void;
  postMessage: (data: unknown, target: string) => void;
  [x: string]: unknown;
};

async function sendMessage<T = unknown>(
  command: string,
  args: unknown
): Promise<T> {
  const reqId = Math.round(Math.random() * 10000);
  return new Promise((resolve: (result: T) => void, reject) => {
    // prepare the listener
    const listener = (event: Event) => {
      const { id, result, error } = event.data;
      if (id !== reqId) return;
      if (error) reject(error);
      else resolve(result as T);
      window.removeEventListener("message", listener);
    };

    // listen
    window.addEventListener("message", listener);

    // send request
    window.postMessage(
      {
        id: reqId,
        command,
        args,
      },
      "*"
    );
  });
}

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
    return sendMessage("sendTransaction", { tx, abis });
  },
};

export default signer;
