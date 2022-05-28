<template>
  <div class="container">
    <input
      @keyup.enter="unlock"
      type="password"
      v-model="password"
      placeholder="Password"
    />
    <button @click="unlock">unlock</button>
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
            encryptedAccounts.map((encAccount) => {
              const keyAcc = hdNode.derivePath(encAccount.mnemonicPath);
              const signerAcc = new Signer({
                privateKey: keyAcc.privateKey.slice(2),
              });
              if (signerAcc.getAddress() !== encAccount.address) {
                throw new Error(
                  `Error in account "${encAccount.name}". Expected address: ${
                    encAccount.address
                  }. Derived: ${signerAcc.getAddress()}`
                );
              }
              return {
                privateKey: signerAcc.getPrivateKey("wif"),
                name: encAccount.name,
                address: signerAcc.getAddress(),
                signers: encAccount.signers
                  ? encAccount.signers.map((s) => {
                      const keySigner = hdNode.derivePath(s.mnemonicPath);
                      const signer = new Signer({
                        privateKey: keySigner.privateKey.slice(2),
                      });
                      if (signer.getAddress() !== s.address) {
                        throw new Error(
                          `Error in account "${encAccount.name}", signer "${
                            s.name
                          }". Expected address: ${
                            s.address
                          }. Derived: ${signer.getAddress()}`
                        );
                      }
                      return {
                        privateKey: signer.getPrivateKey("wif"),
                        name: s.name,
                        address: signer.getAddress(),
                      };
                    })
                  : [],
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
input {
  width: 98%;
}
.container {
  margin-top: 3em;
  margin-bottom: 2em;
}

</style>
