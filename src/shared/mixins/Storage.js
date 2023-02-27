/* eslint-disable no-undef */
import { Signer } from "koilib";
import * as storage from "../../../lib/storage";
import { HDKoinos } from "../../../lib/HDKoinos";

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

    async _setMnemonic(id, encrypted) {
      const _id = id ? id : "";
      return this._write(`mnemonic${_id}`, encrypted);
    },

    async _getMnemonic(id, strict = false) {
      const _id = id ? id : "";
      return this._read(`mnemonic${_id}`, strict);
    },

    async _setPasswordLabels(passwordLabels) {
      return this._write("passwordLabels", passwordLabels);
    },

    async _getPasswordLabels(strict = false) {
      const passwordLabels = await this._read("passwordLabels", strict);
      if (!passwordLabels)
        return [
          {
            label: "main",
          },
        ];
      return passwordLabels;
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
            : ["https://api.koinos.io"];
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

    async _deleteWallet() {
      const passwordLabels = await this._getPasswordLabels();
      for (let i = 0; i < passwordLabels.length; i += 1) {
        await this._setMnemonic(i, null);
        this.$store.state[`mnemonic${i}`] = "";
        this.$store.state[`password${i}`] = "";
      }
      await this._setAccounts([]);
      this.$store.state.accounts = [];
    },

    _savePasswordInMemory(id, password) {
      this.$store.state[`password${id}`] = password;
    },

    async _saveSeedPhraseInMemory(id, mnemonic) {
      if (await this._getMnemonic(id))
        throw new Error(`the seed phrase #${id} already exist`);

      this.$store.state[`mnemonic${id}`] = mnemonic;
    },

    async _storeSeedPhrase(id) {
      let encryptedMnemonic = null;
      if (this.$store.state[`mnemonic${id}`]) {
        encryptedMnemonic = await this.encrypt(
          this.$store.state[`mnemonic${id}`],
          this.$store.state[`password${id}`]
        );
      }
      await this._setMnemonic(id, encryptedMnemonic);
    },

    async _addAccount(params) {
      let { name, privateKey, passwordId, watchMode, address } = params;
      if (!name) throw new Error("No name defined");

      let privateKeyInMemory;
      let accountStorage;
      if (watchMode) {
        // account in watch mode
        if (!address) throw new Error("No address defined for watch mode");

        privateKeyInMemory = "";
        accountStorage = {
          name,
          address,
          signers: [],
        };
      } else if (privateKey) {
        // custom private key, not derived from mnemonic
        const signer = Signer.fromWif(privateKey);

        privateKeyInMemory = privateKey;
        accountStorage = {
          name,
          encryptedPrivateKey: await this.encrypt(
            privateKey,
            this.$store.state[`password${passwordId}`]
          ),
          passwordId,
          address: signer.getAddress(),
          signers: [],
        };
      } else {
        // derived from the mnemonic
        // Note: "mnemonic${passwordId}" is not used because by design
        // all accounts are derived from mnemonic0
        const mnemonic = this.$store.state.mnemonic0;
        if (!mnemonic) throw new Error("No seed phrase found");
        const { accounts } = this.$store.state;
        let accountIndex = 0;
        accounts.forEach((acc) => {
          if (acc.keyPath) accountIndex += 1;
        });
        const hdKoinos = new HDKoinos(mnemonic);
        const account = hdKoinos.deriveKeyAccount(accountIndex, name);

        privateKeyInMemory = account.private.privateKey;
        accountStorage = {
          ...account.public,
          signers: [],
        };
      }

      // save new account in memory
      this.$store.state.accounts.push({
        ...accountStorage,
        privateKey: privateKeyInMemory,
      });

      // save new account in storage
      const encryptedAccounts = (await this._getAccounts()) || [];
      encryptedAccounts.push(accountStorage);
      await this._setAccounts(encryptedAccounts);
    },

    async _addSigner(params) {
      let { name, accIndex, privateKey, passwordId, watchMode, address } =
        params;
      if (!name) throw new Error("No name defined");

      let privateKeyInMemory;
      let signerStorage;
      if (watchMode) {
        // signer in watch mode
        if (!address) throw new Error("No address defined for watch mode");

        privateKeyInMemory = "";
        signerStorage = {
          name,
          address,
        };
      } else if (privateKey) {
        // custom private key, not derived from mnemonic
        const signer = Signer.fromWif(privateKey);

        privateKeyInMemory = privateKey;
        signerStorage = {
          name,
          encryptedPrivateKey: await this.encrypt(
            privateKey,
            this.$store.state[`password${passwordId}`]
          ),
          passwordId,
          address: signer.getAddress(),
        };
      } else {
        // derived from the mnemonic
        const mnemonic = this.$store.state[`mnemonic${passwordId}`];
        if (!mnemonic) throw new Error("No seed phrase found");
        const { keyPath, signers } = this.$store.state.accounts[accIndex];
        let signerIndex = 0;
        signers.forEach((sig) => {
          if (sig.keyPath && sig.passwordId === passwordId) signerIndex += 1;
        });

        const hdKoinos = new HDKoinos(mnemonic);
        const { accountIndex, signerIndex: zeroIndex } =
          HDKoinos.parsePath(keyPath);
        if (zeroIndex)
          throw new Error(`Invalid keyPath ${keyPath} for accounts`);

        const signerAcc = hdKoinos.deriveKeySigner(
          accountIndex,
          signerIndex,
          name
        );

        privateKeyInMemory = signerAcc.private.privateKey;
        signerStorage = {
          ...signerAcc.public,
          passwordId,
        };
      }

      // save new signer in memory
      this.$store.state.accounts[accIndex].signers.push({
        ...signerStorage,
        privateKey: privateKeyInMemory,
      });

      // save new signer in storage
      const encryptedAccounts = await this._getAccounts();
      encryptedAccounts[accIndex].signers.push(signerStorage);
      await this._setAccounts(encryptedAccounts);
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
