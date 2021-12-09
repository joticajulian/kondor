/* eslint-disable no-undef */

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

export default {
  name: 'Storage mixin',

  methods: {
    async readStorage(keys) {
      return new Promise((resolve) => {
        chrome.storage.local.get(keys, function (result) {
          if (Object.keys(result).length == 0) resolve(null);
          else resolve(result);
        });
      });
    },

    async writeStorage(data) {
      return new Promise((resolve) => {
        chrome.storage.local.set(data, function () {
          resolve();
        });
      });
    },

    async getAccounts() {
      const result = await this.readStorage(['accounts']);
      if (!result) return null;
      return result.accounts;
    },

    async setAccounts(encrypted) {
      this.writeStorage({ accounts: encrypted });
    },

    async getRpcNode() {
      let result = await this.readStorage(['rpcNode']);
      if (!result) {
        // store default value
        await this.writeStorage({ rpcNode: "http://api.koinos.io:8080" });
        result = await this.readStorage(['rpcNode']);
      }
      return result.rpcNode;
    },

    async setRpcNode(rpcNode) {
      await this.writeStorage({ rpcNode });
    },

    async getOptsEncryption() {
      let result = await this.readStorage(["salt", "iv"]);
      if (!result) {
        const salt = toHexString(window.crypto.getRandomValues(new Uint8Array(16)));
        const iv = toHexString(window.crypto.getRandomValues(new Uint8Array(12)));
        await this.writeStorage({ salt, iv });
        result = await this.readStorage(["salt", "iv"]);
        if (!result)
          throw new Error("Local storage error: cannot save salt and iv");
      }
      const salt = toUint8Array(result.salt).buffer;
      const iv = toUint8Array(result.iv).buffer;
      return { salt, iv };
    },

    getKeyMaterial(password) {
      let enc = new TextEncoder();
      return window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
      );
    },
    
    async getKey(password, salt) {
      const keyMaterial = await this.getKeyMaterial(password);
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
    },
    
    async encrypt(data, password) {  
      const { salt, iv } = await this.getOptsEncryption();
      const key = await this.getKey(password, salt);
      const message = JSON.stringify(data);
      const encoded = new TextEncoder().encode(message);
    
      const bufferEncrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encoded
      );
      return toHexString(new Uint8Array(bufferEncrypted));
    },
    
    async decrypt(encrypted, password) {
      const { salt, iv } = await this.getOptsEncryption();
      const key = await this.getKey(password, salt);
      const bufferEncrypted = toUint8Array(encrypted);
    
      const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        bufferEncrypted
      );
      const message = new TextDecoder().decode(decrypted);
      return JSON.parse(message);
    },
  },
};