/* eslint-disable no-undef */
import * as storage from "../../../lib/storage";

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
  name: "Storage mixin",

  methods: {
    async _write(key, value) {
      if (process.env.VUE_APP_ENV === "test") {
        this.$store.state.testData[key] = value;
        return;
      }
      return storage.write(key, value);
    },

    async _read(key, strict) {
      if (process.env.VUE_APP_ENV === "test") {
        if (typeof this.$store.state.testData[key] !== "undefined")
          return this.$store.state.testData[key];
        if (strict) throw new Error(`${key} not found, it is undefined`);
        return undefined;
      }
      return storage.read(key, strict);
    },

    async _setMnemonic(encrypted) {
      return this._write("mnemonic", encrypted);
    },

    async _getMnemonic(strict = false) {
      return this._read("mnemonic", strict);
    },

    async _setAccounts(encrypted) {
      return this._write("accounts", encrypted);
    },

    async _getAccounts(strict = false) {
      return this._read("accounts", strict);
    },

    async _setRpcNodes(rpcNodes) {
      return this._write("rpcNodes", rpcNodes);
    },

    async _getRpcNodes(strict = false) {
      let rpcNodes = await this._read("rpcNodes", strict);
      if (!rpcNodes || rpcNodes.length === 0) {
        // store default value
        rpcNodes =
          process.env.VUE_APP_ENV === "test"
            ? ["http://localhost:8081/jsonrpc"]
            : ["http://api.koinos.io:8080"];
        await this._setRpcNodes(rpcNodes);
        rpcNodes = await this._read("rpcNodes", true);
      }
      return rpcNodes;
    },

    async _setChainId(chainId) {
      return this._write("chainId", chainId);
    },

    async _getChainId(strict = false) {
      return this._read("chainId", strict);
    },

    // TODO: remove the following functions and replace them
    // with the ones in storage.ts

    async getOptsEncryption() {
      let saltString = await this._read("salt", false);
      let ivString = await this._read("iv", false);
      if (!saltString || !ivString) {
        saltString = toHexString(
          window.crypto.getRandomValues(new Uint8Array(16))
        );
        ivString = toHexString(
          window.crypto.getRandomValues(new Uint8Array(12))
        );
        await this._write("salt", saltString);
        await this._write("iv", ivString);
      }
      const salt = toUint8Array(saltString).buffer;
      const iv = toUint8Array(ivString).buffer;
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
      const encoded = new TextEncoder().encode(data);

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
      let bufferEncrypted;
      try {
        bufferEncrypted = toUint8Array(encrypted);
      } catch (error) {
        throw new Error(`Invalid encryted value (${encrypted})`);
      }

      let decrypted;
      try {
        decrypted = await window.crypto.subtle.decrypt(
          { name: "AES-GCM", iv },
          key,
          bufferEncrypted
        );
      } catch (error) {
        throw new Error("Invalid password");
      }

      return new TextDecoder().decode(decrypted);
    },
  },
};
