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
  const opts = await sendMessage({ getOptsEncryption: { salt, iv } });
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
  const opts = await sendMessage({ getOptsEncryption: "decrypt" });
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

/*(async () => {
    password = "aaabc";
    console.log("encrypting...");
    const data = {
      name: "alice2",
      privateKey: "123456789",
    };
    const encc = await encrypt(data, password);
    console.log(encc);
    console.log("decrypting...");
    const resp = await decrypt(encc, password);
    console.log(resp);
  })();*/

const viewImport = document.getElementById("view-import");
const viewTransfer = document.getElementById("view-transfer");
const inputPrivateKey = document.getElementById("private-key");
const buttonImport = document.getElementById("import");
const textBalanceValue = document.getElementById("balance-value");
const textAddress = document.getElementById("address");
const inputTransferTo = document.getElementById("transfer-to");
const inputTransferAmount = document.getElementById("transfer-amount");
const buttonTransfer = document.getElementById("transfer");
const textAlert = document.getElementById("text-alert");

buttonImport.addEventListener("click", async () => {
  viewTransfer.classList.remove("hidden");
  viewImport.classList.add("hidden");
  try {
    await sendMessage("importWallet", inputPrivateKey.value);
    const address = await sendMessage("getAddress");
    const balance = await sendMessage("getBalance");
    textBalanceValue.innerText = Number(balance) / 1e8;
    textAddress.innerText = address;
  } catch (error) {
    textAlert.innerText = error.message;
    console.log(error);
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
    console.log("textAlert");
    console.log(error.message);
    textAlert.innerText = error.message;
    console.log(error);
  }
});
