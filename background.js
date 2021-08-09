var exports = {};

try {
  importScripts(
    "vendor/base64-binary.js",
    "vendor/bs58.bundle.js",
    "vendor/noble-ripemd160.js",
    "vendor/noble-secp256k1.js",
    "vendor/sha256.min.js",
    "js/background/utils.js",
    "js/background/jsonrpc.js",
    "js/background/variableblob.js",
    "js/background/multihash.js",
    "js/background/serializer.js",
    "js/background/contract.js",
    "js/background/baseAbis.js",
    "js/background/wallet.js"
  );

  const contract = new Contract(paramsKoinContract);
  const ope = contract.encodeOperation({
    name: "transfer",
    args: {
      from: "accountA",
      to: "accountB",
      value: "65535",
    },
  });
  //console.log(contract.decodeOperation(ope));
  const wallet = Wallet.fromSeed("my seed");
  console.log(wallet.address);
  const op = contract.encodeOperation({
    name: "transfer",
    args: {
      from: wallet.address,
      to: "16mLtpSKPfXUgTStzgrw3hwCTLB3NMUa5Y",
      value: 4,
    },
  });

  const tx = {
    active_data: {
      resource_limit: 1000000,
      nonce: 0,
      operations: [
        {
          type: abiCallContractOperation.name,
          value: op,
        },
      ],
    },
  };

  (async () => {
    await wallet.signTransaction(tx);
    console.log(tx);
    try {
      /*const a = await jsonrpc("chain.submit_transaction", { transaction: tx });
      const a2 = await a.json();
      console.log("a");
      console.log(a2);*/
      console.log("reading balance...");

      const response = await jsonrpc(
        "chain.read_contract",
        contract.encodeOperation({
          name: "balance_of",
          args: wallet.address,
        })
      );
      const resp2 = await response.json();
      const vb = new VariableBlob(resp2.result.result);
      console.log(deserialize(vb, { type: "uint64" }));
    } catch (e) {
      console.log("fetch error");
      throw e;
    }
  })();

  const db = {
    get: (keys) =>
      new Promise((resolve, reject) => {
        chrome.storage.local.get(keys, function (result) {
          if (Object.keys(result).length == 0) resolve(null);
          else resolve(result);
        });
      }),
    set: (data) =>
      new Promise((resolve, reject) => {
        chrome.storage.local.set(data, function () {
          resolve();
        });
      }),
  };

  async function asyncResponse(receiverId, fn) {
    const result = await fn();
    chrome.tabs.sendMessage(receiverId, result);
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResp) => {
    if (msg.getOptsEncryption) {
      sendResp(true);
      asyncResponse(sender.tab.id, async () => {
        const result = await db.get(["salt", "iv"]);
        let opts = result;
        if (!opts) {
          // we take the salt and iv provided in the message
          const { salt, iv } = msg.getOptsEncryption;
          await db.set({ salt, iv });
          opts = await db.get(["salt", "iv"]);
        }
        return opts;
      });
    }
  });
} catch (e) {
  console.error(e);
}
