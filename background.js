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

  const contract = new Contract(paramsKoinContract);
  let wallet;

  function importWallet(input) {
    wallet = Wallet.fromSeed(input);
    return 0;
  }

  async function getBalance() {
    const op = contract.encodeOperation({
      name: "balance_of",
      args: wallet.address,
    });
    const result = await jsonrpc("chain.read_contract", op);
    return deserialize(result.result, { type: "uint64" }).toString();
  }

  async function getNonce() {
    const result = await jsonrpc("chain.get_account_nonce", {
      account: `M${btoa(wallet.address)}`
    });
    console.log(result);
    return Number(result.nonce);
  }

  async function transfer({ to, value }) {
    const from = wallet.address;
    const op = contract.encodeOperation({
      name: "transfer",
      args: { from, to, value },
    });

    const tx = {
      active_data: {
        resource_limit: 1000000,
        nonce: await getNonce(),
        operations: [
          {
            type: abiCallContractOperation.name,
            value: op,
          },
        ],
      },
    };

    await wallet.signTransaction(tx);
    const result = await jsonrpc("chain.submit_transaction", {
      transaction: tx,
    });
    return result;
  }

  chrome.runtime.onMessage.addListener(async (msg, sender, sendResp) => {
    console.log(sender);
    const { id, method, params } = msg;
    let result;
    let error = undefined;
    sendResp(true);
    try {
      switch (method) {
        case "importWallet": {
          result = importWallet(params);
          break;
        }
        case "getBalance": {
          result = await getBalance();
          break;
        }
        case "getAddress": {
          result = wallet.address;
          break;
        }
        case "transfer": {
          result = await transfer(params);
          break;
        }
        /*case "getOptsEncryption": {
        sendResp(true);
        asyncResponse(sender.tab, async () => {
          const result = await db.get(["salt", "iv"]);
          let opts = result;
          if (!opts) {
            // we take the salt and iv provided in the message
            const { salt, iv } = params;
            await db.set({ salt, iv });
            opts = await db.get(["salt", "iv"]);
          }
          return opts;
        });
        return;
      }*/
        default: {
          error = { message: `unknown method ${method}` };
          break;
        }
      }
    } catch (e) {
      error = { message: e.message };
      console.log(e)
    }

    const response = { id, result, error };
    console.log(response);
    if (sender.tab) chrome.tabs.sendMessage(sender.tab.id, response);
    else chrome.runtime.sendMessage(response);
  });
} catch (e) {
  console.error(e);
}
