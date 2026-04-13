import { Messenger } from "kondor-js";
import * as storage from "./storage";

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

interface CallContractOperation {
  call_contract?: {
    contract_id?: string;
    entry_point?: string | number;
  };
}

interface TransactionArgs {
  transaction?: {
    operations?: CallContractOperation[];
  };
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

const backgroundCommands = [
  "provider:call",
  "provider:getNonce",
  "provider:getNextNonce",
  "provider:getAccountRc",
  "provider:getTransactionsById",
  "provider:getBlocksById",
  "provider:getHeadInfo",
  "provider:getChainId",
  "provider:getBlocks",
  "provider:getBlock",
  "provider:wait",
  "provider:sendTransaction",
  "provider:submitBlock",
  "provider:readContract",
  "provider:getForkHeads",
  "provider:getResourceLimits",
  "provider:invokeSystemCall",
  "provider:invokeGetContractMetadata",
  "signer:prepareTransaction",
];

const popupCommands = [
  "getAccounts",
  "signer:signHash",
  "signer:signMessage",
  "signer:signTransaction",
  "signer:sendTransaction",
];

let popupReady = false;

async function preparePopup() {
  await messenger.sendExtensionMessage("background", "preparePopup");
  while (!popupReady) await new Promise((r) => setTimeout(r, 20));
}

function normalizeOrigin(origin: string): string {
  try {
    return new URL(origin).origin;
  } catch {
    return origin;
  }
}

function getRequestedFunctions(args: unknown) {
  const txArgs = args as TransactionArgs;
  const operations = txArgs.transaction?.operations || [];
  if (!operations.length) return [];
  const requestedFunctions = [];
  for (let i = 0; i < operations.length; i += 1) {
    const callContract = operations[i].call_contract;
    if (!callContract || !callContract.contract_id) return null;
    const contractId = String(callContract.contract_id).trim();
    const entryPoint = String(callContract.entry_point ?? "").trim();
    if (!contractId || !entryPoint) return null;
    requestedFunctions.push({ contractId, entryPoint });
  }
  return requestedFunctions;
}

async function isAutoSignAllowed(origin: string, args: unknown): Promise<boolean> {
  const requestedFunctions = getRequestedFunctions(args);
  if (!requestedFunctions || requestedFunctions.length === 0) return false;
  const authorizations = await storage.getAutoSignAuthorizations();
  const authorization = authorizations.find(
    (item) => normalizeOrigin(item.origin) === normalizeOrigin(origin)
  );
  if (!authorization || !authorization.functions?.length) return false;
  return requestedFunctions.every((requestedFunction) =>
    authorization.functions.some(
      (allowed) =>
        allowed.contractId === requestedFunction.contractId &&
        String(allowed.entryPoint) === requestedFunction.entryPoint
    )
  );
}

const messenger: Messenger = new Messenger({
  onExtensionRequest: async (message) => {
    const { command } = message;
    switch (command) {
      case "popupReady": {
        popupReady = true;
        return "ok";
      }
      default:
        return undefined;
    }
  },
  onDomRequest: async (event) => {
    const { command, args, to } = event.data;
    const isBackgroundCommand = backgroundCommands.includes(command!);
    const isPopupCommand = popupCommands.includes(command!);
    if (!isBackgroundCommand && !isPopupCommand) return undefined;

    const isTransactionPopupCommand =
      command === "signer:signTransaction" || command === "signer:sendTransaction";
    if (isTransactionPopupCommand && (await isAutoSignAllowed(event.origin, args))) {
      try {
        return messenger.sendExtensionMessage(
          "background",
          "signer:autoSignTransaction",
          {
            command,
            args,
          },
          {
            ping: true,
            pingTimeout: 2000,
          }
        );
      } catch (error) {
        const errorMessage = (error as Error).message || "";
        if (!errorMessage.startsWith("AUTO_SIGN_FALLBACK:")) throw error;
      }
    }

    if (isPopupCommand) {
      popupReady = false;
      await preparePopup();
    }

    return messenger.sendExtensionMessage(to, command, args, {
      ping: true,
      pingTimeout: 2000,
    });
  },
});
