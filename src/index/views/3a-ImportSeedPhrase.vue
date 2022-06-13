<template>
  <div class="middle">
    <div class="container">
      <h1>Import Seed Phrase</h1>
      <img src="" alt="" />
      <input id="seed" v-model="mnemonic" placeholder="Seed phrase" />
      <input
        id="password1"
        v-model="password1"
        type="password"
        placeholder="Set password"
      />
      <input
        id="password2"
        v-model="password2"
        type="password"
        placeholder="Confirm password"
      />
      <button @click="importSeedPhrase" class="">import now</button>
    </div>
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
      mnemonic: "",
      password1: "",
      password2: "",
    };
  },
  mixins: [Storage, ViewHelper],
  methods: {
    async importSeedPhrase() {
      try {
        if (this.password1 !== this.password2)
          throw new Error("password mismatch");
        const hdKoinos = new HDKoinos(this.mnemonic);
        const account = hdKoinos.deriveKeyAccount(0, "Account 0");
        await this._setMnemonic(
          await this.encrypt(this.mnemonic, this.password1)
        );
        await this._setAccounts([
          {
            ...account.public,
            signers: [],
          },
        ]);

        this.$store.state.mnemonic = this.mnemonic;
        this.$store.state.accounts = [
          {
            ...account.public,
            ...account.private,
            signers: [],
          },
        ];

        this.alertClose();
        router.push("/dashboard");
      } catch (error) {
        this.alertDanger(error.message);
        throw error;
      }
    },
  },
};
</script>
<style scoped>
input {
  margin-bottom: 2em;
}
h1 {
  margin-bottom: 1em;
}
.container {
  font-family: Arial, Helvetica, sans-serif;
  color: var(--kondor-light);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80%;
}
.middle {
  display: flex;
  justify-content: center;
  margin: 2em 0;
}

</style>
