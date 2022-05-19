<template>
  <div class="container">
    <input
      @keyup.enter="unlock"
      type="password"
      v-model="password"
      placeholder="Password"
    />
    <button @click="unlock" class="link">unlock</button>
  </div>
</template>

<script>
import { Signer } from "koilib";
import { ethers } from "ethers";
import Storage from "@/shared/mixins/Storage";

export default {
  name: "Unlock",
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
        if (encryptedMnemonic) {
          mnemonic = await this.decrypt(encryptedMnemonic, this.password);
          const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic);
          accounts = await Promise.all(
            encryptedAccounts.map(async (encAccount) => {
              const key = hdNode.derivePath(encAccount.mnemonicPath);
              const signer = new Signer({
                privateKey: key.privateKey.slice(2),
              });
              if (signer.getAddress() !== encAccount.address) {
                throw new Error(
                  `Error in account "${encAccount.name}". Expected address: ${
                    encAccount.address
                  }. Derived: ${signer.getAddress()}`
                );
              }
              return {
                privateKey: signer.getPrivateKey("wif"),
                name: encAccount.name,
                address: signer.getAddress(),
              };
            })
          );
        } else {
          if (!encryptedAccounts || encryptedAccounts.length === 0) {
            throw new Error("No accounts stored in the wallet");
          }
          const encAccount = encryptedAccounts[0];
          const privateKey = await this.decrypt(
            encAccount.encryptedPrivateKey,
            this.password
          );
          const signer = Signer.fromWif(privateKey);
          accounts = [
            {
              privateKey,
              name: encAccount.name,
              address: signer.getAddress(),
            },
          ];
        }

        this.$store.state.mnemonic = mnemonic;
        this.$store.state.accounts = accounts;

        this.$emit("onUnlock");
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
