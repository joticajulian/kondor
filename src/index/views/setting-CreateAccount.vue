<template>
  <div class="container">
    <h1>New account</h1>
    <input
      v-model="name"
      type="text"
      placeholder="Name"
      @keyup.enter="accept"
    >
    <button
      class=""
      @click="accept"
    >
      accept
    </button>
    <button
      class=""
      @click="cancel"
    >
      cancel
    </button>
  </div>
</template>

<script>
import router from "@/index/router";
import { HDKoinos } from "../../../lib/HDKoinos";

// mixins
import ViewHelper from "@/shared/mixins/ViewHelper";
import Storage from "@/shared/mixins/Storage";

export default {

  mixins: [Storage, ViewHelper],
  data() {
    return {
      name: "",
    };
  },

  methods: {
    async accept() {
      try {
        const mnemonic = this.$store.state.mnemonic;
        if (!mnemonic) throw new Error("No seed phrase found");
        if (!this.name) throw new Error("No name defined");
        const hdKoinos = new HDKoinos(mnemonic);
        let newIndex = 0;
        this.$store.state.accounts.forEach((acc) => {
          if (acc.keyPath) newIndex += 1;
        });
        const account = hdKoinos.deriveKeyAccount(newIndex, this.name);
        this.$store.state.accounts.push({
          ...account.public,
          ...account.private,
          signers: [],
        });

        const encryptedAccounts = await this._getAccounts();
        encryptedAccounts.push({
          ...account.public,
          signers: [],
        });
        await this._setAccounts(encryptedAccounts);
        this.$store.state.currentIndexAccount =
          this.$store.state.accounts.length - 1;
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
