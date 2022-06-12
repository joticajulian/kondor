<template>
  <div class="container">
    <h1>New account</h1>
    <input
      @keyup.enter="accept"
      type="text"
      v-model="name"
      placeholder="Name"
    />
    <button @click="accept" class="">accept</button>
    <button @click="cancel" class="">cancel</button>
  </div>
</template>

<script>
import { Signer } from "koilib";
import { ethers } from "ethers";
import router from "@/index/router";

// mixins
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";

export default {
  data() {
    return {
      name: "",
    };
  },

  mixins: [Storage, ViewHelper],

  methods: {
    async accept() {
      try {
        const mnemonic = this.$store.state.mnemonic;
        if (!mnemonic) throw new Error("No seed phrase found");
        if (!this.name) throw new Error("No name defined");
        const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic);
        const newIndex = this.$store.state.accounts.length;
        const keyPath = `m/44'/659'/${newIndex}'/0/0`;
        const keyNumber = hdNode.derivePath(keyPath);
        const signer = new Signer({
          privateKey: keyNumber.privateKey.slice(2),
        });
        this.$store.state.accounts.push({
          privateKey: signer.getPrivateKey("wif"),
          name: this.name,
          address: signer.getAddress(),
        });

        const encryptedAccounts = await this._getAccounts();
        encryptedAccounts.push({
          mnemonicPath: keyPath,
          name: this.name,
          address: signer.getAddress(),
        });
        await this._setAccounts(encryptedAccounts);
        this.$store.state.currentIndexAccount = newIndex;
        router.back();
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
    },

    cancel() {
      router.back();
    },
  },
};
</script>
<style scoped>
.container {
  min-height: 20em;
  margin: 4em 2em;
}
</style>
