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
  nicknamesContractId?: string;
  kapNameServiceContractId?: string;
  kapProfileContractId?: string;
  freeManaSharer?: string;
}

export const DEFAULT_NETWORKS: Network[] = [
  {
    name: "Koinos Mainnet",
    tag: "mainnet",
    chainId: "EiBZK_GGVP0H_fXVAM3j6EAuz3-B-l3ejxRSewi7qIBfSA==",
    rpcNodes: ["https://api.koinos.io", "https://api.koinosblocks.com"],
    koinContractId: "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL",
    nicknamesContractId: "1KD9Es7LBBjA1FY3ViCgQJ7e6WH1ipKbhz",
    kapNameServiceContractId: "13tmzDmfqCsbYT26C4CmKxq86d33senqH3",
    kapProfileContractId: "1EttfMuvTXGh8oE6vLiRF5JfqBvRiofFkB",
    freeManaSharer: "1KyZyhNwiDo6a93f3FvK8pxspKdgEtQDwa",
  },
  {
    name: "Koinos Harbinger (testnet)",
    tag: "harbinger",
    // Harbinger chain #1
    // chainId: "EiAAKqFi-puoXnuJTdn7qBGGJa8yd-dcS2P0ciODe4wupQ==",

    // Harbinger chain #2 (2023-07-14)
    chainId: "EiBncD4pKRIQWco_WRqo5Q-xnXR7JuO3PtZv983mKdKHSQ==",
    rpcNodes: [
      "https://harbinger-api.koinos.io",
      "https://testnet.koinosblocks.com",
    ],
    koinContractId: "1FaSvLjQJsCJKq5ybmGsMMQs8RQYyVv8ju",
    nicknamesContractId: "1KXsC2bSnKAMAZ51gq3xxKBo74a7cDJjkR",
    freeManaSharer: "1K6oESWG87m3cB3M2WVkzxdTr38po8WToN",
  },
];

export async function setNetworks(networks: Network[]): Promise<void> {
  // take default values except the RPC nodes
  const _networks = JSON.parse(JSON.stringify(DEFAULT_NETWORKS)) as Network[];
  _networks.forEach((n) => {
    const ne = networks.find((t) => t.tag === n.tag);
    if (!ne) return;
    n.rpcNodes = ne.rpcNodes;
  });
  return write("networks", _networks);
}

export async function getNetworks(strict = true): Promise<Network[]> {
  let networks = await read<Network[]>("networks", strict);
  if (!networks || networks.length === 0) {
    // store default value
    networks = DEFAULT_NETWORKS;
    await setNetworks(networks);
    networks = await read("networks", true);
  }

  // take default values if not present
  networks!.forEach((network, i) => {
    const fields = [
      "rpcNodes",
      "koinContractId",
      "nicknamesContractId",
      "kapNameServiceContractId",
      "kapProfileContractId",
      "freeManaSharer",
    ] as const;
    fields.forEach((field) => {
      if (!network[field]) {
        network[field] = DEFAULT_NETWORKS[i][field]! as string & string[];
      }
    });
  });
  return networks!;
}
