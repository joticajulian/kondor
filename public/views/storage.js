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
  
  async function getAccounts() {
    const result = await db.get(["accounts"]);
    if (!result) return null;
    return result.accounts;
  }
  
  async function getRpcNode() {
    let result = await db.get(["rpcNode"]);
    if (!result) {
      // store default value
      await db.set({rpcNode: "http://api.koinos.io:8080"});
      result = await db.get(["rpcNode"]);
    }
    return result.rpcNode;
  }

  async function setRpcNode(rpcNode) {
    await db.set({ rpcNode });
  }
  
  async function storeAccount(encrypted) {
    return await db.set({ accounts: encrypted });
  }
  
  async function getOptsEncryption() {
    let result = await db.get(["salt", "iv"]);
    if (!result) {
      const salt = toHexString(window.crypto.getRandomValues(new Uint8Array(16)));
      const iv = toHexString(window.crypto.getRandomValues(new Uint8Array(12)));
      await db.set({ salt, iv });
      result = await db.get(["salt", "iv"]);
      if (!result)
        throw new Error("Local storage error: cannot save salt and iv");
    }
    const salt = toUint8Array(result.salt).buffer;
    const iv = toUint8Array(result.iv).buffer;
    return { salt, iv };
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
  
  async function getKey(password, salt) {
    const keyMaterial = await getKeyMaterial(password);
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
    const { salt, iv } = await getOptsEncryption();
    const key = await getKey(password, salt);
    const message = JSON.stringify(data);
    const encoded = new TextEncoder().encode(message);
  
    const bufferEncrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoded
    );
    return toHexString(new Uint8Array(bufferEncrypted));
  }
  
  async function decrypt(encrypted, password) {
    const { salt, iv } = await getOptsEncryption();
    const key = await getKey(password, salt);
    const bufferEncrypted = toUint8Array(encrypted);
  
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      bufferEncrypted
    );
    const message = new TextDecoder().decode(decrypted);
    return JSON.parse(message);
  }