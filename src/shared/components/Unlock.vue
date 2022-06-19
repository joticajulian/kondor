<template>
  <div class="container">
    <input
      @keyup.enter="unlock"
      type="password"
      v-model="password"
      placeholder="Password"
    />
    <button @click="unlock" class="link">{{ labelButton }}</button>
  </div>
</template>

<script>
import { Signer } from "koilib";
import Storage from "@/shared/mixins/Storage";
import { HDKoinos } from "../../../lib/HDKoinos";

export default {
  name: "Unlock",

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
  mixins: [Storage],

  methods: {
    async unlock() {
      try {
        const encryptedMnemonic = await this._getMnemonic();
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
              const privateKey = await this.decrypt(
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

              account = {
                public: {
                  name: encAccount.name,
                  address: sig.getAddress(),
                },
                private: {
                  privateKey: sig.getPrivateKey("wif", false),
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

        this.$store.state.mnemonic = mnemonic;
        this.$store.state.accounts = accounts;
        this.$store.state.password = this.password;

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
  margin-top: 3em;
  margin-bottom: 2em;
}
</style>
