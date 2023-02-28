<template>
  <div class="container">
    <input
      v-model="password"
      type="password"
      placeholder="Password"
      autofocus
      @keyup.enter="unlock"
    >
    <button
      class=""
      @click="unlock"
    >
      {{ labelButton }}
    </button>
  </div>
</template>

<script>
import { Signer } from "koilib";
import Storage from "@/shared/mixins/Storage";
import { HDKoinos } from "../../../lib/HDKoinos";

export default {
  name: "Unlock",
  mixins: [Storage],

  props: {
    labelButton: {
      type: String,
      default: "unlock",
    },
  },

  data() {
    return {
      password: "",
    };
  },

  created() {
    (async () => {
      const password = await this._readSession("password0");
      if (password) {
        this.password = password;
        this.unlock();
      }
    })();
  },

  methods: {
    async unlock() {
      try {
        const encryptedMnemonic = await this._getMnemonic(0);
        const encryptedAccounts = await this._getAccounts();
        let accounts = [];
        let mnemonic = null;
        let hdKoinos = null;
        if (encryptedMnemonic) {
          mnemonic = await this.decrypt(encryptedMnemonic, this.password);
          hdKoinos = new HDKoinos(mnemonic);
        }
        if (!encryptedAccounts || encryptedAccounts.length === 0) {
          throw new Error("No accounts stored in the wallet");
        }
        accounts = await Promise.all(
          encryptedAccounts.map(async (encAccount) => {
            let account;
            if (encAccount.keyPath) {
              account = hdKoinos.deriveKey(encAccount);
            } else {
              let privateKey = "";
              if (encAccount.encryptedPrivateKey) {
                privateKey = await this.decrypt(
                  encAccount.encryptedPrivateKey,
                  this.password
                );

                const sig = Signer.fromWif(privateKey);
                if (sig.getAddress() !== encAccount.address) {
                  throw new Error(
                    `Error in "${encAccount.name}". Expected address: ${
                      encAccount.address
                    }. Derived: ${sig.getAddress()}`
                  );
                }
              }

              account = {
                public: {
                  name: encAccount.name,
                  address: encAccount.address,
                },
                private: {
                  privateKey,
                },
              };
            }

            return {
              ...account.public,
              ...account.private,
              signers: encAccount.signers
                ? encAccount.signers.map((s) => {
                  const signerAcc = hdKoinos.deriveKey(s);
                  return {
                    ...signerAcc.public,
                    ...signerAcc.private,
                  };
                })
                : [],
            };
          })
        );

        this.$store.state.mnemonic0 = mnemonic;
        this.$store.state.accounts = accounts;
        await this._savePasswordInMemory(0, this.password);

        this.$emit("onUnlock", this.password);
      } catch (error) {
        this.$emit("onError", error);
      }
    },
  },
};
</script>
<style scoped>
.container {
  margin: 1em 0;
}
.button {
  width: 100%;
  margin: 0 auto;
  text-align: center;
}
.button button {
  background: none;
  text-decoration: underline;
  color: var(--kondor-purple);
  border: none;
  margin-left: -8px;
}
</style>
