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

let messageResponse = null;
chrome.runtime.onMessage.addListener((msg, sender, sendResp) => {
  messageResponse = msg;
  sendResp({ farewell: "received" });
});

async function sendMessage(data) {
  chrome.runtime.sendMessage(data);
  while (true) {
    await new Promise((resolve) => setTimeout(resolve, 20));
    if (messageResponse) {
      const result = messageResponse;
      messageResponse = undefined;
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

(async () => {
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
})();

var s = document.createElement("script");
s.src = chrome.runtime.getURL("js/injected.js");
(document.head || document.documentElement).appendChild(s);

document.addEventListener("ev", function (request) {
  console.log("listener....");
  console.log(request);
});

s.onload = function () {
  var url = chrome.runtime.getURL("html/popup.html");

  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("yourCustomEvent", true, true, url);
  document.dispatchEvent(evt);
};
