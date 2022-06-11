<template>
  <div class="container">
    <h1>New account</h1>
    <input
      @keyup.enter="accept"
      type="text"
      v-model="name"
      placeholder="Name"
    />
    <button @click="accept" class="link">accept</button>
    <button @click="cancel" class="link">cancel</button>
  </div>
</template>

<script>
import router from "@/index/router";
import { HDKoinos } from "../../../lib/HDKoinos";

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
        const hdKoinos = new HDKoinos(mnemonic);
        const newIndex = this.$store.state.accounts.length;
        const acc = hdKoinos.deriveKeyAccount(newIndex);
        this.$store.state.accounts.push({
          privateKey: acc.privateKey,
          name: this.name,
          address: acc.address,
        });

        const encryptedAccounts = await this._getAccounts();
        encryptedAccounts.push({
          mnemonicPath: acc.keyPath,
          name: this.name,
          address: acc.address,
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
