function toUint8Array(hexString) {
  return new Uint8Array(
    hexString
      .match(/[\dA-F]{2}/gi) // separate into pairs
      .map((s) => parseInt(s, 16)) // convert to integers
  );
}

function toHexString(buffer) {
  return Array.from(buffer)
    .map((n) => `0${Number(n).toString(16)}`.slice(-2))
    .join("");
}

const messageResponses = [];
chrome.runtime.onMessage.addListener((msg, sender, sendResp) => {
  messageResponses.push(msg);
  sendResp(true);
});

async function sendMessage(method, params) {
  const id = Math.round(Math.random() * 1000);
  chrome.runtime.sendMessage({ id, method, params });
  while (true) {
    await new Promise((resolve) => setTimeout(resolve, 20));
    const i = messageResponses.findIndex((m) => m.id === id);
    if (i >= 0) {
      const responses = messageResponses.splice(i, 1);
      const { error, result } = responses[0];
      if (error) throw new Error(error.message);
      return result;
    }
  }
}

function getKeyMaterial(password) {
  let enc = new TextEncoder();
  return window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
}

function getKey(keyMaterial, salt) {
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

async function encrypt(data, password) {
  let salt = window.crypto.getRandomValues(new Uint8Array(16));
  let iv = window.crypto.getRandomValues(new Uint8Array(12));
  const opts = await sendMessage("getOptsEncryption", { salt, iv });
  salt = new Uint8Array(Object.keys(opts.salt).map((k) => opts.salt[k])).buffer;
  iv = new Uint8Array(Object.keys(opts.iv).map((k) => opts.iv[k])).buffer;

  const keyMaterial = await getKeyMaterial(password);
  const key = await getKey(keyMaterial, salt);
  const message = JSON.stringify(data);
  const encoded = new TextEncoder().encode(message);

  const bufferEncrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encoded
  );
  return toHexString(new Uint8Array(bufferEncrypted));
}

async function decrypt(encrypted, password) {
  const opts = await sendMessage("getOptsEncryption", "decrypt");
  const salt = new Uint8Array(Object.keys(opts.salt).map((k) => opts.salt[k]))
    .buffer;
  const iv = new Uint8Array(Object.keys(opts.iv).map((k) => opts.iv[k])).buffer;
  const keyMaterial = await getKeyMaterial(password);
  const key = await getKey(keyMaterial, salt);
  const bufferEncrypted = toUint8Array(encrypted);

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    bufferEncrypted
  );
  const message = new TextDecoder().decode(decrypted);
  return JSON.parse(message);
}

let seed;
let salt, iv;
let accounts;
let wallet;

const viewUnlock = document.getElementById("view-unlock");
const viewImport = document.getElementById("view-import");
const viewTransfer = document.getElementById("view-transfer");
const inputPrivateKey = document.getElementById("private-key");
const inputSetPassword = document.getElementById("set-password");
const inputPassword = document.getElementById("password");
const buttonImport = document.getElementById("import");
const buttonGotoImport = document.getElementById("goto-import");
const buttonUnlock = document.getElementById("unlock");
const textBalanceValue = document.getElementById("balance-value");
const textAddress = document.getElementById("address");
const inputTransferTo = document.getElementById("transfer-to");
const inputTransferAmount = document.getElementById("transfer-amount");
const buttonTransfer = document.getElementById("transfer");
const textAlert = document.getElementById("text-alert");

async function init() {
  const accounts = await sendMessage("getAccounts");
  viewTransfer.classList.add("hidden");
  if (accounts) {
    viewUnlock.classList.remove("hidden");
    viewImport.classList.add("hidden");
  } else {
    viewUnlock.classList.add("hidden");
    viewImport.classList.remove("hidden");
  }
}
init();

buttonGotoImport.addEventListener("click", async () => {
  viewUnlock.classList.add("hidden");
  viewImport.classList.remove("hidden");
});

buttonUnlock.addEventListener("click", async () => {
  try {
    viewTransfer.classList.remove("hidden");
    viewUnlock.classList.add("hidden");
    const password = inputPassword.value;
    const { accounts: encrypted } = await sendMessage("getAccounts");
    const decrypted = await decrypt(encrypted, password);
    const { privateKey } = decrypted;
    await loadViewAccount(privateKey);
  } catch (error) {
    textAlert.innerText = error.message;
    console.log(error);
  }
});

async function loadViewAccount(privateKey) {
  if (!privateKey) throw new Error("private key not defined");
  // await sendMessage("importWallet", privateKey);
  wallet = new Wallet({
    signer: Signer.fromSeed(privateKey),
    provider: new Provider("http://45.56.104.152:8080"),
    contract: new Contract({
      id: "Mkw96mR+Hh71IWwJoT/2lJXBDl5Q=",
      entries: {
        transfer: {
          id: 1,
          args: {
            type: [
              {
                name: "from",
                type: "string",
              },
              {
                name: "to",
                type: "string",
              },
              {
                name: "value",
                type: "uint64",
              },
            ],
          },
        },
        balance_of: {
          id: 0x15619248,
          args: { type: "string" },
        },
      },
    }),
  });
  // const address = await sendMessage("getAddress");
  textAddress.innerText = wallet.getAddress();
  // const balance = await sendMessage("getBalance");
  const operation = wallet.encodeOperation({
    name: "balance_of",
    args: wallet.address,
  });
  console.log(wallet);console.log(operation)
  const result = await wallet.readContract(operation.value);
  const balance = deserialize(result.result, { type: "uint64" }).toString();
  textBalanceValue.innerText = Number(balance) / 1e8;
}

buttonImport.addEventListener("click", async () => {
  viewTransfer.classList.remove("hidden");
  viewImport.classList.add("hidden");
  try {
    const password = inputSetPassword.value;
    const encrypted = await encrypt(
      {
        privateKey: inputPrivateKey.value,
      },
      password
    );
    await sendMessage("storeAccount", encrypted);
    await loadViewAccount(inputPrivateKey.value);
  } catch (error) {
    textAlert.innerText = error.message;
    console.error(error);
  }
});

function getSatoshis(value, decimals) {
  if (isNaN(Number(value))) throw new Error(`Invalid value ${value}`);
  let [i, d] = value.replace(",", ".").split(".");
  d = d ? d : "";
  d = d.padEnd(decimals, "0");
  return (
    BigInt(i) * BigInt("1".padEnd(decimals + 1, "0")) +
    BigInt(d)
  ).toString();
}

buttonTransfer.addEventListener("click", async () => {
  try {
    const to = inputTransferTo.value;
    const value = getSatoshis(inputTransferAmount.value, 8);
    await sendMessage("transfer", { to, value });
    textAlert.innerText = "Sent";
    const balance = await sendMessage("getBalance");
    textBalanceValue.innerText = Number(balance) / 1e8;
  } catch (error) {
    textAlert.innerText = error.message;
    console.error(error);
  }
});
