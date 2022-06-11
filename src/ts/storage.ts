export interface Account {
  name: string;
  keyPath?: string;
  encryptedPrivateKey?: string;
  address: string;
}

/* eslint-disable no-undef */
export async function write(key: string, value: unknown): Promise<void> {
  return new Promise((resolve) => {
    const data: { [x: string]: unknown } = {};
    data[key] = value;
    chrome.storage.local.set(data, function () {
      resolve();
    });
  });
}

export async function read<T = unknown>(
  key: string,
  strict = true
): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], function (result) {
      if (Object.keys(result).length !== 0) return resolve(result[key] as T);
      if (strict) return reject(new Error(`${key} not found, it is undefined`));
      return resolve(undefined);
    });
  });
}

export async function setMnemonic(encrypted: string): Promise<void> {
  return write("mnemonic", encrypted);
}

export async function getMnemonic(strict = true): Promise<string> {
  return read("mnemonic", strict) as Promise<string>;
}

export async function setAccounts(encrypted: Account[]): Promise<void> {
  return write("accounts", encrypted);
}

export async function getAccounts(strict = true): Promise<string> {
  return read("accounts", strict) as Promise<string>;
}

export async function setRpcNodes(rpcNodes: string[]): Promise<void> {
  return write("rpcNodes", rpcNodes);
}

export async function getRpcNodes(strict = true): Promise<string[]> {
  return read("rpcNodes", strict) as Promise<string[]>;
}

export async function setChainId(chainId: string): Promise<void> {
  return write("chainId", chainId);
}

export async function getChainId(strict = true): Promise<string> {
  return read("chainId", strict) as Promise<string>;
}
