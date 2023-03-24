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

export const DEFAULT_CURRENT_NETWORK = "mainnet";

export async function setCurrentNetwork(currentNetwork: string): Promise<void> {
  return write("currentNetwork", currentNetwork);
}

export async function getCurrentNetwork(strict = false): Promise<string> {
  let currentNetwork = await read<string>("currentNetwork", strict);
  if (!currentNetwork) {
    currentNetwork = DEFAULT_CURRENT_NETWORK;
    await setCurrentNetwork(currentNetwork);
    currentNetwork = await read("currentNetwork", true);
  }
  return currentNetwork!;
}

export interface Network {
  name: string;
  tag: string;
  chainId: string;
  rpcNodes: string[];
  koinContractId: string;
}

export const DEFAULT_NETWORKS = [
  {
    name: "Koinos Mainnet",
    tag: "mainnet",
    chainId: "EiBZK_GGVP0H_fXVAM3j6EAuz3-B-l3ejxRSewi7qIBfSA==",
    rpcNodes: ["https://api.koinos.io", "https://api.koinosblocks.com"],
    koinContractId: "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL",
  },
  {
    name: "Koinos Harbinger (testnet)",
    tag: "harbinger",
    chainId: "EiAAKqFi-puoXnuJTdn7qBGGJa8yd-dcS2P0ciODe4wupQ==",
    rpcNodes: [
      "https://harbinger-api.koinos.io",
      "https://testnet.koinosblocks.com",
    ],
    koinContractId: "19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ",
  },
];

export async function setNetworks(networks: Network[]): Promise<void> {
  return write("networks", networks);
}

export async function getNetworks(strict = true): Promise<Network[]> {
  let networks = await read<Network[]>("networks", strict);
  if (!networks || networks.length === 0) {
    // store default value
    networks = DEFAULT_NETWORKS;
    await setNetworks(networks);
    networks = await read("networks", true);
  }
  return networks!;
}
