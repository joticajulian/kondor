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
            let acc;
            if (encAccount.mnemonicPath) {
              acc = hdKoinos.deriveKey(encAccount.mnemonicPath);
            } else {
              const privateKey = await this.decrypt(
                encAccount.encryptedPrivateKey,
                this.password
              );
              const sig = Signer.fromWif(privateKey);
              acc = {
                privateKey: sig.getPrivateKey("wif", false),
                address: sig.getAddress(),
              };
            }

            if (acc.address !== encAccount.address) {
              throw new Error(
                `Error in account "${encAccount.name}". Expected address: ${encAccount.address}. Derived: ${acc.address}`
              );
            }

            return {
              privateKey: acc.privateKey,
              name: encAccount.name,
              address: acc.address,
              signers: encAccount.signers
                ? encAccount.signers.map((s) => {
                    const signerAcc = hdKoinos.deriveKey(s.mnemonicPath);
                    if (signerAcc.address !== s.address) {
                      throw new Error(
                        `Error in account "${encAccount.name}", signer "${s.name}". Expected address: ${s.address}. Derived: ${signerAcc.address}`
                      );
                    }
                    return {
                      privateKey: signerAcc.privateKey,
                      name: s.name,
                      address: signerAcc.address,
                    };
                  })
                : [],
            };
          })
        );

        this.$store.state.mnemonic = mnemonic;
        this.$store.state.accounts = accounts;

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
.link {
  border-bottom: 1px dotted white;
  padding-bottom: 8px;
}
.link:hover {
  border-bottom: 2px solid white;
  color: white;
}
</style>
