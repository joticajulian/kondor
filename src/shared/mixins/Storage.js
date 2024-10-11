/* eslint-disable no-undef */
import { Signer } from "koilib";
import * as storage from "../../../lib/storage";
import { HDKoinos } from "../../../lib/HDKoinos";
import abiClaimMainnet from "../assets/abiClaimMainnet.json";
// import abiKoinMainnet from "../assets/abiKoinMainnet.json";
// import abiKoinHarbinger from "../assets/abiKoinHarbinger.json";
import abiPobMainnet from "../assets/abiPobMainnet.json";
import abiPobHarbinger from "../assets/abiPobHarbinger.json";
// import abiVhpMainnet from "../assets/abiVhpMainnet.json";
// import abiVhpHarbinger from "../assets/abiVhpHarbinger.json";
import abiBurnkoinMainnet from "../assets/abiBurnkoinMainnet.json";
import abiBurnkoinTokenMainnet from "../assets/abiBurnkoinTokenMainnet.json";
import abiFogata from "../assets/abiFogata.json";
import abiNicknamesMainnet from "../assets/abiNicknamesMainnet.json";
import abiNicknamesHarbinger from "../assets/abiNicknamesHarbinger.json";
import abiKapNameService from "../assets/abiKapNameService.json";
import abiFreeManaSharer from "../assets/abiFreeManaSharer.json";

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

    async _writeSession(key, value) {
      if (process.env.VUE_APP_ENV === "test") {
        this.$store.state.testDataSession[key] = value;
        return;
      }
      return new Promise((resolve) => {
        const data = {};
        data[key] = value;
        chrome.storage.session.set(data, function () {
          resolve();
        });
      });
    },

    async _readSession(key, strict) {
      if (process.env.VUE_APP_ENV === "test") {
        if (typeof this.$store.state.testDataSession[key] !== "undefined")
          return this.$store.state.testDataSession[key];
        if (strict) throw new Error(`${key} not found, it is undefined`);
        return undefined;
      }
      return new Promise((resolve, reject) => {
        chrome.storage.session.get([key], function (result) {
          if (Object.keys(result).length !== 0) return resolve(result[key]);
          if (strict)
            return reject(new Error(`${key} not found, it is undefined`));
          return resolve(undefined);
        });
      });
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

    async _setCurrentNetwork(currentNetwork) {
      if (process.env.VUE_APP_ENV === "test") {
        return this._write("currentNetwork", currentNetwork);
      }
      return storage.setCurrentNetwork(currentNetwork);
    },

    async _getCurrentNetwork(strict = false) {
      if (process.env.VUE_APP_ENV === "test") {
        return this._read("currentNetwork", strict);
      }
      return storage.getCurrentNetwork(strict);
    },

    async _setNetworks(networks) {
      if (process.env.VUE_APP_ENV === "test") {
        return this._write("networks", networks);
      }
      return storage.setNetworks(networks);
    },

    async _getNetworks(strict = false) {
      if (process.env.VUE_APP_ENV === "test") {
        return this._read("networks", strict);
      }
      return storage.getNetworks(strict);
    },

    async _setTokens(tokens) {
      return this._write("tokens", tokens);
    },

    async _getTokens(strict = false) {
      let tokens = await this._read("tokens", strict);
      if (!tokens) {
        tokens = [
          {
            network: "mainnet",
            contractId: "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL",
            nickname: "koin",
            symbol: "KOIN",
            decimals: 8,
            image:
              "https://files.peakd.com/file/peakd-hive/jga/AJizr3uSbFj2e8s3k5LBeARYf7g8p4xUrRNbHGEwNuEm25sAykFpvkLMZiGNgvG.png",
            /*
            // Load the token for a specific list of addresses
            // Default: all addresses
            addresses: [],

            // Exceptions to the previous rule
            noAddresses: [],
            */
          },
          {
            network: "mainnet",
            contractId: "18tWNU7E4yuQzz7hMVpceb9ixmaWLVyQsr",
            nickname: "vhp",
            symbol: "VHP",
            decimals: 8,
            image:
              "https://files.peakd.com/file/peakd-hive/jga/AJdLAV524tVfwnkV7iCjPFE2HvArB8pDyLdNVZfEQYBUGhWJ7TMniKx8uYuoQyh.png",
          },
          {
            network: "harbinger",
            contractId: "1FaSvLjQJsCJKq5ybmGsMMQs8RQYyVv8ju",
            nickname: "koin",
            symbol: "tKOIN",
            decimals: 8,
            image:
              "https://files.peakd.com/file/peakd-hive/jga/AJizr3uSbFj2e8s3k5LBeARYf7g8p4xUrRNbHGEwNuEm25sAykFpvkLMZiGNgvG.png",
          },
          {
            network: "harbinger",
            contractId: "17n12ktwN79sR6ia9DDgCfmw77EgpbTyBi",
            nickname: "vhp",
            symbol: "VHP",
            decimals: 8,
            image:
              "https://files.peakd.com/file/peakd-hive/jga/AJdLAV524tVfwnkV7iCjPFE2HvArB8pDyLdNVZfEQYBUGhWJ7TMniKx8uYuoQyh.png",
          },
        ];
      }
      return tokens;
    },

    async _setAbi(network, contractId, abi) {
      return this._write(`${network}-${contractId}`, abi);
    },

    async _getAbi(network, contractId, strict = false) {
      switch (network) {
      case "mainnet": {
        switch (contractId) {
        // case "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL":
        //   return abiKoinMainnet;
        // case "18tWNU7E4yuQzz7hMVpceb9ixmaWLVyQsr":
        //   return abiVhpMainnet;
        case "159myq5YUhhoVWu3wsHKHiJYKPKGUrGiyv":
          return abiPobMainnet;
        case "18zw3ZokdfHtudzaWAUnU4tUvKzKiJeN76":
          return abiClaimMainnet;
        case "1NsQbH5AhQXgtSNg1ejpFqTi2hmCWz1eQS":
          return abiBurnkoinMainnet;
        case "1NHReq2apWsQ6UPBjNqcV3ABsj88Ncimiy":
          return abiBurnkoinTokenMainnet;
        case "1DGNQQimsyBQajzQdWXY96m84YyDC2pUpB":
        case "1MbsVfNw6yzQqA8499d8KQj8qdLyRs8CzW":
        case "14iHqMGBznBM7xJXhkrQ266FgoFdymCqLM":
        case "1KfD7n93LnnihyygopWUVTkbtWVe5aXXGW":
        case "18UYKhWVCbTpFs8oYC54xoiCQQthhEkX7m":
        case "15jueaBcMieDCMGw6wAmEK6cNSUVicknG1":
          return abiFogata;
        case "13tmzDmfqCsbYT26C4CmKxq86d33senqH3":
          return abiKapNameService;
        case "1KD9Es7LBBjA1FY3ViCgQJ7e6WH1ipKbhz":
          return abiNicknamesMainnet;
        case "162GhJwsciDiKsgwzj2t6VoFHt3RMzGKdG":
          return abiFreeManaSharer;
        default:
          break;
        }
        break;
      }
      case "harbinger": {
        switch (contractId) {
        // case "1FaSvLjQJsCJKq5ybmGsMMQs8RQYyVv8ju":
        //   return abiKoinHarbinger;
        // case "17n12ktwN79sR6ia9DDgCfmw77EgpbTyBi":
        //   return abiVhpHarbinger;
        case "1MAbK5pYkhp9yHnfhYamC3tfSLmVRTDjd9":
          return abiPobHarbinger;
        case "1KXsC2bSnKAMAZ51gq3xxKBo74a7cDJjkR":
          return abiNicknamesHarbinger;
        case "1A5ovJ6htWqnh8qDiXPQMuWmqxtVr2q3Gn":
          return abiFreeManaSharer;
        default:
          break;
        }
        break;
      }
      default:
        break;
      }
      return this._read(`${network}-${contractId}`, strict);
    },

    async _deleteWallet() {
      const passwordLabels = await this._getPasswordLabels();
      for (let i = 0; i < passwordLabels.length; i += 1) {
        await this._setMnemonic(i, null);
        this.$store.state[`mnemonic${i}`] = "";
        await this._savePasswordInMemory(i, "");
      }
      await this._setAccounts([]);
      this.$store.state.accounts = [];
    },

    async _savePasswordInMemory(id, password) {
      this.$store.state[`password${id}`] = password;
      await this._writeSession(`password${id}`, password);
    },

    async _removePasswordsFromSession() {
      // TODO: Get the whole list of passwords using getPasswordLabels
      await this._writeSession("password0", null);
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

    async _setCurrentIndexAccount(index) {
      return this._write("currentIndexAccount", index);
    },

    async _getCurrentIndexAccount(strict = false) {
      return this._read("currentIndexAccount", strict);
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
